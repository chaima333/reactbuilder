import { Request, Response, NextFunction } from "express";

export const initContext = (req: any, res: Response, next: NextFunction) => {
  req.context = {}; // استعملنا any باش TypeScript ما يضربش
  next();
};