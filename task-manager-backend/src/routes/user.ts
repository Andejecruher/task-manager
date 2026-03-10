import { userController } from "@/controllers/user";
import { CompanyGuard } from "@/guards/company";
import { authenticate, extractDeviceInfo, requireEmailVerified } from "@/middlewares/auth";
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

export default router;
