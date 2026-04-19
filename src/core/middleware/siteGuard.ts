import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/auth.util';
import { SiteMember } from '../../models/SiteMember';
import { normalizeRole } from './role.middleware';

export const requireSiteAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    
    const siteId = req.siteContext?.siteId; 

    if (!siteId) {
      return res.status(400).json({ 
        message: "Site Context missing. Make sure tenantResolver is running." 
      });
    }

    const membership = await SiteMember.findOne({ where: { userId, siteId } });
    const isGlobalAdmin = req.user.role === 'ADMIN';

    if (!membership && !isGlobalAdmin) {
      return res.status(403).json({ message: "Forbidden: You are not a member of this site" });
    }

req.siteContext.role = normalizeRole(
  membership?.role || (isGlobalAdmin ? "OWNER" : "VIEWER")
);
    next();
  } catch (error) {
    console.error("SITE_GUARD_ERROR:", error);
    res.status(500).json({ message: "Internal server error in SiteGuard" });
  }
};