import { Response, NextFunction } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { ROLE_PERMISSIONS } from "./rolePermissions";

export const requirePermission = (permission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const siteContext = req.siteContext; 

      if (!siteContext) {
        return res.status(403).json({ success: false, message: "Site context missing" });
      }

      const siteId = siteContext.siteId;
      const userRole = siteContext.role; 

      const permissions = ROLE_PERMISSIONS[userRole?.toUpperCase() || ''] || [];

      if (!permissions.includes(permission)) {
        return res.status(403).json({ 
          success: false, 
          message: `Accès refusé. Permission [${permission}] requise.` 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: "Erreur d'autorisation" });
    }
  };
};
