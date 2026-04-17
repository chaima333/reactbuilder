import { Response, NextFunction } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { ROLE_PERMISSIONS } from "./rolePermissions";

export const requirePermission = (permission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const siteContext = req.siteContext;

      if (!siteContext?.siteId) {
        return res.status(400).json({
          success: false,
          message: "Site context missing"
        });
      }

      const role = siteContext.role;

      if (!role) {
        return res.status(403).json({
          success: false,
          message: "Role missing in site context"
        });
      }

      const permissions = ROLE_PERMISSIONS[role] || [];

      if (!permissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          message: `Permission manquante: ${permission}`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erreur d'autorisation"
      });
    }
  };
};
