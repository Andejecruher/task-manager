// src/services/drive.service.ts
import { TaskAttachment } from "@/database/models";
import { logger } from "@/utils/logger";
import { google } from "googleapis";
import fs from "node:fs";

export function getDriveClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return google.drive({
    version: "v3",
    auth: oauth2Client,
  });
}

export async function uploadFileToDrive(file: Express.Multer.File) {
  const drive = getDriveClient();

  const response = await drive.files.create({
    requestBody: {
      name: file.originalname,
      mimeType: file.mimetype,
      parents: process.env.GOOGLE_DRIVE_FOLDER_ID
        ? [process.env.GOOGLE_DRIVE_FOLDER_ID]
        : undefined,
    },
    media: {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    },
    fields: "id,name,mimeType,size,webViewLink,webContentLink,createdTime",
  });

  return response.data;
}

// Servicio para cargar multiples archivos a Google Drive
export async function uploadFilesToDrive(files: Express.Multer.File[]) {
  const drive = getDriveClient();

  const uploadPromises = files.map(async (file) => {
    const response = await drive.files.create({
      requestBody: {
        name: file.originalname,
        mimeType: file.mimetype,
        parents: process.env.GOOGLE_DRIVE_FOLDER_ID
          ? [process.env.GOOGLE_DRIVE_FOLDER_ID]
          : undefined,
      },
      media: {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path),
      },
      fields: "id,name,mimeType,size,webViewLink,webContentLink,createdTime",
    });

    // ✅ SOLO AGREGAR ESTO - Hacer público sin guardar en local
    try {
      await drive.permissions.create({
        fileId: response.data.id!,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });
      logger.info(`Archivo ${file.originalname} subido y hecho público en Google Drive`);
    } catch (permError) {
      logger.error(`Error al hacer público el archivo ${file.originalname}:`, permError);
    }

    return response.data;
  });

  return Promise.all(uploadPromises);
}

// Servicio para eliminar un archivo de Google Drive
export async function deleteFileFromDrive(fileId: string) {
  const drive = getDriveClient();

  try {
    await drive.files.delete({ fileId });
    await TaskAttachment.update(
      { deleted_at: new Date() },
      { where: { id_in_drive: fileId } },
    );
    logger.info(`Archivo con ID ${fileId} eliminado de Google Drive`);
  } catch (error) {
    logger.error(`Error al eliminar el archivo con ID ${fileId} de Google Drive:`, error);
    throw error;
  }
}
