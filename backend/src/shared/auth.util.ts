import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User, Token } from '../models';

const secretkey = process.env.JWT_SECRET || 'your_secret_key';

// --- Interfaces ---

export interface JwtPayload {
  userId: number;
  type?: 'access' | 'refresh';
}

export interface SiteContext {
  siteId: number;
  role: string ;
}

export type AuthRequest = Request & {
  user?: any;
  siteContext?: {
    siteId: number;
    role: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
  };
};

export const generateToken = (payload: JwtPayload): string => {
  const expiresIn = payload.type === "refresh" ? "7d" : "1h";
  return jwt.sign(
    { userId: payload.userId, type: payload.type }, 
    secretkey, 
    { expiresIn }
  );
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, secretkey) as JwtPayload;
  } catch (error) {
    return null;
  }
};

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
    expiresAt: new Date(Date.now() + (type === 'refresh' ? 7 : 1) * 24 * 60 * 60 * 1000)
  } as any);
};

export const getToken = async (token: string) => {
  return await Token.findOne({ where: { token } });
};

// 5. Middleware الحماية المركزي
export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): 
Promise<void> => {
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

    const isUserApproved = user.isApproved || user.getDataValue('is_approved');
    
    if (!isUserApproved && user.role !== 'Admin') {
      res.status(403).json({ 
        success: false, 
        message: 'Account pending admin approval.' 
      });
      return;
    }
    
    // إسناد الـ User للـ Request
    (req as AuthRequest).user = user;
    next();
  } catch (error) {
    console.error("AUTH_MIDDLEWARE_ERROR:", error);
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

// 6. تنظيف وإبطال الـ Tokens
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