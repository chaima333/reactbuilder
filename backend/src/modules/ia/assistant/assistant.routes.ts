import { Router } from "express";
import {
  assistant
} from "./assistant.controller";
import { enforceAiPayloadLimit } from "../aiRequestLimits.middleware";

const router = Router();

router.use(enforceAiPayloadLimit);

router.post("/", assistant);

export default router;
