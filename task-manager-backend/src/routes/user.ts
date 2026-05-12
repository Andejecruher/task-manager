import { userController } from "@/controllers/user";
import { CompanyGuard } from "@/guards/company";
import {
  authenticate,
  extractDeviceInfo,
  requireEmailVerified,
} from "@/middlewares/auth";
import { Router } from "express";

const router = Router();

router.post(
  "/",
  authenticate,
  requireEmailVerified,
  CompanyGuard,
  extractDeviceInfo,
  userController.createUser.bind(userController),
);

//  Actualizar rol por ID
router.patch(
  "/:id/rol",
  authenticate,
  requireEmailVerified,
  CompanyGuard,
  extractDeviceInfo,
  userController.updateUserRoleById.bind(userController),
);

//  Eliminar usuario por ID
router.delete(
  "/:id",
  authenticate,
  requireEmailVerified,
  CompanyGuard,
  extractDeviceInfo,
  userController.deleteUserById.bind(userController),
);

// desactivar usuario por ID
router.patch(
  "/:id/deactivate",
  authenticate,
  requireEmailVerified,
  CompanyGuard,
  extractDeviceInfo,
  userController.deactivateUserById.bind(userController),
);

// Get all users for the company
router.get(
  "/",
  authenticate,
  requireEmailVerified,
  CompanyGuard,
  extractDeviceInfo,
  userController.getCompanyUsers.bind(userController),
);

// Get workspaces assigned/available for a user
router.get(
  "/:id/workspaces",
  authenticate,
  requireEmailVerified,
  CompanyGuard,
  extractDeviceInfo,
  userController.getUserWorkspaces.bind(userController),
);

// Assign workspaces to a user (bulk)
router.post(
  "/:id/assign-workspaces",
  authenticate,
  requireEmailVerified,
  CompanyGuard,
  extractDeviceInfo,
  userController.assignWorkspacesToUser.bind(userController),
);

// Unassign workspaces from a user (bulk)
router.delete(
  "/:id/unassign-workspaces",
  authenticate,
  requireEmailVerified,
  CompanyGuard,
  extractDeviceInfo,
  userController.unassignWorkspacesFromUser.bind(userController),
);

export default router;
