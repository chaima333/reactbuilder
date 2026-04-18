import { Response, NextFunction } from "express";

// استعملنا any باش TypeScript يطفي الضوء على siteContext
export const initContext = (req: any, res: Response, next: NextFunction) => {
  req.siteContext = {
    siteId: 0,
    role: null
  };
  
  // نزيدو هذي باش الـ Controllers اللي يلوجو على context يلقاوها زادة
  req.context = {
    membership: null,
    site: null
  };

  next();
};