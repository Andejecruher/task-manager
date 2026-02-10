import { plainToClass } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  validate,
} from "class-validator";
import { Request, Response } from "express";
import { authService } from "../services/auth";
import { AuthError, LoginDTO, RegisterDTO, ResetPasswordDTO } from "../types";
import { logger } from "../utils/logger";

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
}

class LoginDTOClass implements LoginDTO {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  companySlug!: string;
}

class ResetPasswordDTOClass implements ResetPasswordDTO {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(10)
  newPassword!: string;
}

export class AuthController {
  /**
   * @route POST /api/v1/auth/register
   * @desc Registrar nueva empresa y usuario
   * @access Public
   */
  async register(req: Request, res: Response) {
    try {
      // Validar datos de entrada
      const dto = plainToClass(RegisterDTOClass, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        return (res.status(400) as any).apiValidationError(errors);
      }

      const result = await authService.register(dto, (req as any).deviceInfo);

      res.status(201).apiSuccess(result, "Registro exitoso");
    } catch (error) {
      this.handleError(error, res, "register");
    }
  }

  /**
   * @route POST /api/v1/auth/login
   * @desc Iniciar sesión
   * @access Public
   */
  async login(req: Request, res: Response) {
    try {
      // Validar datos de entrada
      const dto = plainToClass(LoginDTOClass, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        return res.status(400).apiValidationError(errors);
      }

      const deviceInfo = (req as any).deviceInfo || {};
      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await authService.login(dto, deviceInfo, ipAddress);

      // Configurar cookies (opcional)
      this.setAuthCookies(res, result.tokens);

      return res.apiSuccess(result, "Login exitoso");
    } catch (error) {
      return this.handleError(error, res, "login");
    }
  }

  async refreshTokens(req: Request, res: Response) {
    try {
      const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

      if (!refreshToken) {
        throw new AuthError(
          "Refresh token requerido",
          "MISSING_REFRESH_TOKEN",
          400,
        );
      }

      const tokens = await authService.refreshTokens(refreshToken);

      // Actualizar cookies
      this.setAuthCookies(res, tokens);

      res.apiSuccess(tokens, "Tokens refrescados");
    } catch (error) {
      this.handleError(error, res, "refresh");
    }
  }

  /**
  * @route POST /api/v1/auth/request-password-reset
  * @desc Solicitar reset de contraseña
  * @access Public
  */
  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email, companySlug } = req.body;

      if (!email || !companySlug) {
        throw new AuthError('Email y empresa son requeridos', 'VALIDATION_ERROR', 400);
      }

      const response = await authService.requestPasswordReset(email, companySlug);

      // Por seguridad, siempre devolvemos éxito aunque el email no exista
      res.apiSuccess(
        response,
        'Si el email existe, recibirás instrucciones para resetear tu contraseña'
      );

    } catch (error) {
      this.handleError(error, res, 'requestPasswordReset');
    }
  }

  /**
   * @route POST /api/v1/auth/reset-password
   * @desc Resetear contraseña con token
   * @access Public
   */
  async resetPassword(req: Request, res: Response) {
    try {
      // Validar datos de entrada
      const dto = plainToClass(ResetPasswordDTOClass, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        return res.status(400).apiValidationError(errors);
      }

      await authService.resetPassword(dto);

      res.apiSuccess(null, 'Contraseña reseteada exitosamente');

    } catch (error) {
      this.handleError(error, res, 'resetPassword');
    }
  }



  // ====================
  // MÉTODOS PRIVADOS
  // ====================

  private handleError(error: any, res: Response, endpoint: string) {
    logger.error(`Error en auth/${endpoint}:`, error);

    if (error instanceof AuthError) {
      return (res.status(error.statusCode) as any).apiError(
        error.message,
        error.statusCode,
        {
          code: error.code,
        },
      );
    }

    // Manejar errores de validación de class-validator
    if (Array.isArray(error) && error[0]?.constraints) {
      return (res.status(400) as any).apiValidationError(error);
    }

    // Error inesperado
    (res.status(500) as any).apiError("Error interno del servidor");
  }

  private setAuthCookies(res: Response, tokens: any) {
    const isProduction = process.env.NODE_ENV === "production";

    // Access token cookie (httpOnly, seguro)
    res.cookie("access_token", tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: tokens.expiresIn * 1000,
      path: "/",
    });

    // Refresh token cookie (httpOnly, seguro)
    res.cookie("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: tokens.refreshExpiresIn
        ? tokens.refreshExpiresIn * 1000
        : 604800000,
      path: "/api/v1/auth/refresh",
    });

    // Token para frontend (no httpOnly, solo para lectura)
    res.cookie("token", tokens.accessToken, {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: tokens.expiresIn * 1000,
      path: "/",
    });
  }
}

// Instancia singleton
export const authController = new AuthController();
