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


export default router;