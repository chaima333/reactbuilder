import { SiteContext } from "../shared/auth.util";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      siteContext?: SiteContext;
    }
  }
}

export {};