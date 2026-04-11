import { Response } from "express";
import { z } from "zod";
import { addUser, getUserByEmail } from "../services/user.service";
import bcrypt from "bcrypt";
import { AuthRequest, generateToken, verifyToken } from "../shared/auth.util";
import { addToken, deleteToken, getToken, revokeUserTokens } from "../services/token.service";
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

  let userRole = user.role;
  if (user.email === 'admin@test.com') {
    userRole = 'Admin';
    console.log("🔧 FORCED role to Admin");
  }

  if (!user.password) {
    console.error("❌ User password is missing in database!");
    return res.status(500).json({ success: false, message: "Internal server error" });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  await revokeUserTokens(user.id);

  const accessToken = generateToken({ userId: user.id, type: "access", role: userRole });
  const refreshToken = generateToken({ userId: user.id, type: "refresh", role: userRole });

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

  const dbRefreshToken = await getToken(refreshToken);
  
  if (!dbRefreshToken || dbRefreshToken.type !== "refresh") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token"
    });
  }

  if (dbRefreshToken.isRevoked) {
    return res.status(401).json({
      success: false,
      message: "Token has been revoked"
    });
  }

  if (dbRefreshToken.expiresAt && new Date(dbRefreshToken.expiresAt) < new Date()) {
    await dbRefreshToken.update({ isRevoked: true });
    return res.status(401).json({
      success: false,
      message: "Refresh token expired"
    });
  }

  const decoded = verifyToken(refreshToken);
  if (!decoded) {
    await dbRefreshToken.update({ isRevoked: true });
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token"
    });
  }

  const userId = dbRefreshToken.userId;

  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User not found"
    });
  }

  await dbRefreshToken.update({ isRevoked: true });

  let userRole = user.role;
  if (user.email === 'admin@test.com') {
    userRole = 'Admin';
  }

  const accessToken = generateToken({ userId, type: "access", role: userRole });
  const newRefreshToken = generateToken({ userId, type: "refresh", role: userRole });

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

// ========== GOOGLE AUTH ==========
export const googleAuthController = async (req: AuthRequest, res: Response) => {
  try {
    const { email, name, googleId, avatar } = req.body;

    console.log('📡 Google auth request:', { email, name, googleId });

    let user = await User.findOne({ where: { email } });

    if (!user) {
      console.log('👤 Création nouvel utilisateur Google');
      user = await User.create({
        email,
        name: name || email.split('@')[0],
        googleId,
        avatar: avatar || null,
        isApproved: true,
        role: 'Viewer',
        password: '',
      } as any);
    } else if (!user.googleId) {
      console.log('🔗 Liaison compte existant à Google');
      await user.update({ googleId, avatar });
    } else {
      console.log('✅ Utilisateur existe déjà avec Google');
    }

    await revokeUserTokens(user.id);

    const accessToken = generateToken({ 
      userId: user.id, 
      type: "access", 
      role: user.role 
    });
    
    const refreshToken = generateToken({ 
      userId: user.id, 
      type: "refresh", 
      role: user.role 
    });

    await addToken(refreshToken, "refresh", user.id);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('❌ Google auth error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'authentification Google' 
    });
  }
};