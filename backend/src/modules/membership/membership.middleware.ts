import { Response, NextFunction } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { SiteRole } from "./membership.types";
import SiteMember from "../../models/SiteMember";

export const authorizeSiteRoles =
  (...allowedRoles: SiteRole[]) =>
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const siteId = req.params.siteId;

      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const membership = await SiteMember.findOne({
        where: {
          user_id: user.id,
          site_id: siteId,
        },
      });

      if (!membership) {
        return res.status(403).json({ message: "Not a site member" });
      }

      const role = (membership as any).role;

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ message: "Insufficient role" });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  };