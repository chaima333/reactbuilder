import { Response, NextFunction } from "express";
import { AuthRequest, SiteContext } from "../../shared/auth.util";
import { Site } from "../../models/site";


  export const tenantResolver = async (req: any, res: Response, next: NextFunction) => {
  try {
    const host = req.headers.host || "";
    const headerSubdomain = req.headers["x-subdomain"] as string;
    
    let subdomain = "";

    // 1. الأولوية للـ Header (مهم جداً للـ Testing والـ Postman)
    if (headerSubdomain) {
      subdomain = headerSubdomain;
    } 
    // 2. إذا ما فماش Header، نطلعوه مالـ Host (للـ Production)
    else if (!host.includes("localhost") && !host.includes("render.com")) {
      subdomain = host.split('.')[0];
    }

    // تنظيف الـ subdomain
    subdomain = subdomain.toLowerCase().trim();

    // 3. الحالات اللي ما نلوجوش فيها على Site
    if (!subdomain || subdomain === "www" || subdomain === "backend-rmfq") {
      return next(); 
    }

    console.log(`🔍 Attempting to resolve site for subdomain: [${subdomain}]`);

    const site = await Site.findOne({ 
      where: { subdomain: subdomain } 
    });

    if (!site) {
      return res.status(404).json({ 
        success: false, 
        message: `Site with subdomain [${subdomain}] not found` 
      });
    }

    (req as AuthRequest).siteContext = {
      siteId: site.id,
      role: null, 
    };

    console.log(`✅ [TenantResolver] Resolved Site: ${site.name} (ID: ${site.id})`);
    next();
  } catch (error) {
    console.error("TENANT_RESOLVER_ERROR:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error during tenant resolution" 
    });
  }
};