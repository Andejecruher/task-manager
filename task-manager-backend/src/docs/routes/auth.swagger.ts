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
 *           example: Validation Error
 *         message:
 *           type: string
 *           example: Los datos proporcionados son inválidos
 *         data:
 *           type: object
 *           maxLength: 10
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
 *         data:
 *           type: object
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

/**
 * @swagger
 * /api/v1/auth/logout-all:
 *   post:
 *     summary: Cerrar todas las sesiones
 *     description: Revoca todas las sesiones activas del usuario.
 *     operationId: authLogoutAll
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout de todas las sesiones exitoso
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
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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

/**
 * @swagger
 * /api/v1/auth/companies:
 *   get:
 *     summary: Obtener compañías del usuario
 *     description: Lista todas las compañías a las que el usuario pertenece
 *     operationId: authListCompanies
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Compañías obtenidas
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
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           slug:
 *                             type: string
 *                           plan:
 *                             type: string
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
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /api/v1/auth/switch-company/{companySlug}:
 *   post:
 *     summary: Cambiar de compañía activa
 *     description: Cambia el contexto de la compañía actual del usuario
 *     operationId: authSwitchCompany
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companySlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cambio de compañía exitoso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CompanyContext'
 *       400:
 *         description: Slug de compañía inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *         description: Compañía no encontrada
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

// Empty export to make this a module
export { };

