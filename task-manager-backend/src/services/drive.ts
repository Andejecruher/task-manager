// src/services/drive.service.ts
import { google } from "googleapis";
import fs from "node:fs";

export function getDriveClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
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

  const uploadPromises = files.map((file) =>
    drive.files.create({
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
    })
  );

  const responses = await Promise.all(uploadPromises);
  return responses.map((res) => res.data);
}
