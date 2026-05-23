import { Router } from "express";
import { upload } from "@/middlewares/upload.middleware";
import { uploadFiles } from "@/controllers/upload.controller";

const router = Router();

router.post("/upload", upload.array("files"), uploadFiles);

export default router;
