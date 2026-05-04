import { getSharedPgPool, closeSharedPgPool } from '../src/platform/deno/runtime/postgres/createPgPool.js';
import { runDenoPostgresMigrations } from '../src/platform/deno/runtime/postgres/runMigrations.js';

async function main() {
    const pool = getSharedPgPool();
    const domains = process.argv.slice(2);
    const selected = domains.length > 0 ? domains : ['index', 'user'];

    console.log(`[deno-pg-migrate] start -> ${selected.join(', ')}`);
    await runDenoPostgresMigrations(pool, selected);
    console.log('[deno-pg-migrate] done');
    await closeSharedPgPool();
}

main().catch(async (error) => {
    console.error('[deno-pg-migrate] failed:', error?.stack || error?.message || error);
    try {
        await closeSharedPgPool();
    } catch {}
    process.exitCode = 1;
});
