export async function withPgTransaction(pool, handler) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await handler(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        try {
            await client.query('ROLLBACK');
        } catch {}
        throw error;
    } finally {
        client.release();
    }
}
