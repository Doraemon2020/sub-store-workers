function serializeData(data) {
    return typeof data === 'string' ? data : JSON.stringify(data ?? {});
}

export function createUserDataStore({ pool, now = () => Date.now() }) {
    return {
        async get(userId) {
            const result = await pool.query(
                'SELECT value FROM user_store WHERE user_id = $1 AND key = $2',
                [userId, 'user_data'],
            );
            const value = result.rows?.[0]?.value;
            if (value === undefined || value === null) return null;
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        },

        async put(userId, data) {
            const value = serializeData(data);
            await pool.query(
                'INSERT INTO user_store (user_id, key, value, updated_at) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at',
                [userId, 'user_data', value, now()],
            );
            return true;
        },

        async delete(userId) {
            await pool.query('DELETE FROM user_store WHERE user_id = $1 AND key = $2', [userId, 'user_data']);
            return true;
        },
    };
}
