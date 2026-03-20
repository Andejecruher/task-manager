import { Router } from "express";

const router = Router();

// Importing task routes
import authRoutes from "@/routes/auth";
import userRoutes from "@/routes/user";
import workspaceRoutes from "@/routes/workspace";
import workspacememberRoutes from "@/routes/workspacemember";

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/workspace", workspaceRoutes);
router.use("/workspace/members", workspacememberRoutes);

export default router;
