import { authController } from "@/controllers/auth";
import { CompanyGuard } from "@/guards/company";
import { authenticate, extractDeviceInfo } from "@/middlewares/auth";
import { Router } from "express";

const router = Router();

// ====================
// RUTAS PÚBLICAS
// ====================

/**
 * @route POST /api/v1/auth/register
 * @desc Registrar nueva empresa y usuario
 * @access Public
 */
router.post(
  "/register",
  extractDeviceInfo,
  authController.register.bind(authController),
);

/**
 * @route POST /api/v1/auth/login
 * @desc Iniciar sesión
 * @access Public
 */
router.post(
  "/login",
  extractDeviceInfo,
  authController.login.bind(authController),
);

/** * @route POST /api/v1/auth/refresh
 * @desc Refrescar tokens de acceso
 * @access Public (requiere refresh token)
 */
router.post("/refresh", authController.refreshTokens.bind(authController));

/**
 * @route POST /api/v1/auth/request-password-reset
 * @desc Solicitar reset de contraseña
 * @access Public
 */
router.post(
  "/request-password-reset",
  authController.requestPasswordReset.bind(authController),
);

/**
 * @route POST /api/v1/auth/reset-password
 * @desc Resetear contraseña con token
 * @access Public
 */
router.post(
  "/reset-password",
  authController.resetPassword.bind(authController),
);

/**
 * @route POST /api/v1/auth/verify-email/:token
 * @desc Verificar email con token
 * @access Public
 */
router.post(
  "/verify-email/:token",
  authController.verifyEmail.bind(authController),
);

// ====================
// RUTAS PRIVADAS (requieren autenticación)
// ====================

/**
 * @route POST /api/v1/auth/logout
 * @desc Cerrar sesión (sesión actual)
 * @access Private
 */
router.post(
  "/logout",
  authenticate,
  CompanyGuard,
  authController.logout.bind(authController),
);

/**
 * @route GET /api/v1/auth/profile
 * @desc Obtener perfil del usuario
 * @access Private
 */
router.get(
  "/profile",
  authenticate,
  CompanyGuard,
  authController.getProfile.bind(authController),
);

/**
 * @route PUT /api/v1/auth/profile
 * @desc Actualizar perfil
 * @access Private
 */
router.put(
  "/profile",
  authenticate,
  CompanyGuard,
  authController.updateProfile.bind(authController),
);

export default router;
