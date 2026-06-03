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

  try {
    // Subir a Google Drive
    const driveFiles = await uploadFilesToDrive(files);
    
  
   // Extraer URLs de Google Drive (prioridad a webViewLink para ver en navegador)
const urls = driveFiles.map((file) => 
  file.webViewLink || file.webContentLink || `https://drive.google.com/file/d/${file.id}/view`
);
    // Limpiar archivos temporales
    await Promise.all(
      files.map((file) => fs.unlink(file.path).catch(() => {}))
    );
    
    // Devolver URLs de Google Drive
    res.status(200).json({
      success: true,
      urls,
      files: driveFiles,
    });
    
  } catch (error) {
    logger.error("Error uploading to Google Drive:", error);
    res.status(500).json({ 
      success: false, 
      error: "Error uploading files to Google Drive" 
    });
  }
};