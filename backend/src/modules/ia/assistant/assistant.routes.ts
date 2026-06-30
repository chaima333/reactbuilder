import { Router } from "express";
import {
  assistant,
  editSelectedBlock
} from "./assistant.controller";

const router = Router();

router.post("/", assistant);

router.post("/edit-block", editSelectedBlock);

export default router;