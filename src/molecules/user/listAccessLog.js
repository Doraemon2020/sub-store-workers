/**
 * L3 - Molecule
 * User 域：读取下载访问日志（分页）。
 */

import { jsonResponse } from '../../atoms/http/httpAtoms.js';

export async function listAccessLog({ request, route, userGateway }) {
    const limit = Math.max(1, Math.min(200, route.limit || 50));
    const beforeId = route.beforeId || 0;
    const headerUserId = request.headers.get('X-User-Id');
    const userId = parseInt(headerUserId || '0', 10) || 0;
    const page = await userGateway.listAccessLog(userId, { limit, beforeId });
    return jsonResponse(page);
}
