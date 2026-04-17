import { Response, NextFunction } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { Site, SiteMember } from "../../models";

export const tenantResolver = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const host = req.headers.host || "";
    const headerSubdomain = req.headers["x-subdomain"]; 
    
    let subdomain = "";

    if (headerSubdomain) {
      subdomain = String(headerSubdomain).toLowerCase().trim();
    } else {
      subdomain = host.split('.')[0];
    }

    // ❌ ما عادش bypass
    if (!subdomain || subdomain === "www") {
      return res.status(400).json({
        success: false,
        message: "Subdomain is required"
      });
    }

    console.log(`🔍 [TenantResolver] Looking for subdomain: "${subdomain}"`);

    const site = await Site.findOne({ 
      where: { subdomain } 
    });

    if (!site) {
      return res.status(404).json({ 
        success: false, 
        message: `Site [${subdomain}] not found` 
      });
    }

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user missing"
      });
    }

    const membership = await SiteMember.findOne({
      where: { 
        siteId: site.id,
        userId: userId
      }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "User not a member of this site"
      });
    }

    req.siteContext = { 
      siteId: site.id, 
      role: membership.role.toUpperCase()
    };

    console.log(`✅ [TenantResolver] Site: ${site.name} | Role: ${req.siteContext.role}`);
    
    next();

  } catch (error: any) {
    console.error("❌ [TenantResolver] Error:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: "Tenant Resolver error",
      details: error.message
    });
  }
};
export default tenantResolver;