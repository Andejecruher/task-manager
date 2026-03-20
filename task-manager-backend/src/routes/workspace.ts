import { workspaceController } from "@/controllers/workspace";
import { CompanyGuard } from "@/guards/company";
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
  CompanyGuard,
  workspaceController.getWorkspaces.bind(workspaceController),
);

router.post(
  "/",
  authenticate,
  requireEmailVerified,
  extractDeviceInfo,
  CompanyGuard,
  workspaceController.createWorkspace.bind(workspaceController),
);

// Get a specific workspace by ID
router.get(
  "/:id",
  authenticate,
  requireEmailVerified,
  extractDeviceInfo,
  CompanyGuard,
  workspaceController.getWorkspaceById.bind(workspaceController),
);

// Update a specific workspace by ID
router.put(
  "/:id",
  authenticate,
  requireEmailVerified,
  extractDeviceInfo,
  CompanyGuard,
  workspaceController.updateWorkspaceById.bind(workspaceController),
);

// Delete a specific workspace by ID
router.delete(
  "/:id",
  authenticate,
  requireEmailVerified,
  extractDeviceInfo,
  CompanyGuard,
  workspaceController.deleteWorkspaceById.bind(workspaceController),
);

// Get all members for the workspace
router.get(
  "/:id/members",
  authenticate,
  requireEmailVerified,
  extractDeviceInfo,
  CompanyGuard,
  workspaceController.getWorkspaceMembers.bind(workspaceController),
);

// Add a member to the workspace
router.post(
  "/:id/members",
  authenticate,
  requireEmailVerified,
  extractDeviceInfo,
  CompanyGuard,
  workspaceController.addWorkspaceMember.bind(workspaceController),
);

// Remove a member from the workspace
router.delete(
  "/:id/members/:memberId",
  authenticate,
  requireEmailVerified,
  extractDeviceInfo,
  (req, res) => {
    const { id, memberId } = req.params;
    // Placeholder for removing a member from the workspace logic
    res.json({
      message: `Member with ID: ${memberId} removed from workspace with ID: ${id} successfully`,
    });
  },
);

// Get all tasks for the workspace
router.get(
  "/:id/tasks",
  authenticate,
  requireEmailVerified,
  extractDeviceInfo,
  (req, res) => {
    const { id } = req.params;
    // Placeholder for fetching workspace tasks logic
    res.json({ message: `List of tasks for workspace ID: ${id}` });
  },
);

export default router;
