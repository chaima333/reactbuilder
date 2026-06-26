import {
  Response,
  NextFunction
} from "express";

import {
  AuthRequest
} from "../../shared/auth.util";

import {
  Permission
} from "./permissions";

import {
  hasPermission
} from "./rolePermissions";

import {
  Role
} from "../../modules/auth/role";

export const requirePermission = (
  permission: Permission
) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    const siteContext =
      req.siteContext;

    if (
      !siteContext ||
      !siteContext.siteId ||
      !siteContext.role
    ) {
      return res.status(403).json({
        success: false,
        message: "Site membership is required"
      });
    }

    const role =
      siteContext.role as Role;

    const allowed =
      hasPermission(
        role,
        permission
      );

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions"
      });
    }

    return next();
  };
};