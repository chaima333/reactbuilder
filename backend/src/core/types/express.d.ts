import { SiteRole } from "../modules/membership/membership.middleware";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
        email: string;
      };
      siteContext?: {
        role: SiteRole;
        siteId: number;
        userId: number;
      };
    }
  }
}