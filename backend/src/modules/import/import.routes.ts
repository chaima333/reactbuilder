import { Router } from "express";
import multer from "multer";
import { importHtmlZip } from "./import.controller";

const router = Router();

const upload = multer({
  dest: "temp/"
});

router.post(
  "/html-zip",
  upload.single("zip"),
  importHtmlZip
);

export default router;