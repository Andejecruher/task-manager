import { Pool, PoolConfig } from 'pg';
import { config } from '../config';
import { logger } from '../utils/logger';

class DatabaseConnection {
    private static instance: DatabaseConnection;
    private pool: Pool;

    private constructor() {
        const poolConfig: PoolConfig = {
            host: config.database.host,
            port: config.database.port,
            database: config.database.name,
            user: config.database.user,
            password: config.database.password,
            max: config.database.pool.max,
            min: config.database.pool.min,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
            ssl: config.database.ssl ? {
                rejectUnauthorized: false,
            } : false,
        };

        this.pool = new Pool(poolConfig);

        // Event listeners
        this.pool.on('connect', () => {
            logger.debug('🔄 Nueva conexión a PostgreSQL establecida');
        });

        this.pool.on('error', (err) => {
            logger.error('❌ Error en pool de PostgreSQL:', err);
        });
    }

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    public async query<T = any>(text: string, params?: any[]): Promise<T[]> {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;

            logger.debug('📝 Query ejecutada', {
                text,
                duration: `${duration}ms`,
                rows: result.rowCount,
            });

            return result.rows;
        } catch (error) {
            logger.error('❌ Error en query:', {
                text,
                params,
                error: error instanceof Error ? error.message : error,
            });
            throw error;
        }
    }

    public async queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
        const results = await this.query<T>(text, params);
        return results[0] || null;
    }

    public async transaction<T = any>(
        callback: (client: any) => Promise<T>
    ): Promise<T> {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    public async close(): Promise<void> {
        await this.pool.end();
        logger.info('👋 Conexión a PostgreSQL cerrada');
    }

    public getPool(): Pool {
        return this.pool;
    }
}

// Función de conveniencia para conectar
export const connectDatabase = async (): Promise<void> => {
    const db = DatabaseConnection.getInstance();

    try {
        // Test connection
        await db.query('SELECT 1 as connected');
        logger.info('✅ Conexión a PostgreSQL verificada');
    } catch (error) {
        logger.error('❌ Error conectando a PostgreSQL:', error);
        throw error;
    }
};

// Export singleton instance
export const db = DatabaseConnection.getInstance();

// Types
export type { Pool };
