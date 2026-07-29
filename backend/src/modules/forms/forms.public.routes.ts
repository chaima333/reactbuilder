import {
  Router
} from "express";

import {
  FormsPublicController
} from "./forms.public.controller";

import {
  publicFormSubmissionLimiter
} from "./forms.public.rateLimit";

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
  publicFormSubmissionLimiter,
  FormsPublicController.submitForm
);

export default router;