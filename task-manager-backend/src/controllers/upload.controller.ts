import { uploadFilesToDrive } from "@/services/drive";
import { logger } from "@/utils/logger";
import type { Request, Response } from "express";
import fs from "node:fs/promises";

export const uploadFiles = async (req: Request, res: Response): Promise<void> => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    res.status(400).json({ error: "No files uploaded" });
    return;
  }

  const driveFile = await uploadFilesToDrive(files);

  await Promise.all(
    files.map((file) => fs.unlink(file.path).catch(() => {
      logger.error(`Error deleting file ${file.path}`);
    }))
  );

  const urls = files.map((file) => `/uploads/${file.filename}`);
  res.status(200).json({ urls, driveFile });
};
