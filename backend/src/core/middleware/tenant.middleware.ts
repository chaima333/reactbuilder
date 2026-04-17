import { Response, NextFunction } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { Site, SiteMember } from "../../models";

export const tenantResolver = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const headerSubdomain = req.headers["x-subdomain"];
    const host = req.headers.host || "";

    let subdomain = headerSubdomain 
      ? String(headerSubdomain).toLowerCase().trim() 
      : host.split(".")[0];

    if (!subdomain || subdomain === "www") {
      return res.status(400).json({ success: false, message: "Subdomain required" });
    }

    const site = await Site.findOne({ where: { subdomain } });
    if (!site) {
      return res.status(404).json({ success: false, message: "Site not found" });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const membership = await SiteMember.findOne({
      where: { siteId: site.id, userId },
    });

    if (!membership) {
      return res.status(403).json({ success: false, message: "Not a site member" });
    }

    // --- 🎯 الترجمة وتعبئة الـ Context ---
    const roleMapping: Record<string, string> = {
      'PROPRIÉTAIRE': 'OWNER',
      'ADMINISTRATEUR': 'ADMIN',
      'ÉDITEUR': 'EDITOR',
      'LECTEUR': 'VIEWER'
    };

    req.siteContext = {
      siteId: site.id,
      role: roleMapping[membership.role.toUpperCase()] || 'VIEWER'
    };

    next();
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Tenant Error", details: err.message });
  }
};