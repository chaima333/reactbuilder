import { Response, NextFunction } from "express";
import { AuthRequest } from "../../shared/auth.util"; // تأكد من استيراد نوع AuthRequest

/**
 * Global Guard: يثبت في صلاحيات المستخدم على مستوى المنصة كاملة
 * نستعملوه مثلاً باش نمنعو الـ "Viewer" من صنع موقع جديد
 */
export const requireGlobalRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }

    // التثبت من الـ Global Role (Admin, Creator, Viewer...)
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: Your global role (${user.role}) does not allow this action.` 
      });
    }

    next();
  };
};