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
  "/:id/role",
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

export default router;
