import { Sequelize, type Dialect, type Transaction } from "sequelize";
import { logger } from "../utils/logger";
import { config } from "../config";

class SequelizeConnection {
  private static instance: SequelizeConnection;
  public sequelize: Sequelize;

  private constructor() {
    this.sequelize = new Sequelize(
      config.database.name,
      config.database.user,
      config.database.password,
      {
        host: config.database.host,
        port: config.database.port,
        dialect: config.database.dialect as Dialect,
        dialectOptions: {
          // Descomentar si se requiere SSL
          // ssl: {
          //     require: config.database.ssl,
          //     rejectUnauthorized: false
          // }
        },
        pool: config.database.pool,
        logging: (msg) => {
          if (process.env.NODE_ENV !== "test") {
            logger.debug(`📝 [Sequelize]  ${msg}`);
          }
        },
        define: {
          underscored: true, // Usar snake_case en DB
          timestamps: true, // created_at, updated_at
          paranoid: true, // deleted_at (soft delete)
          createdAt: "created_at",
          updatedAt: "updated_at",
          deletedAt: "deleted_at",
          freezeTableName: false, // Usar nombres plurales automáticamente
          charset: "utf8",
        },
        benchmark: true, // Muestra tiempo de ejecución de queries
        logQueryParameters: true,
      },
    );

    // Hooks de conexión
    this.sequelize.addHook("afterConnect", () => {
      logger.info("✅ Conexión Sequelize establecida");
    });

    this.sequelize.addHook("afterDisconnect", () => {
      logger.warn("⚠️ Conexión Sequelize cerrada");
    });
  }

  public static getInstance(): SequelizeConnection {
    if (!SequelizeConnection.instance) {
      SequelizeConnection.instance = new SequelizeConnection();
    }
    return SequelizeConnection.instance;
  }

  async authenticate(): Promise<void> {
    try {
      await this.sequelize.authenticate();
      logger.info("✅ Conexión a PostgreSQL verificada con Sequelize");
    } catch (error) {
      logger.error("❌ Error conectando a PostgreSQL:", error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.sequelize.close();
    logger.info("👋 Conexión Sequelize cerrada");
  }

  async sync(options?: { force?: boolean; alter?: boolean }): Promise<void> {
    try {
      await this.sequelize.sync(options);
      logger.info("✅ Modelos sincronizados con la base de datos");
    } catch (error) {
      logger.error("❌ Error sincronizando modelos:", error);
      throw error;
    }
  }

  async transaction<T>(callback: (t: Transaction) => Promise<T>): Promise<T> {
    const t = await this.sequelize.transaction();
    try {
      const result = await callback(t);
      await t.commit();
      return result;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  getSequelize(): Sequelize {
    return this.sequelize;
  }
}

// Exportar instancia singleton
export const sequelizeConnection = SequelizeConnection.getInstance();

// Función de conveniencia para conectar
export const connectSequelize = async (): Promise<void> => {
  await sequelizeConnection.authenticate();
};

// Exportar tipos
export type { Sequelize };
