#!/usr/bin/env tsx

import * as dotenv from 'dotenv';
import Redis from 'ioredis';
import { Client } from 'pg';

dotenv.config();

interface HealthCheck {
    service: string;
    status: 'healthy' | 'unhealthy';
    latency?: number;
    error?: string;
    details?: any;
}

class HealthChecker {
    private checks: HealthCheck[] = [];

    async checkPostgreSQL(): Promise<HealthCheck> {
        const start = Date.now();

        try {
            const client = new Client({
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432'),
                database: process.env.DB_NAME || 'taskmanager_dev',
                user: process.env.DB_USER || 'taskmanager_user',
                password: process.env.DB_PASSWORD || 'dev_password_123',
            });

            await client.connect();

            // Verificar conexión
            await client.query('SELECT 1 as health_check');

            // Verificar migraciones
            const migrations = await client.query(
                'SELECT COUNT(*) as count FROM migrations'
            );

            // Verificar tablas críticas
            const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name IN ('companies', 'users', 'tasks')
      `);

            await client.end();

            return {
                service: 'PostgreSQL',
                status: 'healthy',
                latency: Date.now() - start,
                details: {
                    migrations: parseInt(migrations.rows[0].count),
                    criticalTables: tables.rows.length
                }
            };

        } catch (error: any) {
            return {
                service: 'PostgreSQL',
                status: 'unhealthy',
                latency: Date.now() - start,
                error: error.message
            };
        }
    }

    async checkRedis(): Promise<HealthCheck> {
        const start = Date.now();

        try {
            const redis = new Redis({
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
                password: process.env.REDIS_PASSWORD,
                retryStrategy: () => null
            });

            // Test connection
            await redis.ping();

            // Get info
            const info = await redis.info();
            const usedMemory = info.match(/used_memory_human:(\S+)/)?.[1] || 'unknown';

            await redis.quit();

            return {
                service: 'Redis',
                status: 'healthy',
                latency: Date.now() - start,
                details: { usedMemory }
            };

        } catch (error: any) {
            return {
                service: 'Redis',
                status: 'unhealthy',
                latency: Date.now() - start,
                error: error.message
            };
        }
    }

    async checkDiskSpace(): Promise<HealthCheck> {
        const start = Date.now();

        try {
            const fs = await import('fs/promises');
            const stats = await fs.statfs('/');

            const total = stats.blocks * stats.bsize;
            const free = stats.bfree * stats.bsize;
            const used = total - free;
            const percentUsed = (used / total) * 100;

            return {
                service: 'Disk Space',
                status: percentUsed > 90 ? 'unhealthy' : 'healthy',
                latency: Date.now() - start,
                details: {
                    total: this.formatBytes(total),
                    free: this.formatBytes(free),
                    used: this.formatBytes(used),
                    percentUsed: percentUsed.toFixed(2) + '%'
                }
            };

        } catch (error: any) {
            return {
                service: 'Disk Space',
                status: 'unhealthy',
                latency: Date.now() - start,
                error: error.message
            };
        }
    }

    async checkAppStatus(): Promise<HealthCheck> {
        const start = Date.now();

        try {
            const response = await fetch(`http://localhost:${process.env.APP_PORT || 3000}/health`);
            const data = await response.json();

            return {
                service: 'Application',
                status: response.ok ? 'healthy' : 'unhealthy',
                latency: Date.now() - start,
                details: data
            };

        } catch (error: any) {
            return {
                service: 'Application',
                status: 'unhealthy',
                latency: Date.now() - start,
                error: error.message
            };
        }
    }

    private formatBytes(bytes: number): string {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let value = bytes;
        let unitIndex = 0;

        while (value >= 1024 && unitIndex < units.length - 1) {
            value /= 1024;
            unitIndex++;
        }

        return `${value.toFixed(2)} ${units[unitIndex]}`;
    }

    async runAllChecks(): Promise<HealthCheck[]> {
        console.log('🔍 Iniciando verificación de salud del sistema...\n');

        const checks = await Promise.all([
            this.checkPostgreSQL(),
            this.checkRedis(),
            this.checkDiskSpace(),
            this.checkAppStatus()
        ]);

        this.checks = checks;
        return checks;
    }

    printReport(): void {
        console.log('📊 REPORTE DE SALUD DEL SISTEMA');
        console.log('='.repeat(50));

        let allHealthy = true;

        this.checks.forEach(check => {
            const emoji = check.status === 'healthy' ? '✅' : '❌';
            console.log(`${emoji} ${check.service}`);
            console.log(`   Estado: ${check.status.toUpperCase()}`);
            console.log(`   Latencia: ${check.latency}ms`);

            if (check.details) {
                console.log(`   Detalles:`);
                Object.entries(check.details).forEach(([key, value]) => {
                    console.log(`     • ${key}: ${value}`);
                });
            }

            if (check.error) {
                console.log(`   Error: ${check.error}`);
                allHealthy = false;
            }

            console.log();
        });

        console.log('='.repeat(50));
        console.log(allHealthy ? '🎉 TODOS LOS SERVICIOS ESTÁN SALUDABLES' : '⚠️  ALGUNOS SERVICIOS TIENEN PROBLEMAS');
    }
}

// Ejecutar verificación
async function main() {
    const checker = new HealthChecker();
    const checks = await checker.runAllChecks();
    checker.printReport();

    // Exit code basado en estado
    const allHealthy = checks.every(check => check.status === 'healthy');
    process.exit(allHealthy ? 0 : 1);
}

main().catch(console.error);