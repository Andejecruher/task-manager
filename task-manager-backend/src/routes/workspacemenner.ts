import {
    authenticate,
    extractDeviceInfo,
    requireEmailVerified,
} from "@/middlewares/auth";
import { Router } from "express";

const router = Router();

// Get all workspaces for the authenticated user
router.get(
    "/",
    authenticate,
    requireEmailVerified,
    extractDeviceInfo,
    (req, res) => {
        // Placeholder for fetching workspaces logic
        res.json({ message: "List of workspaces for the authenticated user" });
    }
);

// get all workspaces for the user id
router.get(
    "/:id",
    authenticate,
    requireEmailVerified,
    extractDeviceInfo,
    (req, res) => {
        const { id } = req.params;
        // Placeholder for fetching workspaces logic
        res.json({ message: `List of workspaces for user ID: ${id}` });
    }
);





export default router;