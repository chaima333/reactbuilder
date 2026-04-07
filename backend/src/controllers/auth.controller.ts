import { Response } from "express";
import { z } from "zod";
import { addUser, getUserByEmail } from "../services/user.service";
import bcrypt from "bcrypt";
import { AuthRequest, generateToken, verifyToken } from "../shared/auth.util";
import { addToken, deleteToken, getToken } from "../services/token.service";
import { User } from "../models";

// Au lieu de (req: Request), utilise (req: AuthRequest)
export const myController = async (req: AuthRequest, res: Response) => {
 const { id } = req.params;   // ✅ Maintenant reconnu
  const { name } = req.body;   // ✅ Maintenant reconnu
  const { page } = req.query;  // ✅ Maintenant reconnu
  const authHeader = req.headers.authorization;
}

// Schéma de validation pour l'inscription
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

// Schéma de validation pour la connexion
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

// Schéma pour le refresh token
const refreshTokenSchema = z.object({
  refreshToken: z.string()
});

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
    
    return res.status(400).json({
      success: false,
      message: "User not found."
    });
  }

  console.log("🔍 User from DB:", {
    id: user.id,
    email: user.email,
    role: user.role,
    isApproved: user.isApproved
  });
  // Vérifie que le mot de passe existe
  if (!user.password) {
    return res.status(400).json({ success: false, message: "Invalid user data." });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid password."
    });
  }

  const accessToken = generateToken({ userId: user.id, type: "access", role: user.role });
const refreshToken = generateToken({ userId: user.id, type: "refresh", role: user.role });
  await deleteToken(user.id);
  await addToken(accessToken, "access", user.id);
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
      role: user.role
    }
  });
};

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

  const dbRefreshToken = await getToken(refreshToken);
  if (!dbRefreshToken || dbRefreshToken.type !== "refresh") {
    return res.status(400).json({
      success: false,
      message: "Invalid token or expired."
    });
  }

  const userId = dbRefreshToken.userId;

const user = await User.findByPk(userId);

const accessToken = generateToken({ 
  userId, 
  type: "access", 
  role: user?.role 
});
  const newRefreshToken = generateToken({ userId, type: "refresh" });

  await deleteToken(userId);
  await addToken(newRefreshToken, "refresh", userId);

  return res.status(200).json({
    success: true,
    accessToken,
    refreshToken: newRefreshToken
  });
};

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

  const isTokenValid = verifyToken(refreshToken);
  if (!isTokenValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid token or expired."
    });
  }

  const dbRefreshToken = await getToken(refreshToken);
  if (!dbRefreshToken || dbRefreshToken.type !== "refresh") {
    return res.status(400).json({
      success: false,
      message: "Invalid token."
    });
  }

  const userId = dbRefreshToken.userId;
  await deleteToken(userId);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully."
  });
};

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