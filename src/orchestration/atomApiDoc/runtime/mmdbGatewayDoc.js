/**
 * L2 - atomApiDoc
 *
 * MmdbDomainGateway 契约说明：
 * - 负责 mmdb meta / chunks / full file read-write
 * - 两平台都只以远程可更新存储为真相源
 */

export const mmdbGatewayDoc = Object.freeze({
    domain: 'mmdb',
    consistencyModel: {
        scope: 'mmdb-file',
        readAfterWrite: 'required per file name',
        sourceOfTruth: 'remote-updatable persistent storage only',
    },
    methods: {
        getMmdbMeta: {
            sideEffects: 'read-only',
            transaction: 'not required',
            lock: 'none',
        },
        getMmdbFile: {
            sideEffects: 'read-only, returns full binary assembled from chunks',
            transaction: 'not required',
            lock: 'none',
        },
        putMmdbFile: {
            sideEffects: 'replaces meta and chunk rows for a file',
            transaction: 'required',
            lock: 'file-name scoped lock required',
            retry: 'required on conflict in non-DO runtimes',
            notes: [
                'must update metadata and chunks atomically',
                'must not expose partially written chunk set',
                'recommended chunk size ceiling is 256KB',
            ],
        },
    },
});
