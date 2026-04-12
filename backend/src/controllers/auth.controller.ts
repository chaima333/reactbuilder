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

    let user = await User.findOne({ where: { email } });

    // 🟡 USER NOT EXISTS → CREATE PENDING
    if (!user) {
      await User.create({
        email,
        name: name || email.split('@')[0],
        googleId,
        avatar: avatar || null,
        isApproved: false,
        role: 'Viewer',
        password: '',
      } as any);

      return res.json({
        state: "PENDING",
        message: "Account created. Waiting admin approval"
      });
    }

    // 🟡 EXISTS BUT NOT APPROVED
    if (!user.isApproved) {
         return res.status(200).json({
  state: "PENDING",
  message: "Waiting admin approval"
});
    }

    // 🟢 APPROVED USER → LOGIN
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

    return res.json({
      state: "APPROVED",
      accessToken,
      refreshToken,
      user
    });

  } catch (error) {
    return res.status(500).json({
      state: "ERROR",
      message: "Server error"
    });
  }
};




import crypto from "crypto";
import nodemailer from "nodemailer";
// ==========================================
// 1. DEMANDE DE RÉINITIALISATION (FORGOT)
// ==========================================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ where: { email } });

    // Sécurité : même réponse si l'utilisateur n'existe pas
    if (!user) {
      return res.json({ message: "If email exists, reset link sent" });
    }

    // Génération du token brut (raw) pour l'email et haché pour la BDD
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

      // NOUVEAU CODE (configuré pour le port 587)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true pour le port 465, false pour le port 587
  service: false, // Désactive le service intégré pour utiliser les paramètres personnalisés
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Assure-toi que c'est un "App Password" de 16 caractères
  },
  tls: {
    rejectUnauthorized: false, // Aide à éviter les erreurs de certificat sur certains serveurs
  },
  family: 4, // Force l'utilisation d'IPv4
});

    const mailOptions = {
      from: `"ReactBuilder CMS" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Réinitialisation du mot de passe",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h3>Bonjour ${user.name},</h3>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe (valable 15 minutes) :</p>
          <a href="${resetLink}" 
             style="display: inline-block; background:#1976d2; color:white; padding:12px 25px; border-radius:5px; text-decoration:none; font-weight:bold;">
             Réinitialiser mon mot de passe
          </a>
          <p style="margin-top: 20px; color: #666;">Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.json({ message: "Reset link sent" });

  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// 2. MISE À JOUR DU MOT DE PASSE (RESET)
// ==========================================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params; // On récupère le token depuis l'URL (:token)
    const { password } = req.body; // Le nouveau mot de passe depuis le formulaire

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // On hache le token reçu pour le comparer avec celui en BDD
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      where: {
        resetPasswordToken: hashedToken,
      },
    });

    // Vérification du token et de l'expiration
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: "Le lien est invalide ou a expiré" });
    }

    // Hachage du nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Nettoyage du token après succès
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.json({ message: "Mot de passe mis à jour avec succès" });

  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};