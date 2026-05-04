/**
 * L3 - Molecule
 * Index 域：返回 mmdb 文件元信息。
 */

import { jsonResponse } from '../../atoms/http/httpAtoms.js';

export async function getMmdbMeta({ mmdbGateway }) {
    const rows = await mmdbGateway.getMmdbMeta();
    return jsonResponse({ files: rows });
}
