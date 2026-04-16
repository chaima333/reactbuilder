import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User, Token } from '../models'; // تأكد أن الموديلات تخرج من index واحد

const secretkey = process.env.JWT_SECRET || 'your_secret_key';

// --- Interfaces ---
export interface JwtPayload {
  userId: number;
  type?: 'access' | 'refresh';
  role?: string;
  email?: string;
}

export type AuthRequest = Request & {
  user?: any;
  site?: any;
  context?: any;
}

// 1. توليد الـ Token
export const generateToken = (payload: JwtPayload): string => {
  const expiresIn = payload.type === "refresh" ? "7d" : "1h";
  return jwt.sign(payload, secretkey, { expiresIn });
};

// 2. التحقق من الـ Token (verify)
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, secretkey) as JwtPayload;
  } catch (error) {
    return null;
  }
};

// 3. فك تشفير الـ Token (decode)
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
};

// 4. العمليات على قاعدة البيانات (Tokens DB Logic)
export const addToken = async (token: string, type: 'access' | 'refresh', userId: number) => {
  return await Token.create({
    token,
    type,
    userId,
    isRevoked: false,
    // حساب تاريخ انتهاء الصلاحية للـ DB
    expiresAt: new Date(Date.now() + (type === 'refresh' ? 7 : 1) * 24 * 60 * 60 * 1000)
  } as any);
};

export const getToken = async (token: string) => {
  return await Token.findOne({ where: { token } });
};

export const deleteUserTokens = async (userId: number) => {
  return await Token.destroy({ where: { userId } });
};

export const revokeUserTokens = async (userId: number) => {
  return await Token.update(
    { isRevoked: true },
    { where: { userId, type: 'refresh', isRevoked: false } }
  );
};

export const revokeToken = async (token: string) => {
  return await Token.update(
    { isRevoked: true },
    { where: { token } }
  );
};

// 5. Middleware الحماية (Authentication Middleware)
export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Access Denied. No token provided.' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const verified = verifyToken(token);

    if (!verified) {
      res.status(401).json({ success: false, message: 'Invalid or expired token' });
      return;
    }

    const user = await User.findByPk(verified.userId);
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }
    console.log(`DEBUG: User ${user.email} | isApproved status:`, user.isApproved);
    const isUserApproved = user.isApproved || user.getDataValue('is_approved');
    console.log(`DEBUG: User ${user.email} | isUserApproved:`, isUserApproved);
    
    // التثبت من الحساب (Approved)
    if (!user.isApproved && user.role !== 'Admin') {
      res.status(403).json({ success: false, message: 'Account pending approval.' });
      return;
    }
    
    (req as AuthRequest).user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};