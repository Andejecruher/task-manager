import type { Request, Response } from "express";

export const uploadFiles = (req: Request, res: Response): void => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    res.status(400).json({ error: "No files uploaded" });
    return;
  }

  const urls = files.map((file) => `/uploads/${file.filename}`);
  res.status(200).json({ urls });
};
