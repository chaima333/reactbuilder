import bcrypt from "bcrypt";
import crypto from "crypto";
import { User } from "../../models";
import { 
  generateToken, 
  addToken, 
  verifyToken, 
  getToken,
  revokeUserTokens,
} from "../../shared/auth.util";
import { Resend } from "resend";
import { AdminSettingsService } from "../admin/adminSettings.service";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
const resend = new Resend(process.env.RESEND_API_KEY);

// 1. LOGIN
export const loginUser = async (email: string, pass: string) => {
  const settings = await AdminSettingsService.getSettings();

  if (settings.allowEmailLogin === false) {
    throw new Error("Email login disabled by administrator");
  }

  const user = await User.findOne({ where: { email } });
  if (!user || !user.password) throw new Error("Invalid credentials");

  const isPasswordValid = await bcrypt.compare(pass, user.password);
  if (!isPasswordValid) throw new Error("Invalid credentials");

if (user.twoFactorEnabled) {
  return {
    requires2FA: true,
    userId: user.id,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

  await revokeUserTokens(user.id);

  const accessToken = generateToken({ userId: user.id, type: "access" });
  const refreshToken = generateToken({ userId: user.id, type: "refresh" });

  await addToken(refreshToken, "refresh", user.id);

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  };
};

// 2. REGISTER
export const registerUser = async (data: any) => {
  const settings =
    await AdminSettingsService.getSettings();

  if (settings.publicRegistration === false) {
    throw new Error("Public registration is disabled");
  }
if (settings.forceStrongPasswords === true) {
  const strongPasswordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  if (!strongPasswordRegex.test(data.password)) {
    throw new Error(
      "Password must contain at least 8 characters, one uppercase letter, one number and one special character"
    );
  }
}
  const existingUser =
    await User.findOne({
      where: { email: data.email },
    });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword =
    await bcrypt.hash(data.password, 10);

  const newUser =
    await User.create({
      ...data,
      password: hashedPassword,
      role: settings.defaultRole || "VIEWER",
      isApproved: settings.autoApproveUsers === true,
    });

  return newUser;
};

// 3. REFRESH TOKEN
export const refreshUserToken = async (
  refreshToken: string
) => {
  const dbToken =
    await getToken(refreshToken);

  if (
    !dbToken ||
    dbToken.isRevoked
  ) {
    throw new Error(
      "Invalid or expired refresh token"
    );
  }

  if (dbToken.type !== "refresh") {
    throw new Error(
      "Invalid token type"
    );
  }

  if (
    dbToken.expiresAt &&
    dbToken.expiresAt < new Date()
  ) {
    throw new Error(
      "Refresh token expired"
    );
  }

  const decoded =
    verifyToken(refreshToken);

  if (!decoded) {
    throw new Error(
      "Invalid token"
    );
  }

  if (decoded.type !== "refresh") {
    throw new Error(
      "Invalid token type"
    );
  }

  if (decoded.userId !== dbToken.userId) {
    throw new Error(
      "Invalid token owner"
    );
  }

  const user =
    await User.findByPk(
      dbToken.userId
    );

  if (!user) {
    throw new Error(
      "User not found"
    );
  }

  await dbToken.update({
    isRevoked: true,
  });

  const newAccessToken =
    generateToken({
      userId: user.id,
      type: "access",
    });

  const newRefreshToken =
    generateToken({
      userId: user.id,
      type: "refresh",
    });

  await addToken(
    newRefreshToken,
    "refresh",
    user.id
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

// 4. LOGOUT
export const logoutUser = async (refreshToken: string) => {
  const dbToken = await getToken(refreshToken);
  if (dbToken) {
    await dbToken.update({ isRevoked: true });
  }
};

// 5. GOOGLE AUTH
export const handleGoogleAuth = async (data: any) => {
  const { email, name, googleId, avatar } = data;
  let user = await User.findOne({ where: { email } });
const settings =
  await AdminSettingsService.getSettings();
  if (settings.allowGoogleLogin === false) {
  return {
    state: "ERROR",
    message: "Google login disabled by administrator",
  };
}
  if (!user) {
    if (settings.publicRegistration === false) {
  return {
    state: "ERROR",
    message: "Public registration is disabled",
  };
}
  user = await User.create({
  email,
  name: name || email.split("@")[0],
  googleId,
  avatar: avatar || null,
  isApproved: settings.autoApproveUsers === true,
  role: settings.defaultRole || "VIEWER",
  password: "",
} as any);

if (!user.isApproved) {
  return {
    state: "PENDING",
    message: "Account created. Waiting approval",
  };
}

await revokeUserTokens(user.id);

const accessToken = generateToken({
  userId: user.id,
  type: "access",
});

const refreshToken = generateToken({
  userId: user.id,
  type: "refresh",
});

await addToken(refreshToken, "refresh", user.id);

return {
  state: "APPROVED",
  accessToken,
  refreshToken,
  user,
}; 
  }

  if (!user.isApproved) return { state: "PENDING", message: "Waiting admin approval" };

  await revokeUserTokens(user.id);
  
  const accessToken = generateToken({ userId: user.id, type: "access" });
  const refreshToken = generateToken({ userId: user.id, type: "refresh" });
  
  await addToken(refreshToken, "refresh", user.id);

  return { state: "APPROVED", accessToken, refreshToken, user };
};

// 6. FORGOT PASSWORD
export const processForgotPassword = async (email: string) => {

  const user = await User.findOne({ where: { email } });
  if (!user) return { message: "If email exists, reset link sent" };

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;
  
  await resend.emails.send({
    from: "ReactBuilder <onboarding@resend.dev>",
    to: [user.email],
    subject: "Reset Password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`
  });

  return { message: "Reset link sent" };
};

// 7. RESET PASSWORD
export const processResetPassword = async (token: string, pass: string) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({ where: { resetPasswordToken: hashedToken } });

  if (!user || (user.resetPasswordExpires && user.resetPasswordExpires < new Date())) {
    throw new Error("Token invalid or expired");
  }

  user.password = await bcrypt.hash(pass, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();
};

//2FA
export const setupTwoFactor = async (userId: number) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  const secret = speakeasy.generateSecret({
    name: `ReactBuilder (${user.email})`,
  });

  user.twoFactorSecret = secret.base32;
  await user.save();

  const qrCode = await QRCode.toDataURL(secret.otpauth_url || "");

  return {
    qrCode,
    secret: secret.base32,
  };
};

export const verifyTwoFactorSetup = async (
  userId: number,
  token: string
) => {
  const user = await User.findByPk(userId);
  if (!user || !user.twoFactorSecret) {
    throw new Error("2FA setup not found");
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (!verified) {
    throw new Error("Invalid 2FA code");
  }

  user.twoFactorEnabled = true;
  await user.save();

  return {
    twoFactorEnabled: true,
  };
};

export const verifyTwoFactorLogin = async (
  userId: number,
  token: string
) => {
  const user = await User.findByPk(userId);
  if (!user || !user.twoFactorSecret || !user.twoFactorEnabled) {
    throw new Error("2FA not enabled");
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (!verified) {
    throw new Error("Invalid 2FA code");
  }

  await revokeUserTokens(user.id);

  const accessToken = generateToken({
    userId: user.id,
    type: "access",
  });

  const refreshToken = generateToken({
    userId: user.id,
    type: "refresh",
  });

  await addToken(refreshToken, "refresh", user.id);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled,
    },
  };
};

export const disableTwoFactor = async (userId: number) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  user.twoFactorEnabled = false;
  user.twoFactorSecret = null;
  await user.save();

  return {
    twoFactorEnabled: false,
  };
};