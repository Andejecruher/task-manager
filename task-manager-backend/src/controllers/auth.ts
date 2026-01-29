import { plainToClass } from 'class-transformer';
import { IsEmail, IsIn, IsNotEmpty, IsString, MaxLength, MinLength, validate } from 'class-validator';
import { Request, Response } from 'express';
import {
    AuthError,
    RegisterDTO
} from '../types';
import { logger } from '../utils/logger';

// DTOs para validación
class RegisterDTOClass implements RegisterDTO {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(10)
    password!: string;

    @IsString()
    @IsNotEmpty()
    fullName!: string;

    @IsString()
    @IsNotEmpty()
    companyName!: string;

    @IsString()
    @IsNotEmpty()
    companySlug!: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(['admin', 'user'])
    role!: string;
}


export class AuthController {
    /**
       * @route POST /api/v1/auth/register
       * @desc Registrar nueva empresa y usuario
       * @access Public
       */
    async register(req: Request, res: Response) {
        try {
            console.log('Registrando empresa y usuario:', req.body);
            // Validar datos de entrada
            const dto = plainToClass(RegisterDTOClass, req.body);
            const errors = await validate(dto);

            if (errors.length > 0) {
                return (res.status(400) as any).apiValidationError(errors);
            }

            // const result = await authService.register(dto);

            res.status(201).apiSuccess(errors, 'Registro exitoso');

        } catch (error) {
            this.handleError(error, res, 'register');
        }
    }

    // ====================
    // MÉTODOS PRIVADOS
    // ====================

    private handleError(error: any, res: Response, endpoint: string) {
        logger.error(`Error en auth/${endpoint}:`, error);

        if (error instanceof AuthError) {
            return (res.status(error.statusCode) as any).apiError(error.message, error.statusCode, {
                code: error.code
            });
        }

        // Manejar errores de validación de class-validator
        if (Array.isArray(error) && error[0]?.constraints) {
            return (res.status(400) as any).apiValidationError(error);
        }

        // Error inesperado
        (res.status(500) as any).apiError('Error interno del servidor');
    }
}

// Instancia singleton
export const authController = new AuthController();