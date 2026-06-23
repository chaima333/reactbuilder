// assistant.routes.ts

import { Router } from "express";
import { assistant } from "./assistant.controller";

const router = Router();

router.post("/", assistant);

export default router;