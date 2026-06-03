import { getDriveClient } from "@/services/drive";
import type { NextFunction, Request, Response } from "express";
import { Router } from "express";

const router = Router();

// Stream a file from Google Drive using server credentials. This allows
// previewing private files without exposing them publicly.
router.get(
    "/preview/:driveId",
    async (req: Request, res: Response, next: NextFunction) => {
        const { driveId } = req.params;
        try {
            const drive = getDriveClient();

            // Fetch metadata first so we can set headers
            const meta = await drive.files.get({ fileId: driveId, fields: "name,mimeType,size" });
            const mimeType = meta.data.mimeType || "application/octet-stream";
            const name = meta.data.name || "file";

            res.setHeader("Content-Type", mimeType);
            res.setHeader("Content-Disposition", `inline; filename="${name}"`);

            const streamRes = await drive.files.get(
                { fileId: driveId, alt: "media" },
                { responseType: "stream" as any },
            );

            // Pipe the Drive file stream to the response
            streamRes.data.pipe(res);
        } catch (err: any) {
            // Google Drive API returns errors when file is not found or not accessible
            if (err && err.code === 404) {
                return res.status(404).apiError("File not found", 404);
            }
            if (err && err.errors && err.errors[0] && err.errors[0].reason === "fileNotFound") {
                return res.status(404).apiError("File not found", 404);
            }
            next(err);
        }
    },
);

export default router;
