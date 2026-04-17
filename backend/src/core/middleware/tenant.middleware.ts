import { Response, NextFunction } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { Site, SiteMember } from "../../models";

export const tenantResolver = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const host = req.headers.host || "";
    const headerSubdomain = req.headers["x-subdomain"];

    let subdomain = headerSubdomain
      ? String(headerSubdomain).toLowerCase().trim()
      : host.split(".")[0];

    if (!subdomain || subdomain === "www") {
      return res.status(400).json({
        success: false,
        message: "Subdomain required",
      });
    }

    const site = await Site.findOne({
      where: { subdomain },
    });

    if (!site) {
      return res.status(404).json({
        success: false,
        message: "Site not found",
      });
    }

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const membership = await SiteMember.findOne({
      where: {
        siteId: site.id,
        userId,
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
      role: membership.role.toUpperCase(),
    };

    next();
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Tenant resolver error",
      details: err.message,
    });
  }
};