import 'dotenv/config';

export const config = {
    // Server
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.APP_PORT || '3000'),

    // Database
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        name: process.env.DB_NAME || 'taskmanager_dev',
        user: process.env.DB_USER || 'taskmanager_user',
        password: process.env.DB_PASSWORD || 'dev_password_123',
        dialect: 'postgres',
        pool: {
            max: parseInt(process.env.DB_POOL_MAX || '10'),
            min: parseInt(process.env.DB_POOL_MIN || '2'),
            acquire: 30000,
            idle: 10000
        },
        ssl: process.env.DB_SSL === 'true',
    },

    // Redis
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        ttl: parseInt(process.env.REDIS_TTL || '3600'),
    },

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'dev_secret_change_in_production',
        accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
        refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
        issuer: process.env.JWT_ISSUER || 'task-manager-api',
    },

    // Security
    security: {
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
        corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    },

    // smtp
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.example.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || '',
        from: process.env.SMTP_FROM || '',
    },

    // Application    
    app: {
        url: process.env.APP_URL || 'http://localhost:3000',
        frontendUrl: process.env.APP_FRONTEND_URL || 'http://localhost:5173',
    },

    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
    },


};