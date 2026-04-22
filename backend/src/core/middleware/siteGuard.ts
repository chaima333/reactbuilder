import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/auth.util';
import { SiteMember } from '../../models/SiteMember';

export const requireSiteAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const siteId = req.siteContext?.siteId;
    const userId = req.user.id;

    if (!siteId) {
      return res.status(400).json({ message: "Site context missing" });
    }

    const membership = await SiteMember.findOne({ where: { userId, siteId } });

    if (!membership && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();

  } catch (e) {
    return res.status(500).json({ message: "Site guard error" });
  }
};