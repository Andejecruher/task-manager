#!/usr/bin/env tsx

import * as dotenv from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
import { basename, join } from 'path';
import { Client } from 'pg';

dotenv.config();

interface Migration {
    name: string;
    up: string;
    down: string;
}

class MigrationRunner {
    private client: Client;
    private migrationsDir: string;

    constructor() {
        this.client = new Client({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME || 'taskmanager_dev',
            user: process.env.DB_USER || 'taskmanager_app',
            password: process.env.DB_PASSWORD || 'app_password_456',
        });

        this.migrationsDir = join(__dirname, '../src/database/migrations');
    }

    async connect() {
        await this.client.connect();
        console.log('✅ Conectado a PostgreSQL');
    }

    async createMigrationsTable() {
        const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        checksum VARCHAR(64),
        execution_time_ms INTEGER
      );
    `;
        await this.client.query(query);
        console.log('✅ Tabla de migraciones verificada');
    }

    async getExecutedMigrations(): Promise<string[]> {
        const result = await this.client.query(
            'SELECT name FROM migrations ORDER BY executed_at'
        );
        return result.rows.map(row => row.name);
    }

    async getPendingMigrations(): Promise<Migration[]> {
        const executed = await this.getExecutedMigrations();
        const files = readdirSync(this.migrationsDir)
            .filter(f => f.endsWith('.up.sql'))
            .sort();

        const migrations: Migration[] = [];

        for (const file of files) {
            const name = basename(file, '.up.sql');

            if (!executed.includes(name)) {
                const upPath = join(this.migrationsDir, file);
                const downPath = join(this.migrationsDir, file.replace('.up.sql', '.down.sql'));

                migrations.push({
                    name,
                    up: readFileSync(upPath, 'utf-8'),
                    down: readFileSync(downPath, 'utf-8'),
                });
            }
        }

        return migrations;
    }

    async runMigration(migration: Migration) {
        console.log(`🚀 Ejecutando migración: ${migration.name}`);

        const startTime = Date.now();

        try {
            await this.client.query('BEGIN');

            // Ejecutar migración
            await this.client.query(migration.up);

            // Registrar migración
            await this.client.query(
                'INSERT INTO migrations (name, execution_time_ms) VALUES ($1, $2)',
                [migration.name, Date.now() - startTime]
            );

            await this.client.query('COMMIT');
            console.log(`✅ Migración ${migration.name} completada`);

        } catch (error) {
            await this.client.query('ROLLBACK');
            console.error(`❌ Error en migración ${migration.name}:`, error);
            throw error;
        }
    }

    async rollbackMigration(migrationName: string) {
        console.log(`↩️  Revertiendo migración: ${migrationName}`);

        const downPath = join(this.migrationsDir, `${migrationName}.down.sql`);
        const downSql = readFileSync(downPath, 'utf-8');

        try {
            await this.client.query('BEGIN');
            await this.client.query(downSql);
            await this.client.query('DELETE FROM migrations WHERE name = $1', [migrationName]);
            await this.client.query('COMMIT');
            console.log(`✅ Migración ${migrationName} revertida`);
        } catch (error) {
            await this.client.query('ROLLBACK');
            console.error(`❌ Error al revertir ${migrationName}:`, error);
            throw error;
        }
    }

    async runAllMigrations() {
        const pending = await this.getPendingMigrations();

        if (pending.length === 0) {
            console.log('📭 No hay migraciones pendientes');
            return;
        }

        console.log(`📦 Migraciones pendientes: ${pending.length}`);

        for (const migration of pending) {
            await this.runMigration(migration);
        }

        console.log('🎉 Todas las migraciones completadas');
    }

    async close() {
        await this.client.end();
        console.log('👋 Conexión cerrada');
    }
}

// Ejecución principal
async function main() {
    const runner = new MigrationRunner();

    try {
        await runner.connect();
        await runner.createMigrationsTable();

        const command = process.argv[2];

        switch (command) {
            case 'up':
                await runner.runAllMigrations();
                break;

            case 'down':
                const migrationName = process.argv[3];
                if (!migrationName) {
                    console.error('❌ Debes especificar el nombre de la migración a revertir');
                    process.exit(1);
                }
                await runner.rollbackMigration(migrationName);
                break;

            case 'status':
                const executed = await runner.getExecutedMigrations();
                const pending = await runner.getPendingMigrations();

                console.log('\n📊 ESTADO DE MIGRACIONES');
                console.log('='.repeat(40));
                console.log(`✅ Ejecutadas: ${executed.length}`);
                executed.forEach(name => console.log(`  - ${name}`));

                console.log(`\n⏳ Pendientes: ${pending.length}`);
                pending.forEach(m => console.log(`  - ${m.name}`));
                break;

            default:
                console.log(`
        Uso: npm run migrate [comando]
        
        Comandos:
          up      - Ejecutar todas las migraciones pendientes
          down    - Revertir una migración específica
          status  - Ver estado de migraciones
        `);
        }

    } catch (error) {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    } finally {
        await runner.close();
    }
}

main();