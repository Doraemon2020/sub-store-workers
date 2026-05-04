import { Pool } from 'npm:pg';

let sharedPool = null;

export function createPgPool({
    connectionString = Deno.env.get('DATABASE_URL'),
    max = 10,
    idleTimeoutMillis = 30000,
} = {}) {
    if (!connectionString) {
        throw new Error('DATABASE_URL 未配置，无法初始化 Postgres 连接池');
    }

    return new Pool({
        connectionString,
        max,
        idleTimeoutMillis,
    });
}

export function getSharedPgPool(options = {}) {
    if (!sharedPool) {
        sharedPool = createPgPool(options);
    }
    return sharedPool;
}

export async function closeSharedPgPool() {
    if (!sharedPool) return;
    const pool = sharedPool;
    sharedPool = null;
    await pool.end();
}
