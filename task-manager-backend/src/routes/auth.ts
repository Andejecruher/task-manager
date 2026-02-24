import { authController } from "@/controllers/auth";
import { CompanyGuard } from "@/guards/company";
import {
  authenticate,
  extractDeviceInfo,
  requireEmailVerified,
} from "@/middlewares/auth";
import { Router } from "express";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación y manejo de usuarios
 */

// ====================
// RUTAS PÚBLICAS
// ====================

/**
 * @route POST /api/v1/auth/register
 * @desc Registrar nueva empresa y usuario
 * @access Public
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Registrar nueva empresa y usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *               - companyName
 *               - companySlug
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               fullName:
 *                 type: string
 *               companyName:
 *                 type: string
 *               companySlug:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registro exitoso
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Email o compañía ya existe
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

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - companySlug
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               companySlug:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 *       404:
 *         description: Empresa no encontrada
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

/**
 * @route GET /api/v1/auth/me
 * @desc Obtener información del usuario autenticado
 * @access Private
 */
router.get(
  "/me",
  authenticate,
  CompanyGuard,
  authController.getCurrentUser.bind(authController),
);

/**
 * @route POST /api/v1/auth/change-password
 * @desc Cambiar contraseña
 * @access Private
 */
router.post(
  "/change-password",
  authenticate,
  CompanyGuard,
  requireEmailVerified,
  authController.changePassword.bind(authController),
);

/**
 * @route GET /api/v1/auth/sessions
 * @desc Obtener sesiones activas
 * @access Private
 */
router.get(
  "/sessions",
  authenticate,
  CompanyGuard,
  authController.getSessions.bind(authController),
);

export default router;
