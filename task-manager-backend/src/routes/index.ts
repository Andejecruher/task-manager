import { Router } from "express";

const router = Router();

// Importing task routes
import authRoutes from "@/routes/auth";
import driveRoutes from "@/routes/drive.routes";
import tasksRoutes from "@/routes/tasks";
import uploadRoutes from "@/routes/upload.routes";
import userRoutes from "@/routes/user";
import workspaceRoutes from "@/routes/workspace";
import workspacemenberRoutes from "@/routes/workspacemenber";

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/workspace", workspaceRoutes);
router.use("/task", tasksRoutes);
router.use("/workspace/members", workspacemenberRoutes);
router.use("/upload", uploadRoutes);
router.use("/drive", driveRoutes);

export default router;
