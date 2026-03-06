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

/**
 * @swagger
 * components:
 *   schemas:
 *     ApiMeta:
 *       type: object
 *       properties:
 *         timestamp:
 *           type: string
 *           format: date-time
 *         requestId:
 *           type: string
 *     ApiSuccess:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           nullable: true
 *         message:
 *           type: string
 *           nullable: true
 *         meta:
 *           $ref: '#/components/schemas/ApiMeta'
 *     ApiError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *         message:
 *           type: string
 *         meta:
 *           type: object
 *           properties:
 *             timestamp:
 *               type: string
 *               format: date-time
 *             requestId:
 *               type: string
 *             details:
 *               type: object
 *               nullable: true
 *     ApiValidationError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: Validation Error
 *         message:
 *           type: string
 *           example: Los datos proporcionados son inválidos
 *         data:
 *           type: object
 *           properties:
 *             errors:
 *               type: array
 *               items:
 *                 type: object
 *         meta:
 *           $ref: '#/components/schemas/ApiMeta'
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - fullName
 *         - companyName
 *         - companySlug
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           maxLength: 10
 *         fullName:
 *           type: string
 *         companyName:
 *           type: string
 *         companySlug:
 *           type: string
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - companySlug
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *         companySlug:
 *           type: string
 *     RefreshTokensRequest:
 *       type: object
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: Opcional si se envía en cookie `refresh_token`.
 *     RequestPasswordResetRequest:
 *       type: object
 *       required:
 *         - email
 *         - companySlug
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         companySlug:
 *           type: string
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - token
 *         - newPassword
 *       properties:
 *         token:
 *           type: string
 *         newPassword:
 *           type: string
 *           format: password
 *           minLength: 6
 *           maxLength: 10
 *     UpdateProfileRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         fullName:
 *           type: string
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           format: password
 *         newPassword:
 *           type: string
 *           format: password
 *           minLength: 6
 *           maxLength: 10
 *
 *     LoginResponseData:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             email:
 *               type: string
 *               format: email
 *             fullName:
 *               type: string
 *               nullable: true
 *             role:
 *               type: string
 *             companyId:
 *               type: string
 *             emailVerified:
 *               type: boolean
 *             avatarUrl:
 *               type: string
 *               nullable: true
 *         tokens:
 *           type: object
 *           properties:
 *             verificationToken:
 *               type: string
 *               nullable: true
 *             accessToken:
 *               type: string
 *             refreshToken:
 *               type: string
 *             expiresIn:
 *               type: number
 *             refreshExpiresIn:
 *               type: number
 *         company:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             slug:
 *               type: string
 *             plan:
 *               type: string
 *     TokensResponseData:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *         expiresIn:
 *           type: number
 *     CompanyContext:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         slug:
 *           type: string
 *         name:
 *           type: string
 *         plan:
 *           type: string
 *         features:
 *           type: object
 *     AuthUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         companyId:
 *           type: string
 *         role:
 *           type: string
 *         fullName:
 *           type: string
 *           nullable: true
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *         sessionId:
 *           type: string
 *         isActive:
 *           type: boolean
 *         emailVerified:
 *           type: boolean
 *     MeResponseData:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/AuthUser'
 *         company:
 *           $ref: '#/components/schemas/CompanyContext'
 *         sessionId:
 *           type: string
 *     DeviceInfo:
 *       type: object
 *       properties:
 *         browser:
 *           type: string
 *           nullable: true
 *         os:
 *           type: string
 *           nullable: true
 *         device:
 *           type: string
 *           nullable: true
 *         ip:
 *           type: string
 *           nullable: true
 *         userAgent:
 *           type: string
 *           nullable: true
 *     SessionInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         deviceInfo:
 *           $ref: '#/components/schemas/DeviceInfo'
 *         lastActivityAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         isCurrent:
 *           type: boolean
 *         isActive:
 *           type: boolean
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
 *     description: Crea una nueva compañía y un usuario owner. Devuelve sesión y tokens.
 *     operationId: authRegister
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registro exitoso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/LoginResponseData'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ApiValidationError'
 *                 - $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Email o compañía ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *     description: Inicia sesión y crea una nueva sesión. Puede setear cookies `access_token`, `refresh_token` y `token`.
 *     operationId: authLogin
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/LoginResponseData'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ApiValidationError'
 *                 - $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Empresa no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       423:
 *         description: Cuenta bloqueada temporalmente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post(
  "/login",
  extractDeviceInfo,
  authController.login.bind(authController),
);

/**
 * @route POST /api/v1/auth/refresh
 * @desc Refrescar tokens de acceso
 * @access Public (requiere refresh token)
 */

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refrescar tokens de acceso
 *     description: Refresca tokens usando `refreshToken` en body o cookie `refresh_token`.
 *     operationId: authRefreshTokens
 *     tags: [Auth]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokensRequest'
 *     responses:
 *       200:
 *         description: Tokens refrescados
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TokensResponseData'
 *       400:
 *         description: Refresh token requerido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Sesión inválida o expirada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Cuenta desactivada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post("/refresh", authController.refreshTokens.bind(authController));

/**
 * @route POST /api/v1/auth/request-password-reset
 * @desc Solicitar reset de contraseña
 * @access Public
 */

/**
 * @swagger
 * /api/v1/auth/request-password-reset:
 *   post:
 *     summary: Solicitar reset de contraseña
 *     description: Por seguridad, siempre responde exitosamente aunque el email no exista.
 *     operationId: authRequestPasswordReset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestPasswordResetRequest'
 *     responses:
 *       200:
 *         description: Solicitud procesada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         resetToken:
 *                           type: string
 *                           nullable: true
 *                         expiresAt:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Resetear contraseña
 *     operationId: authResetPassword
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Contraseña reseteada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       nullable: true
 *                       example: null
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ApiValidationError'
 *                 - $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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

/**
 * @swagger
 * /api/v1/auth/verify-email/{token}:
 *   post:
 *     summary: Verificar email
 *     operationId: authVerifyEmail
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verificado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       nullable: true
 *                       example: null
 *       400:
 *         description: Token requerido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Revoca la sesión actual y limpia cookies asociadas.
 *     operationId: authLogout
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       nullable: true
 *                       example: null
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Acceso prohibido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Recurso no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario
 *     operationId: authGetProfile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Acceso prohibido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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

/**
 * @swagger
 * /api/v1/auth/profile:
 *   put:
 *     summary: Actualizar perfil
 *     operationId: authUpdateProfile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiValidationError'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Acceso prohibido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Obtener usuario actual
 *     operationId: authMe
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información de usuario obtenida
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MeResponseData'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Acceso prohibido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Recurso no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   post:
 *     summary: Cambiar contraseña
 *     description: Requiere email verificado.
 *     operationId: authChangePassword
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       nullable: true
 *                       example: null
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ApiValidationError'
 *                 - $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Acceso prohibido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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

/**
 * @swagger
 * /api/v1/auth/sessions:
 *   get:
 *     summary: Obtener sesiones activas
 *     operationId: authGetSessions
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesiones obtenidas
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SessionInfo'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Acceso prohibido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Recurso no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get(
  "/sessions",
  authenticate,
  CompanyGuard,
  authController.getSessions.bind(authController),
);

export default router;
