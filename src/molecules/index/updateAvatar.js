/**
 * L3 - Molecule
 * Index 域：更新用户 avatar_url。
 */

import { jsonResponse, errorResponse } from '../../atoms/http/httpAtoms.js';
import { readJsonBody } from '../../atoms/http/httpAtoms.js';

export async function updateAvatar({ request, indexGateway }) {
    const body = (await readJsonBody(request)) || {};
    const userId = parseInt(body?.userId, 10);
    const avatarUrl = String(body?.avatarUrl || '');
    if (!userId) return errorResponse('userId required', 400);

    await indexGateway.updateAvatar(userId, avatarUrl);
    return jsonResponse({ ok: true });
}
