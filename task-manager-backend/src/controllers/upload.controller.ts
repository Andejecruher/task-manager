import { deleteFileFromDrive, uploadFilesToDrive } from "@/services/drive";
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
      files.map((file) => fs.unlink(file.path).catch(() => {
        logger.warn(`No se pudo eliminar el archivo temporal: ${file.path}`);
      }))
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

export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Aquí deberías implementar la lógica para eliminar el archivo de Google Drive usando su ID
    // Por ejemplo, podrías usar una función deleteFileFromDrive(id) que hayas definido en tu servicio de drive

    await deleteFileFromDrive(id);

    res.status(200).json({
      success: true,
      message: `Archivo con ID ${id} eliminado correctamente`
    });
  } catch (error) {
    logger.error(`Error deleting file with ID ${id}:`, error);
    res.status(500).json({
      success: false,
      error: `Error deleting file with ID ${id}`
    });
  }
};
