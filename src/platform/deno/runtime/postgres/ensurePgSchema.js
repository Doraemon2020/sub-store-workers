import { INDEX_SCHEMA_STATEMENTS, USER_SCHEMA_STATEMENTS } from './migrationPlan.js';
import { runPgMigrationStatements } from './runMigrations.js';

export async function ensureIndexPgSchema(pool) {
    await runPgMigrationStatements(pool, INDEX_SCHEMA_STATEMENTS);
}

export async function ensureUserPgSchema(pool) {
    await runPgMigrationStatements(pool, USER_SCHEMA_STATEMENTS);
}
