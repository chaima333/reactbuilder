import { Response, NextFunction } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { ROLE_PERMISSIONS } from "../constants/rolePermissions";

/**
 * 🔥 Normalize role (IMPORTANT - single source of truth)
 */
export type SiteRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";

export const normalizeRole = (role?: string): SiteRole => {
  switch ((role || "").toUpperCase()) {
    case "OWNER":
      return "OWNER";
    case "ADMIN":
      return "ADMIN";
    case "EDITOR":
      return "EDITOR";
    case "VIEWER":
      return "VIEWER";
    default:
      return "VIEWER"; // fallback safe
  }
};

/**
 * 🔐 Permission middleware
 */
export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.siteContext || !req.siteContext.siteId) {
        return res.status(400).json({
          success: false,
          message: "Site context missing",
        });
      }

      const role = normalizeRole(req.siteContext.role);
      const permissions = ROLE_PERMISSIONS[role] || [];

      if (!permissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          message: `Permission denied: ${permission}`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Authorization error",
      });
    }
  };
};

/**
 * 🔐 Role-based access control
 */
export const authorizeRoles = (...allowedRoles: SiteRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const role = normalizeRole(user.role);

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};

/**
 * 🔐 Admin only
 */
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  const role = normalizeRole(user.role);

  if (role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};

/**
 * 🔐 Admin or Editor
 */
export const isAdminOrEditor = (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  const role = normalizeRole(user.role);

  if (role !== "ADMIN" && role !== "EDITOR") {
    return res.status(403).json({
      success: false,
      message: "Admin or Editor access required",
    });
  }

  next();
};