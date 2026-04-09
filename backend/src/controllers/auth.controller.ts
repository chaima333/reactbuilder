import { Response } from "express";
import { z } from "zod";
import { addUser, getUserByEmail } from "../services/user.service";
import bcrypt from "bcrypt";
import { AuthRequest, generateToken, verifyToken } from "../shared/auth.util";
import { User } from "../models";

// Schémas de validation
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  password: z.string()
    .min(6)
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "Password must contain 1 uppercase, 1 lowercase, 1 number"
    }),
  role: z.enum(['Admin', 'Editor', 'Viewer']).optional().default('Viewer')
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

const refreshTokenSchema = z.object({
  refreshToken: z.string()
});

// ========== HELPER : Générer des tokens (sans exp dans le payload) ==========
const generateTokens = async (userId: number, userRole: string) => {
  // Access token (15 minutes)
  const accessToken = generateToken({ 
    userId, 
    type: "access", 
    role: userRole
  });

  // Refresh token (7 jours)
  const refreshToken = generateToken({ 
    userId, 
    type: "refresh"
  });

  return { accessToken, refreshToken };
};

// ========== INSCRIPTION ==========
export const registerController = async (req: AuthRequest, res: Response) => {
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

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User already exists!"
    });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = await addUser(name, email, hashedPassword, role || 'Viewer', false);

  const userJson = newUser.toJSON() as any;
  delete userJson.password;

  return res.status(201).json({
    success: true,
    message: "User registered successfully. Waiting for admin approval.",
    user: userJson
  });
};

// ========== CONNEXION ==========
export const loginController = async (req: AuthRequest, res: Response) => {
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

  const user = await getUserByEmail(email);
  
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  // Force le rôle pour admin@test.com
  let userRole = user.role;
  if (user.email === 'admin@test.com') {
    userRole = 'Admin';
  }

  // Vérification du mot de passe
  if (!user.password) {
    console.error("❌ User password is missing in database!");
    return res.status(500).json({ success: false, message: "Internal server error" });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  // Nettoyer les anciens refresh tokens de l'utilisateur
  await revokeUserTokens(user.id);

  // Générer les nouveaux tokens
  const { accessToken, refreshToken } = await generateTokens(user.id, userRole);

  // Stocker le refresh token
  await addToken(refreshToken, "refresh", user.id);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: userRole
    }
  });
};

// ========== REFRESH TOKEN ==========
export const refreshTokenController = async (req: AuthRequest, res: Response) => {
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

  // 1️⃣ Vérifier si le token existe en base
  const dbRefreshToken = await getToken(refreshToken);
  
  if (!dbRefreshToken || dbRefreshToken.type !== "refresh") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token"
    });
  }

  // 2️⃣ Vérifier si le token est révoqué
  if (dbRefreshToken.isRevoked) {
    return res.status(401).json({
      success: false,
      message: "Token has been revoked"
    });
  }

  // 3️⃣ Vérifier l'expiration en base
  if (dbRefreshToken.expiresAt && new Date(dbRefreshToken.expiresAt) < new Date()) {
    await dbRefreshToken.update({ isRevoked: true });
    return res.status(401).json({
      success: false,
      message: "Refresh token expired"
    });
  }

  // 4️⃣ Vérifier et décoder le JWT
  const decoded = verifyToken(refreshToken);
  if (!decoded) {
    await dbRefreshToken.update({ isRevoked: true });
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token"
    });
  }

  const userId = dbRefreshToken.userId;

  // 5️⃣ Récupérer l'utilisateur
  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User not found"
    });
  }

  // 6️⃣ Rotation : Révoquer l'ancien refresh token
  await dbRefreshToken.update({ isRevoked: true });

  // 7️⃣ Générer de NOUVEAUX tokens
  let userRole = user.role;
  if (user.email === 'admin@test.com') {
    userRole = 'Admin';
  }

  const { accessToken, refreshToken: newRefreshToken } = await generateTokens(userId, userRole);

  // 8️⃣ Stocker le NOUVEAU refresh token
  await addToken(newRefreshToken, "refresh", userId);

  return res.status(200).json({
    success: true,
    accessToken,
    refreshToken: newRefreshToken
  });
};

// ========== DÉCONNEXION ==========
export const logoutController = async (req: AuthRequest, res: Response) => {
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

  // Révoquer le refresh token spécifique
  const dbRefreshToken = await getToken(refreshToken);
  if (dbRefreshToken) {
    await dbRefreshToken.update({ isRevoked: true });
  }

  return res.status(200).json({
    success: true,
    message: "Logged out successfully."
  });
};

// ========== MISE À JOUR PROFIL ==========
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { name, email, avatar } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
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
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
// ========== RÉVOCATION DES TOKENS ==========
export const revokeUserTokens = async (userId: number) => {
  const tokens = await Token.findAll({ where: { userId } });
  for (const token of tokens) {
    await token.update({ isRevoked: true });
  }
};

// ========== FONCTIONS UTILITAIRES POUR LES TOKENS ==========
const addToken = async (token: string, type: string, userId: number) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days for refresh tokens
  
  return await Token.create({
    token,
    type,
    userId,
    expiresAt,
    isRevoked: false
  });
};

const getToken = async (token: string) => {
  return await Token.findOne({ where: { token } });
};

function revokeUserTokens(id: number) {
  throw new Error("Function not implemented.");
}
