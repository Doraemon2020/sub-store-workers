import { debug } from '../../utils/logger.js';

export function selectMmdbFileByName(storage, name) {
    const meta =
        storage.sql`
            SELECT name, etag, updated_at AS updatedAt, total_size AS totalSize, chunk_size AS chunkSize, chunks
            FROM mmdb_meta
            WHERE name = ${name};
        `[0] ?? null;

    if (!meta) return null;

    const rows = storage.sql`
        SELECT idx, data
        FROM mmdb_chunks
        WHERE name = ${name}
        ORDER BY idx ASC;
    `;

    const chunks = Array.isArray(rows) ? rows : [];
    if (chunks.length === 0) return null;

    const totalSize = Number(meta.totalSize || 0);
    if (!Number.isFinite(totalSize) || totalSize <= 0) return null;

    const out = new Uint8Array(totalSize);
    let offset = 0;
    for (const c of chunks) {
        const buf = c?.data;
        if (!buf) return null;
        const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
        out.set(u8, offset);
        offset += u8.byteLength;
    }

    if (offset !== totalSize) return null;

    return {
        name: meta.name,
        etag: meta.etag,
        updatedAt: meta.updatedAt,
        data: out,
    };
}

export function selectMmdbFilesMeta(storage) {
    return storage.sql`
        SELECT
            name,
            etag,
            updated_at AS updatedAt,
            source_url AS sourceUrl,
            build_epoch AS buildEpoch,
            total_size AS size
        FROM mmdb_meta
        ORDER BY name ASC;
    `;
}

export function upsertMmdbFile(storage, {
    name,
    etag,
    updatedAt,
    data,
    chunkSize = 256 * 1024,
    sourceUrl = '',
    buildEpoch = null,
}) {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    const totalSize = bytes.byteLength;
    const cs = Math.max(8 * 1024, Math.min(Number(chunkSize) || 64 * 1024, 256 * 1024));
    const chunks = Math.ceil(totalSize / cs);

    debug(`[MMDB] upsert start: name=${name} size=${totalSize} chunkSize=${cs} chunks=${chunks}`);

    storage.sql`DELETE FROM mmdb_chunks WHERE name = ${name};`;
    storage.sql`DELETE FROM mmdb_meta WHERE name = ${name};`;

    storage.sql`
        INSERT OR REPLACE INTO mmdb_meta (name, etag, updated_at, source_url, build_epoch, total_size, chunk_size, chunks)
        VALUES (${name}, ${etag || ''}, ${updatedAt}, ${sourceUrl || ''}, ${buildEpoch}, ${totalSize}, ${cs}, ${chunks});
    `;

    for (let i = 0; i < chunks; i += 1) {
        const start = i * cs;
        const end = Math.min(totalSize, start + cs);
        const slice = bytes.subarray(start, end);
        storage.sql`
            INSERT OR REPLACE INTO mmdb_chunks (name, idx, data)
            VALUES (${name}, ${i}, ${slice});
        `;
    }

    debug(`[MMDB] upsert success: name=${name} size=${totalSize} chunks=${chunks}`);

    return { success: true, totalSize, chunkSize: cs, chunks };
}

export function selectSystemSettingsRow(storage) {
    return (
        storage.sql`
            SELECT settings, updated_at
            FROM system_settings
            WHERE id = 1;
        `[0] ?? null
    );
}

export function getIndexUserByUsername(storage, username) {
    return storage.sql`SELECT * FROM users WHERE username = ${username};`[0] ?? null;
}

export function getIndexUserById(storage, id) {
    return storage.sql`SELECT * FROM users WHERE id = ${id};`[0] ?? null;
}

export function getIndexUserByPath(storage, path) {
    return storage.sql`SELECT * FROM users WHERE path = ${path};`[0] ?? null;
}

export function createIndexUser(storage, username, passwordHash, role, path) {
    storage.sql`
        INSERT INTO users (username, password_hash, role, path)
        VALUES (${username}, ${passwordHash}, ${role}, ${path});
    `;
    return { success: true };
}

export function updateIndexUsername(storage, id, newUsername, now) {
    storage.sql`
        UPDATE users
        SET username = ${newUsername}, updated_at = ${now}
        WHERE id = ${id};
    `;
    return { success: true };
}

export function updateIndexPath(storage, id, newPath, now) {
    storage.sql`
        UPDATE users
        SET path = ${newPath}, updated_at = ${now}
        WHERE id = ${id};
    `;
    return { success: true };
}

export function updateIndexNotes(storage, id, notes, now) {
    storage.sql`
        UPDATE users
        SET notes = ${notes}, updated_at = ${now}
        WHERE id = ${id};
    `;
    return { success: true };
}

export function updateIndexPasswordAndBumpTokenVersion(storage, id, passwordHash, now) {
    storage.sql`
        UPDATE users
        SET password_hash = ${passwordHash},
            token_version = token_version + 1,
            updated_at = ${now}
        WHERE id = ${id};
    `;
    return { success: true };
}

export function deleteIndexUser(storage, id) {
    storage.sql`DELETE FROM users WHERE id = ${id};`;
    return { success: true };
}

export function listIndexUsersForAdmin(storage) {
    return storage.sql`
        SELECT id, username, role, path, notes, avatar_url, created_at, updated_at
        FROM users;
    `;
}

export function getIndexUserTokenVersionById(storage, id) {
    const row = storage.sql`
        SELECT token_version
        FROM users
        WHERE id = ${id};
    `[0] ?? null;
    if (!row) return null;
    return row.token_version ?? 0;
}

export function countIndexUsers(storage) {
    const row = storage.sql`SELECT COUNT(*) as count FROM users;`[0] ?? null;
    return row?.count ?? 0;
}

export function deleteExpiredIndexCaptchas(storage, now) {
    storage.sql`DELETE FROM captchas WHERE expires_at < ${now};`;
    return { success: true };
}

export function insertIndexCaptcha(storage, id, code, expiresAt) {
    storage.sql`
        INSERT INTO captchas (id, code, attempts, expires_at)
        VALUES (${id}, ${code}, 0, ${expiresAt});
    `;
    return { success: true };
}

export function getIndexCaptchaForVerify(storage, id) {
    return storage.sql`
        SELECT code, attempts, expires_at
        FROM captchas
        WHERE id = ${id};
    `[0] ?? null;
}

export function deleteIndexCaptcha(storage, id) {
    storage.sql`DELETE FROM captchas WHERE id = ${id};`;
    return { success: true };
}

export function incrementIndexCaptchaAttempts(storage, id) {
    storage.sql`UPDATE captchas SET attempts = attempts + 1 WHERE id = ${id};`;
    return { success: true };
}

export function upsertSystemSettingsRow(storage, settingsJson, now) {
    storage.sql`
        INSERT OR REPLACE INTO system_settings (id, settings, updated_at)
        VALUES (1, ${settingsJson}, ${now});
    `;
    return { success: true };
}

export function selectUserByPath(storage, userPath) {
    return (
        storage.sql`
            SELECT id, username, role, path
            FROM users
            WHERE path = ${userPath};
        `[0] ?? null
    );
}

export function selectUsersAfterId(storage, afterId, limit) {
    return storage.sql`
        SELECT id, username, role, path
        FROM users
        WHERE id > ${afterId}
        ORDER BY id
        LIMIT ${limit};
    `;
}

export function updateAvatarUrl(storage, userId, avatarUrl, now) {
    storage.sql`
        UPDATE users
        SET avatar_url = ${avatarUrl}, updated_at = ${now}
        WHERE id = ${userId};
    `;
    return { success: true };
}
