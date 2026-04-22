import { Response, NextFunction } from "express";

export const initContext = (req: any, res: Response, next: NextFunction) => {
  
  req.context = {
    membership: null,
    site: null
  };

  next();
};