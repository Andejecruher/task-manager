#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { db } from '../src/database/connection';
import { logger } from '../src/utils/logger';

interface SeedFile {
    name: string;
    path: string;
    order: number;
}

class SeedRunner {
    private seedsDir: string;

    constructor() {
        this.seedsDir = path.join(__dirname, '../src/database/seeds');
    }

    async getSeedFiles(): Promise<SeedFile[]> {
        const files = fs.readdirSync(this.seedsDir)
            .filter(file => file.endsWith('.sql'))
            .map(file => {
                const match = file.match(/^(\d+)_/);
                const order = match ? parseInt(match[1]) : 999;
                return {
                    name: file.replace('.sql', ''),
                    path: path.join(this.seedsDir, file),
                    order
                };
            })
            .sort((a, b) => a.order - b.order);

        return files;
    }

    async runSeed(seedFile: SeedFile): Promise<void> {
        try {
            logger.info(`🌱 Ejecutando seed: ${seedFile.name}`);

            const sql = fs.readFileSync(seedFile.path, 'utf-8');

            // Ejecutar en transacción
            await db.transaction(async (client: { query: (arg0: string) => any; }) => {
                await client.query(sql);
            });

            logger.info(`✅ Seed completado: ${seedFile.name}`);

        } catch (error: any) {
            logger.error(`❌ Error en seed ${seedFile.name}:`, error);
            throw error;
        }
    }

    async runAllSeeds(): Promise<void> {
        const seedFiles = await this.getSeedFiles();

        if (seedFiles.length === 0) {
            logger.warn('📭 No se encontraron archivos seed');
            return;
        }

        logger.info(`📦 Encontrados ${seedFiles.length} archivos seed`);

        for (const seedFile of seedFiles) {
            await this.runSeed(seedFile);
        }

        logger.info('🎉 Todos los seeds ejecutados exitosamente');
        await this.generateReport();
    }

    async generateReport(): Promise<void> {
        try {
            logger.info('📊 Generando reporte de datos seed...');

            const report = await db.query(`
        -- Reporte consolidado
        SELECT 
          'Companies' as entity,
          COUNT(*) as count,
          STRING_AGG(name, ', ') as samples
        FROM companies
        
        UNION ALL
        
        SELECT 
          'Users',
          COUNT(*),
          STRING_AGG(email, ', ')
        FROM users
        
        UNION ALL
        
        SELECT 
          'Workspaces',
          COUNT(*),
          STRING_AGG(name, ', ')
        FROM workspaces
        
        UNION ALL
        
        SELECT 
          'Boards',
          COUNT(*),
          STRING_AGG(b.name, ', ')
        FROM boards b
        
        UNION ALL
        
        SELECT 
          'Tasks',
          COUNT(*),
          CONCAT(
            'Estado: ',
            SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END), ' done, ',
            SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END), ' in progress, ',
            SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END), ' todo'
          )
        FROM tasks
        
        UNION ALL
        
        SELECT 
          'Comments',
          COUNT(*),
          CONCAT(
            'Por ', 
            COUNT(DISTINCT created_by), 
            ' usuarios'
          )
        FROM task_comments
        
        UNION ALL
        
        SELECT 
          'Workspace Members',
          COUNT(*),
          CONCAT(
            COUNT(DISTINCT workspace_id), 
            ' workspaces, ',
            COUNT(DISTINCT user_id),
            ' usuarios'
          )
        FROM workspace_members
        
        ORDER BY entity;
      `);

            console.log('\n' + '='.repeat(60));
            console.log('📊 REPORTE DE DATOS SEED');
            console.log('='.repeat(60));

            report.forEach((row: any) => {
                console.log(`${row.entity.padEnd(20)}: ${row.count.toString().padEnd(5)} | ${row.samples}`);
            });

            console.log('='.repeat(60));

        } catch (error) {
            logger.error('❌ Error generando reporte:', error);
        }
    }

    async clearAllData(): Promise<void> {
        const confirm = await this.promptConfirmation(
            '⚠️  ¿ESTÁS SEGURO? Esto eliminará TODOS los datos de la base de datos. Escribe "DELETE ALL" para confirmar: '
        );

        if (confirm !== 'DELETE ALL') {
            logger.info('❌ Operación cancelada');
            return;
        }

        try {
            logger.warn('🧹 Eliminando todos los datos...');

            // Desactivar constraints temporalmente
            await db.query('SET session_replication_role = "replica"');

            // Eliminar en orden inverso (por dependencias)
            const tables = [
                'notifications',
                'task_history',
                'task_comments',
                'task_attachments',
                'tasks',
                'board_columns',
                'boards',
                'workspace_members',
                'workspaces',
                'user_sessions',
                'invitations',
                'users',
                'companies',
                'migrations'  // Ojo: esto elimina el historial de migraciones
            ];

            for (const table of tables) {
                try {
                    await db.query(`DELETE FROM ${table}`);
                    logger.info(`🗑️  Datos eliminados de: ${table}`);
                } catch (error) {
                    logger.warn(`⚠️  No se pudo eliminar ${table}:`, (error as Error).message);
                }
            }

            // Reactivar constraints
            await db.query('SET session_replication_role = "origin"');

            logger.info('✅ Todos los datos han sido eliminados');
            // salir del proceso
            process.exit(0);

        } catch (error) {
            logger.error('❌ Error eliminando datos:', error);
            throw error;
        }
    }

    private async promptConfirmation(message: string): Promise<string> {
        return new Promise((resolve) => {
            const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            });

            readline.question(message, (answer: string) => {
                readline.close();
                resolve(answer.trim());
            });
        });
    }
}

// Manejo de comandos CLI
async function main() {
    const runner = new SeedRunner();
    const command = process.argv[2];

    try {
        switch (command) {
            case 'run':
                await runner.runAllSeeds();
                break;

            case 'clear':
                await runner.clearAllData();
                break;

            case 'list':
                const files = await runner.getSeedFiles();
                console.log('\n📁 Archivos Seed disponibles:');
                files.forEach((file, index) => {
                    console.log(`${index + 1}. ${file.name} (order: ${file.order})`);
                });
                break;

            case 'help':
            default:
                console.log(`
        Uso: npm run seed [comando]
        
        Comandos:
          run     - Ejecutar todos los seeds
          clear   - Eliminar todos los datos (PELIGROSO)
          list    - Listar archivos seed disponibles
          help    - Mostrar esta ayuda
        `);
        }

    } catch (error) {
        logger.error('❌ Error:', error);
        process.exit(1);
    }
}

main();