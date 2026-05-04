/**
 * L3 - Molecule
 * Index 域：分页列出用户。
 */

import { jsonResponse } from '../../atoms/http/httpAtoms.js';

export async function listUsers({ route, indexGateway }) {
    const afterId = route.afterId || 0;
    const limit = Math.min(1000, Math.max(1, route.limit || 200));
    const results = await indexGateway.listUsers(afterId, limit);
    return jsonResponse({ results });
}
