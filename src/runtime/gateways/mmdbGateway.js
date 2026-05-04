/**
 * L2 Runtime Gateway
 *
 * MMDB 域状态访问契约：
 * - mmdb meta / chunked file read-write
 * - 具体实现由 runtime adapter 提供（Workers / Deno）
 * - 详细约束见 src/orchestration/atomApiDoc/runtime/mmdbGatewayDoc.js
 */

/**
 * @typedef {Object} MmdbDomainGateway
 * @property {() => Promise<Array<Record<string, unknown>>>} getMmdbMeta
 * @property {(name: string) => Promise<{name: string, etag?: string, updatedAt?: number, data: Uint8Array}|null>} getMmdbFile
 * @property {(args: { name: string, etag?: string, sourceUrl?: string, buildEpoch?: number|null, data: Uint8Array, updatedAt: number, chunkSize?: number }) => Promise<{success: boolean, totalSize: number, chunkSize: number, chunks: number}>} putMmdbFile 覆盖写 mmdb；非 DO 平台必须事务+按 name 加锁，且禁止暴露半写入状态
 */

/**
 * @param {MmdbDomainGateway} impl
 * @returns {MmdbDomainGateway}
 */
export function createMmdbGateway(impl) {
    return impl;
}
