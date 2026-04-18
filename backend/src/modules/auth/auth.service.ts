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

const resend = new Resend(process.env.RESEND_API_KEY);

// 1. LOGIN
export const loginUser = async (email: string, pass: string) => {
  const user = await User.findOne({ where: { email } });
  if (!user || !user.password) throw new Error("Invalid credentials");

  const isPasswordValid = await bcrypt.compare(pass, user.password);
  if (!isPasswordValid) throw new Error("Invalid credentials");

  if (user.role !== 'Admin' && !user.isApproved) throw new Error("Waiting admin approval");

  // تنظيف التوكنات القديمة
  await revokeUserTokens(user.id);

  // 🚀 التعديل: نحينا الـ role من الـ generateToken
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
  const existingUser = await User.findOne({ where: { email: data.email } });
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const newUser = await User.create({
    ...data,
    password: hashedPassword,
    isApproved: false
  });

  return newUser;
};

// 3. REFRESH TOKEN
export const refreshUserToken = async (refreshToken: string) => {
  const dbToken = await getToken(refreshToken);
  
  if (!dbToken || dbToken.isRevoked) throw new Error("Invalid or expired refresh token");

  const decoded = verifyToken(refreshToken);
  if (!decoded) throw new Error("Invalid token");

  const user = await User.findByPk(dbToken.userId);
  if (!user) throw new Error("User not found");

  await dbToken.update({ isRevoked: true });

  // 🚀 التعديل: نحينا الـ role
  const newAccessToken = generateToken({ userId: user.id, type: "access" });
  const newRefreshToken = generateToken({ userId: user.id, type: "refresh" });

  await addToken(newRefreshToken, "refresh", user.id);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
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

  if (!user) {
    user = await User.create({
      email,
      name: name || email.split('@')[0],
      googleId,
      avatar: avatar || null,
      isApproved: false,
      role: 'Viewer',
      password: '',
    } as any);
    return { state: "PENDING", message: "Account created. Waiting approval" };
  }

  if (!user.isApproved) return { state: "PENDING", message: "Waiting admin approval" };

  await revokeUserTokens(user.id);
  
  // 🚀 التعديل: نحينا الـ role
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