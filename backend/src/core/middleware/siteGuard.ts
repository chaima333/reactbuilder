import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/auth.util';
import { SiteMember } from '../../models';

export const requireSiteAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const siteId = req.params.siteId || req.body.siteId;

    if (!siteId) {
      return res.status(400).json({ success: false, message: "Site ID is required" });
    }

    // التثبت من الـ Membership
    const membership = await SiteMember.findOne({
      where: { userId, siteId }
    });

    if (!membership && req.user.role !== 'Admin') {
      return res.status(403).json({ 
        success: false, 
        message: "Forbidden: You don't have access to this site" 
      });
    }

    // نخزنوا الـ membership في الـ request باش نستعملوها مبعد (مثلا نعرفوا الـ Role)
    req.context = { ...req.context, membership };
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error in Guard" });
  }
};