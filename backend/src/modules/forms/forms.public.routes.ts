import {
  Router
} from "express";

import {
  FormsPublicController
} from "./forms.public.controller";

const router =
  Router({
    mergeParams: true
  });

router.post(
  "/sites/:siteId/forms/:formId/submit",
  FormsPublicController.submitForm
);

export default router;