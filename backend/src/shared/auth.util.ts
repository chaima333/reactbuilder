import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models';

const secretkey = process.env.JWT_SECRET!;

export interface JwtPayload {
  userId: number;
  type?: 'access' | 'refresh';
  role?: string;
  email?: string;
}

export const generateToken = (payload: JwtPayload): string => {
  const expiresIn = payload.type === "refresh" ? "7d" : "1h";
  return jwt.sign(payload, secretkey, { expiresIn });
};

export const authenticateJWT = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      res.status(401).json({ 
        success: false, 
        message: 'Access Denied: Token is not provided.' 
      });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const verified = jwt.verify(token, secretkey) as JwtPayload;
    const user = await User.findByPk(verified.userId);
    
    if (!user) {
      res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }
    
    // Vérifier si l'utilisateur est approuvé
    if (!user.isApproved && user.role !== 'Admin') {
      res.status(403).json({ 
        success: false, 
        message: 'Your account is pending admin approval.' 
      });
      return;
    }
    
    (req as any).user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: 'Token expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ success: false, message: 'Invalid token' });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
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
// Ajoutez cette interface à la fin du fichier
export interface AuthRequest extends Request {
  user?: any;
}