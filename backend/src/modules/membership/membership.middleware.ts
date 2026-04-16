// src/modules/membership/membership.middleware.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "../../shared/auth.util"; // Import du type AuthRequest
import SiteMember from "../../models/SiteMember";

export type SiteRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";


export const requireSiteRole = (allowedRoles: SiteRole[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const siteId = Number(req.params.siteId);

      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (!siteId) {
        return res.status(400).json({ message: "Invalid site ID" });
      }

      const membership = await SiteMember.findOne({
        where: {
          userId: user.id, 
          siteId: siteId,
        },
      });

      if (!membership) {
        if (user.role === "Admin") {
            req.context.membership = {
    role: membership.role,
    siteId: membership.siteId,
    userId: membership.userId
};
          return next();
        }

        return res.status(403).json({ message: "Access denied" });
      }

      const currentRole = membership.role as SiteRole;

      if (!allowedRoles.includes(currentRole)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      

req.context.membership = {
  role: currentRole,
  siteId: Number(membership.siteId || (membership as any).site_id),
  userId: Number(membership.userId || (membership as any).user_id)
};
      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      return res.status(500).json({ message: "Internal Authorization Error" });
    }
  };
};