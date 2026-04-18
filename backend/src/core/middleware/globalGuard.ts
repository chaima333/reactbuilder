import { Response, NextFunction } from "express";
import { AuthRequest } from "../../shared/auth.util"; // تأكد من استيراد نوع AuthRequest


export const requireGlobalRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: Your global role (${user.role}) does not allow this action.` 
      });
    }

    next();
  };
};