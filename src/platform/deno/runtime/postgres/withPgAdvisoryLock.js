function hashTextToInt32(input) {
    const text = String(input || '');
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
        hash = (hash * 31 + text.charCodeAt(i)) | 0;
    }
    return hash;
}

export function toAdvisoryLockKey(scope, entity) {
    return [hashTextToInt32(scope), hashTextToInt32(entity)];
}

export async function withPgAdvisoryLock(client, { scope, entity }, handler) {
    const [scopeKey, entityKey] = toAdvisoryLockKey(scope, entity);
    await client.query('SELECT pg_advisory_xact_lock($1, $2)', [scopeKey, entityKey]);
    return await handler(client);
}
