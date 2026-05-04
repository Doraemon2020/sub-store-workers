import { Buffer } from 'node:buffer';
import { createMmdbGateway } from '../../../runtime/gateways/mmdbGateway.js';
import { withPgTransaction } from './postgres/withPgTransaction.js';
import { withPgAdvisoryLock } from './postgres/withPgAdvisoryLock.js';
import { firstRow, mergeMmdbChunks } from './postgres/sqlHelpers.js';

export function createDenoMmdbGateway({ pool, now = () => Date.now() }) {
    return createMmdbGateway({
        async getMmdbMeta() {
            const result = await pool.query(
                'SELECT name, etag, updated_at AS "updatedAt", source_url AS "sourceUrl", build_epoch AS "buildEpoch", total_size AS size FROM mmdb_meta ORDER BY name ASC',
            );
            return result.rows;
        },

        async getMmdbFile(name) {
            const metaResult = await pool.query(
                'SELECT name, etag, updated_at AS "updatedAt", total_size AS "totalSize" FROM mmdb_meta WHERE name = $1',
                [name],
            );
            const meta = firstRow(metaResult);
            if (!meta) return null;

            const chunkResult = await pool.query(
                'SELECT idx, data FROM mmdb_chunks WHERE name = $1 ORDER BY idx ASC',
                [name],
            );
            if (chunkResult.rows.length === 0) return null;

            return {
                name: meta.name,
                etag: meta.etag,
                updatedAt: meta.updatedAt,
                data: mergeMmdbChunks(chunkResult.rows, Number(meta.totalSize || 0)),
            };
        },

        async putMmdbFile({
            name,
            etag = '',
            sourceUrl = '',
            buildEpoch = null,
            data,
            updatedAt = now(),
            chunkSize = 256 * 1024,
        }) {
            const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
            const totalSize = bytes.byteLength;
            const cs = Math.max(8 * 1024, Math.min(Number(chunkSize) || 64 * 1024, 256 * 1024));
            const chunks = Math.ceil(totalSize / cs);

            await withPgTransaction(pool, async (client) => {
                await withPgAdvisoryLock(client, { scope: 'mmdb-file', entity: name }, async () => {
                    await client.query('DELETE FROM mmdb_chunks WHERE name = $1', [name]);
                    await client.query('DELETE FROM mmdb_meta WHERE name = $1', [name]);
                    await client.query(
                        'INSERT INTO mmdb_meta (name, etag, updated_at, source_url, build_epoch, total_size, chunk_size, chunks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                        [name, etag, updatedAt, sourceUrl, buildEpoch, totalSize, cs, chunks],
                    );

                    for (let i = 0; i < chunks; i += 1) {
                        const start = i * cs;
                        const end = Math.min(totalSize, start + cs);
                        const slice = bytes.subarray(start, end);
                        await client.query(
                            'INSERT INTO mmdb_chunks (name, idx, data) VALUES ($1, $2, $3)',
                            [name, i, Buffer.from(slice)],
                        );
                    }
                });
            });

            return { success: true, totalSize, chunkSize: cs, chunks };
        },
    });
}
