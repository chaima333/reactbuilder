import { Response, NextFunction } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { ROLE_PERMISSIONS } from "../constants/rolePermissions";

export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const siteContext = req.siteContext;

    if (!siteContext || !siteContext.role) {
      return res.status(403).json({ message: "No site context found" });
    }

    const allowedPermissions = ROLE_PERMISSIONS[siteContext.role] || [];

    if (!allowedPermissions.includes(permission)) {
      return res.status(403).json({
        message: `Permission denied: You need [${permission}] to perform this action`
      });
    }

    next();
  };
};

