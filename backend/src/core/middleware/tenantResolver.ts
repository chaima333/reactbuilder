import { Response, NextFunction } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { Site, SiteMember } from "../../models";

export const tenantResolver = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
const siteId =
      req.params.siteId ||
      req.headers["x-site-id"] ||
      req.headers["x-subdomain"];
      
      const userId = req.user?.id;

    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: "SiteId required"
      });
    }

    const site = await Site.findByPk(Number(siteId));

    if (!site) {
      return res.status(404).json({
        success: false,
        message: "Site not found"
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const membership = await SiteMember.findOne({
      where: { siteId, userId }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "Not a site member"
      });
    }

    req.siteContext = {
      siteId: site.id,
      role: normalizeRole(membership.role)
    };

    next();
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Tenant Error",
      details: err.message
    });
  }
};

function normalizeRole(role: string) {
  throw new Error("Function not implemented.");
}
