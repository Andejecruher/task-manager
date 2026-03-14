#!/usr/bin/env tsx
import "dotenv/config";

import { app } from "@/app";
import { config } from "@/config";
import { connectRedis } from "@/config/redis";
import { connectDatabase } from "@/database/connection";
import { sequelizeConnection } from "@/database/connection-sequelize";
import { initializeAssociations } from "@/database/models";
import { logger } from "@/utils/logger";

const PORT = config.PORT;
const NODE_ENV = config.NODE_ENV;

async function startServer() {
  try {
    // 1. Conectar a PostgreSQL
    logger.info("🔌 Conectando a PostgreSQL...");
    await connectDatabase();
    logger.info("✅ PostgreSQL conectado correctamente");

    try {
      logger.info("🔎 Verificando conexión Sequelize...");
      await sequelizeConnection.authenticate();
      logger.info("✅ Sequelize autenticado correctamente");

      // Inicializar asociaciones entre modelos antes de sincronizar
      logger.info("🔎 Inicializando asociaciones de modelos...");
      initializeAssociations();
      logger.info("✅ Asociaciones de modelos inicializadas");

      // Con migraciones SQL + tablas particionadas, sync debe ser opt-in
      const enableModelSync = config.database.dbSynMode;
      if (enableModelSync) {
        const enableSchemaAlter = config.database.dbSynAlter;
        logger.info("🔎 Ejecutando Sequelize sync...", {
          alter: enableSchemaAlter,
        });
        await sequelizeConnection.sync({ alter: enableSchemaAlter });
        logger.info("✅ Sequelize sync completado");

        if (enableSchemaAlter) {
          logger.warn("⚠️ DB_SYNC_ALTER=true: Sequelize alter está habilitado");
        }
      } else {
        logger.info("⏭️ Sequelize sync omitido (usar migraciones SQL)");
      }
    } catch (error) {
      logger.error("❌ Falló la inicialización de Sequelize", error);
      throw error;
    }

    // 2. Conectar a Redis (si está configurado)
    if (config.redis.host) {
      logger.info("🔌 Conectando a Redis...");
      await connectRedis();
      logger.info("✅ Redis conectado correctamente");
    }

    // 3. Iniciar servidor HTTP
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Servidor iniciado en modo ${NODE_ENV}`);
      logger.info(`📡 API disponible en: http://localhost:${PORT}`);
      logger.info(`📚 API Docs: http://localhost:${PORT}/api-docs`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
    });

    // 4. Manejar shutdown graceful
    const gracefulShutdown = (signal: string) => {
      logger.info(`⚠️  Recibido ${signal}. Cerrando servidor...`);

      server.close(() => {
        logger.info("👋 Servidor HTTP cerrado");

        // Aquí cerrarías conexiones a DB, Redis, etc.
        logger.info("✅ Shutdown completado");
        process.exit(0);
      });

      // Timeout for force shutdown
      setTimeout(() => {
        logger.error("⏰ Timeout forzando cierre...");
        process.exit(1);
      }, 10000);
    };

    // Capturar señales de terminación
    process.on("SIGTERM", () => {
      gracefulShutdown("SIGTERM");
    });
    process.on("SIGINT", () => {
      gracefulShutdown("SIGINT");
    });

    // Manejar errores no capturados
    process.on("unhandledRejection", (reason, promise) => {
      logger.error("🚨 Unhandled Rejection:", { reason, promise });
    });

    process.on("uncaughtException", (error) => {
      logger.error("🚨 Uncaught Exception:", error);
      process.exit(1);
    });
  } catch (error) {
    logger.error("❌ Error al iniciar servidor:", error);
    process.exit(1);
  }
}

// Iniciar aplicación
void startServer();
