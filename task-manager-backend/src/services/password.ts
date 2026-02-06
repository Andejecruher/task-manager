import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AuthError, PASSWORD_REGEX } from '../types';
import { logger } from '../utils/logger';

export class PasswordService {
    private readonly saltRounds: number;

    constructor(saltRounds: number = 12) {
        this.saltRounds = saltRounds;
    }

    /**
     * Valida que la contraseña cumple con los requisitos de seguridad
     */
    validatePassword(password: string): void {
        if (!PASSWORD_REGEX.test(password)) {
            throw new AuthError(
                'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial',
                'PASSWORD_REQUIREMENTS_NOT_MET',
                400
            );
        }
    }

    /**
     * Genera hash de contraseña
     */
    async hashPassword(password: string): Promise<string> {
        try {
            const salt = await bcrypt.genSalt(this.saltRounds);
            return await bcrypt.hash(password, salt);
        } catch (error) {
            logger.error('Error generando hash de contraseña:', error);
            throw new AuthError('Error procesando contraseña', 'PASSWORD_HASH_ERROR', 500);
        }
    }

    /**
     * Compara contraseña con hash de forma segura
     */
    async comparePassword(password: string, hash: string): Promise<boolean> {
        try {
            return await bcrypt.compare(password, hash);
        } catch (error) {
            logger.error('Error comparando contraseñas:', error);
            throw new AuthError('Error verificando contraseña', 'PASSWORD_COMPARE_ERROR', 500);
        }
    }

    /**
     * Genera token seguro para reset de contraseña
     */
    generateResetToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Genera hash del token para almacenamiento seguro
     */
    hashResetToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    /**
     * Genera código numérico para verificación
     */
    generateVerificationCode(length: number = 6): string {
        const numbers = '0123456789';
        let code = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = crypto.randomInt(0, numbers.length);
            code += numbers[randomIndex];
        }

        return code;
    }

    /**
     * Valida fortaleza de contraseña y devuelve score
     */
    getPasswordStrength(password: string): {
        score: number; // 0-4
        feedback: string[];
    } {
        const feedback: string[] = [];
        let score = 0;

        // Longitud mínima
        if (password.length >= 8) score++;
        else feedback.push('Debe tener al menos 8 caracteres');

        // Caracteres variados
        if (/[a-z]/.test(password)) score++;
        else feedback.push('Debe incluir letras minúsculas');

        if (/[A-Z]/.test(password)) score++;
        else feedback.push('Debe incluir letras mayúsculas');

        if (/[0-9]/.test(password)) score++;
        else feedback.push('Debe incluir números');

        if (/[@$!%*?&]/.test(password)) score++;
        else feedback.push('Debe incluir caracteres especiales (@$!%*?&)');

        return { score, feedback };
    }

    /**
     * Genera contraseña aleatoria segura
     */
    generateSecurePassword(length: number = 16): string {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '@$!%*?&';
        const allChars = uppercase + lowercase + numbers + symbols;

        let password = '';

        // Asegurar al menos un carácter de cada tipo
        password += uppercase[crypto.randomInt(0, uppercase.length)];
        password += lowercase[crypto.randomInt(0, lowercase.length)];
        password += numbers[crypto.randomInt(0, numbers.length)];
        password += symbols[crypto.randomInt(0, symbols.length)];

        // Completar con caracteres aleatorios
        for (let i = 4; i < length; i++) {
            password += allChars[crypto.randomInt(0, allChars.length)];
        }

        // Mezclar la contraseña
        return password.split('').sort(() => 0.5 - Math.random()).join('');
    }
}

// Instancia singleton
export const passwordService = new PasswordService();