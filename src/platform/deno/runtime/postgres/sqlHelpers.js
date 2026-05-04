export function firstRow(result) {
    return result?.rows?.[0] ?? null;
}

export function firstValue(result, key) {
    const row = firstRow(result);
    return row ? row[key] ?? null : null;
}

export function toUint8Array(value) {
    if (value instanceof Uint8Array) return value;
    if (value instanceof ArrayBuffer) return new Uint8Array(value);
    if (value?.buffer instanceof ArrayBuffer) {
        return new Uint8Array(value.buffer, value.byteOffset || 0, value.byteLength || 0);
    }
    return new Uint8Array();
}

export function mergeMmdbChunks(rows, totalSize) {
    const out = new Uint8Array(totalSize);
    let offset = 0;
    for (const row of rows) {
        const chunk = toUint8Array(row.data);
        out.set(chunk, offset);
        offset += chunk.byteLength;
    }
    if (offset !== totalSize) {
        throw new Error(`MMDB chunk size mismatch: expected=${totalSize} actual=${offset}`);
    }
    return out;
}
