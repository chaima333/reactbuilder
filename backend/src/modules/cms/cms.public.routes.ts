import {
  Router
} from "express";

import {
  CmsPublicController
} from "./cms.public.controller";

const router =
  Router({
    mergeParams: true
  });

router.get(
  "/collections/:slug/entries",
  CmsPublicController.getPublishedEntries
);

export default router;