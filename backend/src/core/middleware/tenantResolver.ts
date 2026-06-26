import {
  Response,
  NextFunction
} from "express";

import {
  AuthRequest
} from "../../shared/auth.util";

import {
  Site,
  SiteMember
} from "../../models";

import {
  normalizeRole
} from "./role.middleware";

export const tenantResolver = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawSiteId =
      req.params.siteId ||
      req.headers["x-site-id"];

    const userId =
      req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!rawSiteId) {
      return res.status(400).json({
        success: false,
        message: "SiteId required"
      });
    }

    const siteId =
      Number(rawSiteId);

    if (
      Number.isNaN(siteId) ||
      siteId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid siteId"
      });
    }

    const site =
      await Site.findByPk(siteId);

    if (!site) {
      return res.status(404).json({
        success: false,
        message: "Site not found"
      });
    }

    const membership =
      await SiteMember.findOne({
        where: {
          siteId: site.id,
          userId
        }
      });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "Not a site member"
      });
    }

    req.siteContext = {
      siteId: site.id,
      role: normalizeRole(
        membership.role
      )
    };

    return next();
  } catch (err: any) {
    console.error(
      "TENANT_RESOLVER_ERROR",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Tenant resolver failed"
    });
  }
};