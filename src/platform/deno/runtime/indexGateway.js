import { parseJsonObjectOrEmpty } from '../../../atoms/json/parseJsonObjectOrEmpty.js';
import { createIndexGateway } from '../../../runtime/gateways/indexGateway.js';
import { withPgTransaction } from './postgres/withPgTransaction.js';
import { withPgAdvisoryLock } from './postgres/withPgAdvisoryLock.js';
import { firstRow, firstValue } from './postgres/sqlHelpers.js';

export function createDenoIndexGateway({ pool, now = () => Date.now() }) {
    return createIndexGateway({
        async getSystemSettings({ mergeSettings }) {
            const result = await pool.query(
                'SELECT settings, updated_at AS "updatedAt" FROM system_settings WHERE id = 1',
            );
            const row = firstRow(result);
            const dbSettings = parseJsonObjectOrEmpty(row?.settings || '{}');
            const { merged, needsSave } = mergeSettings({ dbSettings });
            if (needsSave) {
                await withPgTransaction(pool, async (client) => {
                    await withPgAdvisoryLock(client, { scope: 'index-settings', entity: 'global' }, async () => {
                        await client.query(
                            'INSERT INTO system_settings (id, settings, updated_at) VALUES (1, $1, $2) ON CONFLICT (id) DO UPDATE SET settings = EXCLUDED.settings, updated_at = EXCLUDED.updated_at',
                            [JSON.stringify(merged), now()],
                        );
                    });
                });
            }
            return merged;
        },

        async patchSystemSettings({ patch, mergeSettings, mergePatch }) {
            return await withPgTransaction(pool, async (client) => {
                return await withPgAdvisoryLock(client, { scope: 'index-settings', entity: 'global' }, async () => {
                    const rowResult = await client.query(
                        'SELECT settings, updated_at AS "updatedAt" FROM system_settings WHERE id = 1',
                    );
                    const row = firstRow(rowResult);
                    const dbSettings = parseJsonObjectOrEmpty(row?.settings || '{}');
                    const { merged: current } = mergeSettings({ dbSettings });
                    const next = mergePatch({ current, patch });
                    await client.query(
                        'INSERT INTO system_settings (id, settings, updated_at) VALUES (1, $1, $2) ON CONFLICT (id) DO UPDATE SET settings = EXCLUDED.settings, updated_at = EXCLUDED.updated_at',
                        [JSON.stringify(next), now()],
                    );
                    return next;
                });
            });
        },

        async getUserById(id) {
            const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
            return firstRow(result);
        },

        async getUserByUsername(username) {
            const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
            return firstRow(result);
        },

        async getUserByPath(path) {
            const result = await pool.query('SELECT * FROM users WHERE path = $1', [path]);
            return firstRow(result);
        },

        async listUsers(afterId, limit) {
            const result = await pool.query(
                'SELECT id, username, role, path FROM users WHERE id > $1 ORDER BY id LIMIT $2',
                [afterId, limit],
            );
            return result.rows;
        },

        async listUsersForAdmin() {
            const result = await pool.query(
                'SELECT id, username, role, path, notes, avatar_url, created_at AS "createdAt", updated_at AS "updatedAt" FROM users',
            );
            return result.rows;
        },

        async countUsers() {
            const result = await pool.query('SELECT COUNT(*)::int AS count FROM users');
            return firstValue(result, 'count') ?? 0;
        },

        async createUser({ username, passwordHash, role, path }) {
            return await withPgTransaction(pool, async (client) => {
                const timestamp = now();
                const result = await client.query(
                    'INSERT INTO users (username, password_hash, role, path, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                    [username, passwordHash, role, path, timestamp, timestamp],
                );
                return firstRow(result) ?? { success: true };
            });
        },

        async deleteUser(userId) {
            await withPgTransaction(pool, async (client) => {
                await withPgAdvisoryLock(client, { scope: 'index-user', entity: userId }, async () => {
                    await client.query('DELETE FROM users WHERE id = $1', [userId]);
                });
            });
        },

        async updateUsername(userId, username) {
            await withPgTransaction(pool, async (client) => {
                await withPgAdvisoryLock(client, { scope: 'index-user', entity: userId }, async () => {
                    await client.query('UPDATE users SET username = $1, updated_at = $2 WHERE id = $3', [username, now(), userId]);
                });
            });
        },

        async updatePath(userId, path) {
            await withPgTransaction(pool, async (client) => {
                await withPgAdvisoryLock(client, { scope: 'index-user', entity: userId }, async () => {
                    await client.query('UPDATE users SET path = $1, updated_at = $2 WHERE id = $3', [path, now(), userId]);
                });
            });
        },

        async updateNotes(userId, notes) {
            await withPgTransaction(pool, async (client) => {
                await withPgAdvisoryLock(client, { scope: 'index-user', entity: userId }, async () => {
                    await client.query('UPDATE users SET notes = $1, updated_at = $2 WHERE id = $3', [notes, now(), userId]);
                });
            });
        },

        async updatePasswordAndBumpTokenVersion(userId, passwordHash) {
            await withPgTransaction(pool, async (client) => {
                await withPgAdvisoryLock(client, { scope: 'index-user', entity: userId }, async () => {
                    await client.query(
                        'UPDATE users SET password_hash = $1, token_version = token_version + 1, updated_at = $2 WHERE id = $3',
                        [passwordHash, now(), userId],
                    );
                });
            });
        },

        async updateAvatar(userId, avatarUrl) {
            await withPgTransaction(pool, async (client) => {
                await withPgAdvisoryLock(client, { scope: 'index-user', entity: userId }, async () => {
                    await client.query('UPDATE users SET avatar_url = $1, updated_at = $2 WHERE id = $3', [avatarUrl, now(), userId]);
                });
            });
        },

        async getUserTokenVersion(userId) {
            const result = await pool.query('SELECT token_version FROM users WHERE id = $1', [userId]);
            const row = firstRow(result);
            return row ? row.token_version ?? 0 : null;
        },

        async createCaptcha({ id, code, expiresAt }) {
            await withPgTransaction(pool, async (client) => {
                await client.query(
                    'INSERT INTO captchas (id, code, attempts, expires_at) VALUES ($1, $2, 0, $3)',
                    [id, code, expiresAt],
                );
            });
        },

        async getCaptchaForVerify(id) {
            const result = await pool.query(
                'SELECT id, code, attempts, expires_at AS expires_at FROM captchas WHERE id = $1',
                [id],
            );
            return firstRow(result);
        },

        async incrementCaptchaAttempts(id) {
            await withPgTransaction(pool, async (client) => {
                await withPgAdvisoryLock(client, { scope: 'captcha', entity: id }, async () => {
                    await client.query('UPDATE captchas SET attempts = attempts + 1 WHERE id = $1', [id]);
                });
            });
        },

        async deleteCaptcha(id) {
            await withPgTransaction(pool, async (client) => {
                await client.query('DELETE FROM captchas WHERE id = $1', [id]);
            });
        },

        async deleteExpiredCaptchas(timestamp) {
            await withPgTransaction(pool, async (client) => {
                await withPgAdvisoryLock(client, { scope: 'captcha-cleanup', entity: 'global' }, async () => {
                    await client.query('DELETE FROM captchas WHERE expires_at < $1', [timestamp]);
                });
            });
        },
    });
}
