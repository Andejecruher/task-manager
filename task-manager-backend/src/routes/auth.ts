import { authController } from "@/controllers/auth";
import { CompanyGuard, validateCompanySlug } from "@/guards/company";
import {
  authenticate,
  extractDeviceInfo,
  requireEmailVerified,
} from "@/middlewares/auth";
import { UserRole } from '@/types';
import { Router } from "express";
import {
  MinRoleGuard
} from '../guards/roles';

import { CompanyController } from "@/controllers/company";

const router = Router();

// ====================
// RUTAS PÚBLICAS
// ====================

router.post(
  "/register",
  extractDeviceInfo,
  authController.register.bind(authController),
);

router.post(
  "/login",
  extractDeviceInfo,
  authController.login.bind(authController),
);

router.post("/refresh", authController.refreshTokens.bind(authController));

router.post(
  "/request-password-reset",
  authController.requestPasswordReset.bind(authController),
);

router.post(
  "/reset-password",
  authController.resetPassword.bind(authController),
);

router.post(
  "/verify-email/:token",
  authController.verifyEmail.bind(authController),
);

// ====================
// RUTAS PRIVADAS (requieren autenticación)
// ====================

router.post(
  "/logout",
  authenticate,
  CompanyGuard,
  authController.logout.bind(authController),
);

/**
 * @route POST /api/v1/auth/logout-all
 * @desc Cerrar todas las sesiones
 * @access Private
 */
router.post(
  '/logout-all',
  authenticate,
  CompanyGuard,
  MinRoleGuard(UserRole.MEMBER),
  authController.logoutAll.bind(authController)
);

router.get(
  "/profile",
  authenticate,
  CompanyGuard,
  authController.getProfile.bind(authController),
);

router.put(
  "/profile",
  authenticate,
  CompanyGuard,
  authController.updateProfile.bind(authController),
);

router.get(
  "/me",
  authenticate,
  CompanyGuard,
  authController.getCurrentUser.bind(authController),
);

router.post(
  "/change-password",
  authenticate,
  CompanyGuard,
  requireEmailVerified,
  authController.changePassword.bind(authController),
);

router.get(
  "/sessions",
  authenticate,
  CompanyGuard,
  authController.getSessions.bind(authController),
);

// ====================
// RUTAS DE COMPAÑÍA
// ====================

router.get(
  '/companies',
  authenticate,
  CompanyController.listCompanies.bind(CompanyController),
);

router.post(
  '/switch-company/:companySlug',
  authenticate,
  validateCompanySlug,
  CompanyController.switchCompany.bind(CompanyController),
);

export default router;
