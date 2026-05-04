/**
 * L3 - Molecule
 * Index 域：按名称返回 mmdb 文件（BLOB）。
 */

import { errorResponse } from '../../atoms/http/httpAtoms.js';
import { binaryResponse } from '../../atoms/http/httpAtoms.js';

export async function getMmdbFile({ route, mmdbGateway }) {
    const name = route?.name || '';
    if (!name) return errorResponse('Missing mmdb name', 400);

    const row = await mmdbGateway.getMmdbFile(name);
    if (!row?.data) return errorResponse('Not Found', 404);

    const headers = {
        'Cache-Control': 'no-store',
    };
    if (row.etag) headers.ETag = row.etag;
    if (row.updatedAt) headers['X-MMDB-Updated-At'] = String(row.updatedAt);

    return binaryResponse(row.data, 200, headers);
}
