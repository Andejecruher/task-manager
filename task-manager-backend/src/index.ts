#!/usr/bin/env tsx

import 'dotenv/config';
import { app } from './app';
import { connectRedis } from './config/redis';
import { connectDatabase } from './database/connection';
import { logger } from './utils/logger';
import { sequelizeConnection } from './database/connection-sequelize';

const PORT = process.env.APP_PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    // 1. Conectar a PostgreSQL
    logger.info('🔌 Conectando a PostgreSQL...');
    await connectDatabase();
    logger.info('✅ PostgreSQL conectado correctamente');

    try {
      await sequelizeConnection.authenticate();
      console.log('Connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }

    // 2. Conectar a Redis (si está configurado)
    if (process.env.REDIS_HOST) {
      logger.info('🔌 Conectando a Redis...');
      await connectRedis();
      logger.info('✅ Redis conectado correctamente');
    }

    // 3. Iniciar servidor HTTP
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Servidor iniciado en modo ${NODE_ENV}`);
      logger.info(`📡 API disponible en: http://localhost:${PORT}`);
      logger.info(`📚 API Docs: http://localhost:${PORT}/api-docs`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
    });

    // 4. Manejar shutdown graceful
    const gracefulShutdown = async (signal: string) => {
      logger.info(`⚠️  Recibido ${signal}. Cerrando servidor...`);

      server.close(async () => {
        logger.info('👋 Servidor HTTP cerrado');

        // Aquí cerrarías conexiones a DB, Redis, etc.
        logger.info('✅ Shutdown completado');
        process.exit(0);
      });

      // Timeout for force shutdown
      setTimeout(() => {
        logger.error('⏰ Timeout forzando cierre...');
        process.exit(1);
      }, 10000);
    };

    // Capturar señales de terminación
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Manejar errores no capturados
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('🚨 Unhandled Rejection:', { reason, promise });
    });

    process.on('uncaughtException', (error) => {
      logger.error('🚨 Uncaught Exception:', error);
      process.exit(1);
    });

  } catch (error) {
    logger.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

// Iniciar aplicación
startServer();