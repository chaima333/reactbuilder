import { Response, NextFunction } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { Site, SiteMember } from "../../models"; // تأكد إنك عامل export لـ SiteMember من الـ index

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

    // الـ Bypass للـ routes العامة
    if (!subdomain || subdomain === "www" || subdomain === "backend-rmfq" || subdomain === "localhost:10000") {
      return next();
    }

    console.log(`🔍 [TenantResolver] Checking subdomain: "${subdomain}"`);

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

    // 2. 🛡️ ربط الـ User بالسايت (أهم سطر)
    // ملاحظة: req.user.id يجينا من authenticateJWT اللي لازم يكون قبل الـ middleware هذا
    const membership = await SiteMember.findOne({
      where: { 
        siteId: site.id, 
        userId: req.user?.id 
      }
    });

    // 3. تخزين الـ Context كامل
    req.siteContext = { 
      siteId: site.id, 
      // إذا موش عضو، الـ role يرجع null والـ permission engine يرفضو أوتوماتيكياً
      role: membership ? membership.role.toUpperCase() : null 
    };

    console.log(`✅ [TenantResolver] Site: ${site.name} | User Role: ${req.siteContext.role || 'NONE'}`);
    
    next();
  } catch (error) {
    console.error("TENANT_RESOLVER_ERROR:", error);
    return res.status(500).json({ success: false, message: "Erreur interne du Tenant Resolver" });
  }
};