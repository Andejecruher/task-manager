import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from "../utils/logger";

const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465, // true for 465, false for other ports
    auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
    },
});

export class NodemailerService {

    async sendEmailText(to: string, subject: string, text: string) {
        try {
            await transporter.sendMail({
                from: config.smtp.from,
                to,
                subject,
                text,
            });
            logger.info(`Email enviado a ${to} con asunto "${subject}"`);
        } catch (error) {
            console.error('Error enviando email:', error);
            throw new Error('No se pudo enviar el email');
        }
    }

    async sendEmailHtml(to: string, subject: string, html: string) {
        try {
            await transporter.sendMail({
                from: config.smtp.from,
                to,
                subject,
                html,
            });
            logger.info(`Email enviado a ${to} con asunto "${subject}"`);
        } catch (error) {
            console.error('Error enviando email:', error);
            throw new Error('No se pudo enviar el email');
        }
    }

    async sendEmail(to: string, subject: string, text: string, html: string) {
        try {
            await transporter.sendMail({
                from: config.smtp.from,
                to,
                subject,
                text,
                html,
            });
            logger.info(`Email enviado a ${to} con asunto "${subject}"`);
        } catch (error) {
            console.error('Error enviando email:', error);
            throw new Error('No se pudo enviar el email');
        }
    }
}

// Instancia singleton
export const emailService = new NodemailerService();
