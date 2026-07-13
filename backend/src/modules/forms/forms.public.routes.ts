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

router.get(
  "/sites/:siteId/forms/:formId",
  FormsPublicController.getFormById
);

router.post(
  "/sites/:siteId/forms/:formId/submit",
  FormsPublicController.submitForm
);

export default router;