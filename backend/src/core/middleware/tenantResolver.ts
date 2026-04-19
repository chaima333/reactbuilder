import { Response, NextFunction } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { Site, SiteMember } from "../../models";
import { SiteRole } from "./role.middleware";

export const tenantResolver = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const subdomain =
      (req.headers["x-subdomain"] as string)?.toLowerCase().trim() ||
      req.headers.host?.split(".")[0];

    if (!subdomain || subdomain === "www") {
      return res.status(400).json({
        success: false,
        message: "Subdomain required",
      });
    }

    const site = await Site.findOne({ where: { subdomain } });

    if (!site) {
      return res.status(404).json({
        success: false,
        message: "Site not found",
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const membership = await SiteMember.findOne({
      where: {
        siteId: site.id,
        userId: req.user.id,
      },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "Not a site member",
      });
    }

   req.siteContext = {
  siteId: site.id,
  role: membership?.role ?? null
};

    next();
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Tenant Error",
      details: err.message,
    });
  }
};