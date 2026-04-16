import { Response, NextFunction } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { Site } from "../../models/site";

export const tenantResolver = async (req: any, res: Response, next: NextFunction) => {
  try {
    const host = req.headers.host || "";
    let subdomain = "";
    
    if (host.includes("localhost") || host.includes("render.com")) {
        subdomain = (req.headers["x-subdomain"] as string) || host.split('.')[0];
    } else {
        subdomain = host.split('.')[0];
    }

    if (!subdomain || subdomain === "www") {
      return next(); 
    }

    const site = await Site.findOne({ where: { subdomain: subdomain.toLowerCase() } });

    if (!site) {
      return res.status(404).json({ success: false, message: "Site not found" });
    }

    if (req.context) {
      req.context.site = site;
    } else {
      (req as any).context = { site };
    }

    next();
  } catch (error) {
    console.error("TENANT_RESOLVER_ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};