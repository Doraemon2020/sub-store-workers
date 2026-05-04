/**
 * L3 - Molecule
 * User 域：读取当前用户的整段 data（字符串形式）。
 */

import { jsonResponse } from '../../atoms/http/httpAtoms.js';

export async function getUserDataString({ request, userGateway }) {
    const headerUserId = request.headers.get('X-User-Id');
    const userId = parseInt(headerUserId || '0', 10) || 0;
    const value = await userGateway.getUserDataString(userId);
    return jsonResponse({ data: value ?? '{}' });
}
