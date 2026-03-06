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
import {
    AuthError,
    AuthRequest,
    LoginDTO,
    RegisterDTO,
    ResetPasswordDTO,
} from "@/types";
import { logger } from "@/utils/logger";
import { userService } from "@/services/user";


export class UserController {
    async createUser(req: Request, res: Response) {
        try {
            const user = await userService.createUser(req.body);
            res.status(201).json(user);
        } catch (error) {
            logger.error('Error creating user:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

export const userController = new UserController();
