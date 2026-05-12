import { Router }
from "express";

import {

  getPublicSite

} from "./site.controller";

const router =
  Router();

router.get(

  "/sites/:siteId",

  getPublicSite
);

export default router;