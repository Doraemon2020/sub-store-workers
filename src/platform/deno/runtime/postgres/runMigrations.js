import { DENO_POSTGRES_MIGRATION_PLAN } from './migrationPlan.js';

export async function runPgMigrationStatements(pool, statements) {
    for (const statement of statements) {
        await pool.query(statement);
    }
}

export async function runDenoPostgresMigrations(pool, domains = ['index', 'user']) {
    for (const domain of domains) {
        const statements = DENO_POSTGRES_MIGRATION_PLAN[domain] || [];
        await runPgMigrationStatements(pool, statements);
    }
}
