import { Response, NextFunction } from "express";
import { AuthRequest, SiteContext } from "../../shared/auth.util";
import { Site } from "../../models/site";


export const tenantResolver = async (req: any, res: Response, next: NextFunction) => {
  try {
    const host = req.headers.host || "";
    // Express يحوّل الـ Headers أوتوماتيكياً لـ lowercase
    const headerSubdomain = req.headers["x-subdomain"]; 
    
    let subdomain = "";

    if (headerSubdomain) {
      subdomain = String(headerSubdomain).toLowerCase().trim();
    } else {
      // Logic الـ Host العادي
      subdomain = host.split('.')[0];
    }

    // الحالات اللي نتعداو فيها (الـ Backend نفسه)
    if (!subdomain || subdomain === "www" || subdomain === "backend-rmfq" || subdomain === "localhost:10000") {
      return next();
    }

    console.log(`🔍 [TenantResolver] Looking for subdomain: "${subdomain}"`);

    const site = await Site.findOne({ 
      where: { subdomain: subdomain } 
    });

    if (!site) {
      return res.status(404).json({ 
        success: false, 
        message: `Site with subdomain [${subdomain}] not found` 
      });
    }

    req.siteContext = { siteId: site.id, role: null };
    console.log(`✅ [TenantResolver] Resolved Site: ${site.name} (ID: ${site.id})`);
    
    next();
  } catch (error) {
    console.error("TENANT_RESOLVER_ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal Error" });
  }
};