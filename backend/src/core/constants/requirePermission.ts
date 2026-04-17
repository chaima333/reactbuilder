import { Response, NextFunction } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { ROLE_PERMISSIONS } from "./rolePermissions";

export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const siteContext = req.siteContext;

      if (!siteContext?.siteId) {
        return res.status(500).json({
          success: false,
          message: "Missing site context (tenantResolver not applied)",
        });
      }

      const role = siteContext.role;

      if (!role) {
        return res.status(403).json({
          success: false,
          message: "Role missing",
        });
      }

      const permissions = ROLE_PERMISSIONS[role] || [];

      if (!permissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          message: `Missing permission: ${permission}`,
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Authorization error",
      });
    }
  };
};