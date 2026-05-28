import { uploadFiles } from "@/controllers/upload.controller";
import { upload } from "@/middlewares/upload.middleware";
import { Router } from "express";

const router = Router();

router.post("/upload", upload.array("files"), uploadFiles);
router.get("/files/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = `${process.cwd()}/uploads/${filename}`;
  res.sendFile(filePath);
});

export default router;
