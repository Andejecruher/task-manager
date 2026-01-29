import Redis from 'ioredis';
import { config } from '.';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;

export const connectRedis = async (): Promise<Redis> => {
    if (redisClient) {
        return redisClient;
    }

    try {
        redisClient = new Redis({
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.password || undefined,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            maxRetriesPerRequest: 3,
        });

        redisClient.on('connect', () => {
            logger.info('✅ Conectado a Redis');
        });

        redisClient.on('error', (error) => {
            logger.error('❌ Error en Redis:', error);
        });

        redisClient.on('reconnecting', () => {
            logger.warn('🔄 Reconectando a Redis...');
        });

        // Test connection
        await redisClient.ping();

        return redisClient;
    } catch (error) {
        logger.error('❌ Error conectando a Redis:', error);
        throw error;
    }
};

export const getRedisClient = (): Redis => {
    if (!redisClient) {
        throw new Error('Redis no está conectado. Llama a connectRedis() primero.');
    }
    return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
        logger.info('👋 Conexión a Redis cerrada');
    }
};