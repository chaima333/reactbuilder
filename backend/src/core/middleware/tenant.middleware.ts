import { Response, NextFunction } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { Site, SiteMember } from "../../models";

export const tenantResolver = async (req: any, res: Response, next: NextFunction) => {
  try {
    const host = req.headers.host || "";
    const headerSubdomain = req.headers["x-subdomain"]; 
    
    let subdomain = "";

    if (headerSubdomain) {
      subdomain = String(headerSubdomain).toLowerCase().trim();
    } else {
      subdomain = host.split('.')[0];
    }

    // الـ Bypass للـ routes العامة (backend, local, etc)
    if (!subdomain || subdomain === "www" || subdomain === "backend-rmfq" || subdomain === "localhost:10000") {
      return next();
    }

    console.log(`🔍 [TenantResolver] Looking for subdomain: "${subdomain}"`);

    // 1. التثبت من وجود السايت
    const site = await Site.findOne({ 
      where: { subdomain: subdomain } 
    });

    if (!site) {
      return res.status(404).json({ 
        success: false, 
        message: `Site [${subdomain}] non trouvé.` 
      });
    }

    // 2. 🛡️ ربط الـ User بالسايت (Membership Check)
    // التثبيت هذا لازم بش الـ Role ما يخرجش null
    const userId = req.user?.id;
    console.log(`🛠️ Checking Membership: User[${userId}] -> Site[${site.id}]`);

    if (!userId) {
       console.warn("⚠️ [TenantResolver] req.user is missing. Check if authenticateJWT is placed BEFORE tenantResolver.");
    }

    const membership = await SiteMember.findOne({
      where: { 
        siteId: site.id,   // 💡 إذا عطاك Error "column does not exist", بدلها لـ site_id
        userId: userId      // 💡 إذا عطاك Error "column does not exist", بدلها لـ user_id
      }
    });

    // 3. تخزين الـ Context
    req.siteContext = { 
      siteId: site.id, 
      role: membership ? membership.role.toUpperCase() : null 
    };

    console.log(`✅ [TenantResolver] Resolved Site: ${site.name} | Role: ${req.siteContext.role || 'NONE'}`);
    
    next();

  } catch (error: any) {
    console.error("❌ [TenantResolver] Error:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur interne du Tenant Resolver",
      details: error.message // بش نعرفو بالظبط شنيّة الـ column اللي ناقصة
    });
  }
};
export default tenantResolver;