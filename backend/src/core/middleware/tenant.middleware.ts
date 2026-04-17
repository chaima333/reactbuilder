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

    // --- 🎯 هوني الخدمة الصحيحة ---
    const roleMapping: Record<string, string> = {
      'PROPRIÉTAIRE': 'OWNER',
      'ADMINISTRATEUR': 'ADMIN',
      'ÉDITEUR': 'EDITOR',
      'LECTEUR': 'VIEWER'
    };

    // نطلعو الـ Role م الداتابيز ونحولوه للـ Mapping
    const rawRole = membership.role.toUpperCase();
    const mappedRole = roleMapping[rawRole] || 'VIEWER';

    console.log(`🔍 [TenantResolver] Raw Role: ${rawRole} -> Mapped to: ${mappedRole}`);

    req.siteContext = {
      siteId: site.id,
      role: mappedRole, // توّة الـ requirePermission باش يفهمها
    };

    next(); // توّة الريكويست تتعدى مريغلة
    // ----------------------------

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Tenant resolver error",
      details: err.message,
    });
  }
};