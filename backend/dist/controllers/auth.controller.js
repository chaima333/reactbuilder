"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.logoutController = exports.refreshTokenController = exports.loginController = exports.registerController = exports.myController = void 0;
const zod_1 = require("zod");
const user_service_1 = require("../services/user.service");
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_util_1 = require("../shared/auth.util");
const token_service_1 = require("../services/token.service");
const models_1 = require("../models");
// Au lieu de (req: Request), utilise (req: AuthRequest)
const myController = async (req, res) => {
    const { id } = req.params; // ✅ Maintenant reconnu
    const { name } = req.body; // ✅ Maintenant reconnu
    const { page } = req.query; // ✅ Maintenant reconnu
    const authHeader = req.headers.authorization;
};
exports.myController = myController;
// Schéma de validation pour l'inscription
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    email: zod_1.z.string().email(),
    password: zod_1.z.string()
        .min(6)
        .max(100)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: "Password must contain 1 uppercase, 1 lowercase, 1 number"
    }),
    role: zod_1.z.enum(['Admin', 'Editor', 'Viewer']).optional().default('Viewer')
});
// Schéma de validation pour la connexion
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6).max(100)
});
// Schéma pour le refresh token
const refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string()
});
const registerController = async (req, res) => {
    const parsedData = registerSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: parsedData.error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message
            }))
        });
    }
    const { name, email, password, role } = parsedData.data;
    const existingUser = await (0, user_service_1.getUserByEmail)(email);
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "User already exists!"
        });
    }
    const hashedPassword = bcrypt_1.default.hashSync(password, 10);
    const newUser = await (0, user_service_1.addUser)(name, email, hashedPassword, role || 'Viewer', false);
    const userJson = newUser.toJSON();
    delete userJson.password;
    return res.status(201).json({
        success: true,
        message: "User registered successfully. Waiting for admin approval.",
        user: userJson
    });
};
exports.registerController = registerController;
const loginController = async (req, res) => {
    const parsedData = loginSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: parsedData.error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message
            }))
        });
    }
    const { email, password } = parsedData.data;
    const user = await (0, user_service_1.getUserByEmail)(email);
    console.log("🔍 RAW user data:", user?.get({ plain: true }));
    console.log("🔍 User from DB:", {
        id: user.id,
        email: user.email,
        role: user.role,
        hasPassword: !!user.password
    });
    // FORCE le rôle pour admin@test.com
    if (user.email === 'admin@test.com') {
        user.role = 'Admin';
        console.log("🔧 FORCED role to Admin");
    }
    // Vérification critique
    if (!user.password) {
        console.error("❌ User password is missing in database!");
        return res.status(500).json({ success: false, message: "Internal server error: missing password" });
    }
    const isPasswordValid = bcrypt_1.default.compareSync(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ success: false, message: "Invalid password." });
    }
    const accessToken = (0, auth_util_1.generateToken)({ userId: user.id, type: "access", role: user.role });
    const refreshToken = (0, auth_util_1.generateToken)({ userId: user.id, type: "refresh", role: user.role });
    await (0, token_service_1.deleteToken)(user.id);
    await (0, token_service_1.addToken)(accessToken, "access", user.id);
    await (0, token_service_1.addToken)(refreshToken, "refresh", user.id);
    return res.status(200).json({
        success: true,
        message: "Login successful",
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
};
exports.loginController = loginController;
const refreshTokenController = async (req, res) => {
    const parsedData = refreshTokenSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: parsedData.error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message
            }))
        });
    }
    const { refreshToken } = parsedData.data;
    const dbRefreshToken = await (0, token_service_1.getToken)(refreshToken);
    if (!dbRefreshToken || dbRefreshToken.type !== "refresh") {
        return res.status(400).json({
            success: false,
            message: "Invalid token or expired."
        });
    }
    const userId = dbRefreshToken.userId;
    const user = await models_1.User.findByPk(userId);
    const accessToken = (0, auth_util_1.generateToken)({
        userId,
        type: "access",
        role: user?.role
    });
    const newRefreshToken = (0, auth_util_1.generateToken)({ userId, type: "refresh" });
    await (0, token_service_1.deleteToken)(userId);
    await (0, token_service_1.addToken)(newRefreshToken, "refresh", userId);
    return res.status(200).json({
        success: true,
        accessToken,
        refreshToken: newRefreshToken
    });
};
exports.refreshTokenController = refreshTokenController;
const logoutController = async (req, res) => {
    const parsedData = refreshTokenSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: parsedData.error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message
            }))
        });
    }
    const { refreshToken } = parsedData.data;
    const isTokenValid = (0, auth_util_1.verifyToken)(refreshToken);
    if (!isTokenValid) {
        return res.status(400).json({
            success: false,
            message: "Invalid token or expired."
        });
    }
    const dbRefreshToken = await (0, token_service_1.getToken)(refreshToken);
    if (!dbRefreshToken || dbRefreshToken.type !== "refresh") {
        return res.status(400).json({
            success: false,
            message: "Invalid token."
        });
    }
    const userId = dbRefreshToken.userId;
    await (0, token_service_1.deleteToken)(userId);
    return res.status(200).json({
        success: true,
        message: "Logged out successfully."
    });
};
exports.logoutController = logoutController;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email, avatar } = req.body;
        const user = await models_1.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        if (email && email !== user.email) {
            const existingUser = await models_1.User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
            }
        }
        await user.update({ name, email, avatar });
        res.json({
            success: true,
            message: 'Profil mis à jour',
            user: user.toJSON()
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.updateProfile = updateProfile;
