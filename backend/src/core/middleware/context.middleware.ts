import { Response, NextFunction } from "express";

export const initContext = (req: any, res: Response, next: NextFunction) => {
  req.siteContext = {
    siteId: 0,
    role: null
  };
  
  req.context = {
    membership: null,
    site: null
  };

  next();
};