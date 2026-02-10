import { Router } from 'express';
import { authController } from '../controllers/auth';
import { extractDeviceInfo } from '../middlewares/auth';

const router = Router();

// ====================
// RUTAS PÚBLICAS
// ====================

/**
 * @route POST /api/v1/auth/register
 * @desc Registrar nueva empresa y usuario
 * @access Public
 */
router.post('/register', extractDeviceInfo, authController.register.bind(authController));

/**
 * @route POST /api/v1/auth/login
 * @desc Iniciar sesión
 * @access Public
 */
router.post('/login', extractDeviceInfo, authController.login.bind(authController));


/** * @route POST /api/v1/auth/refresh
 * @desc Refrescar tokens de acceso
 * @access Public (requiere refresh token)
 */
router.post('/refresh', authController.refreshTokens.bind(authController));

/**
 * @route POST /api/v1/auth/request-password-reset
 * @desc Solicitar reset de contraseña
 * @access Public
 */
router.post('/request-password-reset', authController.requestPasswordReset.bind(authController));

/**
 * @route POST /api/v1/auth/reset-password
 * @desc Resetear contraseña con token
 * @access Public
 */
router.post('/reset-password', authController.resetPassword.bind(authController));


export default router;