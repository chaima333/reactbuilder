// src/modules/membership/membership.middleware.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "../../shared/auth.util";
import SiteMember from "../../models/SiteMember";
export type SiteRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";

export const checkSiteAccess = (allowedRoles: SiteRole[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      // نثبتوا في الـ siteId من الـ params (URL) أو الـ body
      const siteId = req.params.siteId || req.body.siteId;

      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (!siteId) {
        return res.status(400).json({ message: "Site ID is required for this action" });
      }

      // 1. التثبت من الـ Membership
      // ثبت في الـ DB متاعك: هل الأعمدة اسمها userId أو user_id؟ 
      // حسب الـ Logs السابقة متاعك هي user_id و site_id
      const membership = await SiteMember.findOne({
        where: {
          userId: user.id,
          siteId: siteId,
        },
      });

      // 2. إذا موش عضو، نثبتوا في الـ Global Role (SaaS Admin Exception)
      if (!membership) {
        if (user.role === 'Admin') {
          return next(); // الـ Super Admin ينجم يدخل لكل شيء
        }
        return res.status(403).json({ message: "Access Denied: Not a member of this site" });
      }

      // 3. التثبت من الـ Role داخل الموقع
      const currentRole = (membership as any).role as SiteRole;

      if (!allowedRoles.includes(currentRole)) {
        return res.status(403).json({ message: "Insufficient permissions for this site" });
      }

      // 4. حقن الـ membership في الـ request باش تستعملها في الـ controllers
      (req as any).siteContext = membership;
      
      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      return res.status(500).json({ message: "Internal Authorization Error" });
    }
  };
};
