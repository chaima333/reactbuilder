// backend/src/modules/invitations/invitation.routes.ts

import {
  Router
} from "express";

import {
  acceptInvitation
} from "./invitation.controller";

const router =
  Router();

router.post(
  "/accept",
  acceptInvitation
);

export default router;