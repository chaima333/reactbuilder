"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.logoutController = exports.refreshTokenController = exports.loginController = exports.registerController = void 0;
const zod_1 = require("zod");
const user_service_1 = require("../services/user.service");
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_util_1 = require("../shared/auth.util");
const token_service_1 = require("../services/token.service");
const models_1 = require("../models");
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
/**
 * Inscription d'un utilisateur avec rôle optionnel
 * Rôle par défaut: Viewer
 */
const registerController = async (req, res) => {
    const parsedData = registerSchema.safeParse(req.body);
    if (!parsedData.success) {
        // ✅ Correction : utiliser parsedData.error.format() ou parsedData.error.issues
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
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await (0, user_service_1.getUserByEmail)(email);
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "User already exists!"
        });
    }
    // Hasher le mot de passe
    const hashedPassword = bcrypt_1.default.hashSync(password, 10);
    // Créer l'utilisateur avec le rôle (Viewer par défaut)
    const newUser = await (0, user_service_1.addUser)(name, email, hashedPassword, role || 'Viewer', false);
    // Préparer la réponse sans le mot de passe
    const userJson = newUser.toJSON();
    delete userJson.password;
    return res.status(201).json({
        success: true,
        message: "User registered successfully Waiting for admin approval.",
        user: userJson
    });
};
exports.registerController = registerController;
/**
 * Connexion d'un utilisateur
 */
const loginController = async (req, res) => {
    const parsedData = loginSchema.safeParse(req.body);
    if (!parsedData.success) {
        // ✅ Correction
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
    // Vérifier l'utilisateur
    const user = await (0, user_service_1.getUserByEmail)(email);
    if (!user) {
        return res.status(400).json({
            success: false,
            message: "User not found."
        });
    }
    // Vérifier le mot de passe
    const isPasswordValid = bcrypt_1.default.compareSync(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({
            success: false,
            message: "Invalid password."
        });
    }
    // Générer les tokens
    const accessToken = (0, auth_util_1.generateToken)({ userId: user.id, type: "access" });
    const refreshToken = (0, auth_util_1.generateToken)({ userId: user.id, type: "refresh" });
    // Supprimer les anciens tokens
    await (0, token_service_1.deleteToken)(user.id);
    // Sauvegarder les nouveaux tokens
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
/**
 * Rafraîchir le token d'accès
 */
const refreshTokenController = async (req, res) => {
    const parsedData = refreshTokenSchema.safeParse(req.body);
    if (!parsedData.success) {
        // ✅ Correction
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
    // Vérifier le token en base de données
    const dbRefreshToken = await (0, token_service_1.getToken)(refreshToken);
    if (!dbRefreshToken || dbRefreshToken.type !== "refresh") {
        return res.status(400).json({
            success: false,
            message: "Invalid token or expired."
        });
    }
    const userId = dbRefreshToken.userId;
    // Générer de nouveaux tokens
    const accessToken = (0, auth_util_1.generateToken)({ userId, type: "access" });
    const newRefreshToken = (0, auth_util_1.generateToken)({ userId, type: "refresh" });
    // Supprimer les anciens tokens
    await (0, token_service_1.deleteToken)(userId);
    // Sauvegarder le nouveau refresh token
    await (0, token_service_1.addToken)(newRefreshToken, "refresh", userId);
    return res.status(200).json({
        success: true,
        accessToken,
        refreshToken: newRefreshToken
    });
};
exports.refreshTokenController = refreshTokenController;
/**
 * Déconnexion
 */
const logoutController = async (req, res) => {
    const parsedData = refreshTokenSchema.safeParse(req.body);
    if (!parsedData.success) {
        // ✅ Correction
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
    // Vérifier la validité du token
    const isTokenValid = (0, auth_util_1.verifyToken)(refreshToken);
    if (!isTokenValid) {
        return res.status(400).json({
            success: false,
            message: "Invalid token or expired."
        });
    }
    // Vérifier le token en base de données
    const dbRefreshToken = await (0, token_service_1.getToken)(refreshToken);
    if (!dbRefreshToken || dbRefreshToken.type !== "refresh") {
        return res.status(400).json({
            success: false,
            message: "Invalid token."
        });
    }
    const userId = dbRefreshToken.userId;
    // Supprimer tous les tokens de l'utilisateur
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
        // Vérifier si l'email est déjà utilisé par un autre utilisateur
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
