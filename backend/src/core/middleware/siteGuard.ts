import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/auth.util';
import { SiteMember } from '../../models/SiteMember';

// 1. العسّاس الأول: يثبت هل أنت عضو في الموقع؟
export const requireSiteAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const siteId = req.params.siteId || req.body.siteId;

    if (!siteId) return res.status(400).json({ message: "Site ID is required" });

    const membership = await SiteMember.findOne({ where: { userId, siteId } });

    // الـ Admin العالمي ديما يتعدى، الباقي لازم يكونوا Members
    if (!membership && req.user.role !== 'Admin') {
      return res.status(403).json({ message: "Forbidden: You are not a member of this site" });
    }

    // نخزنوا الممبرشيب باش العساس الثاني يستعملها
    req.context = { ...req.context, membership };
    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error in SiteGuard" });
  }
};

// 2. العسّاس الثاني: يثبت في الـ Role داخل الموقع (Owner, Admin, Editor...)
export const requireTenantRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const membership = req.context?.membership;

    // الـ Admin العالمي عنده "Passe-partout"
    if (req.user.role === 'Admin') return next();

    if (!membership || !allowedRoles.includes(membership.role)) {
      return res.status(403).json({ 
        message: `Forbidden: This action requires one of these roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};