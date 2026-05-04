/**
 * L3 - Molecule
 * Index 域：按 path 反查用户。
 */

import { jsonResponse, errorResponse } from '../../atoms/http/httpAtoms.js';

export async function getUserByPath({ route, indexGateway }) {
    const userPath = route.userPath || '';
    if (!userPath) return errorResponse('path required', 400);

    const row = await indexGateway.getUserByPath(userPath);
    if (!row) return errorResponse('Not Found', 404);
    return jsonResponse(row);
}
