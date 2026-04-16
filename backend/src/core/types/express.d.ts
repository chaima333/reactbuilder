// src/core/types/express.d.ts
import { Site } from "../../models/site";

export interface RequestContext {
  site?: any;
  user?: any;
  membership?: any;
}

declare global {
  namespace Express {
    interface Request {
      context: RequestContext;
    }
  }
}