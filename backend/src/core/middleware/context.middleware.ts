import { Request, Response, NextFunction } from "express";

export const initContext = (req: Request, res: Response, next: NextFunction) => {
  req.context = {}; 
  next();
};