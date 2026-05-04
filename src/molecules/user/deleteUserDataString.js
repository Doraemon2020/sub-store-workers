/**
 * L3 - Molecule
 * User 域：删除当前用户的整段 data，并在需要时同步 avatarUrl。
 */

import { jsonResponse } from '../../atoms/http/httpAtoms.js';

export async function deleteUserDataString({ request, userGateway, indexGateway }) {
    const headerUserId = request.headers.get('X-User-Id');
    const userId = parseInt(headerUserId || '0', 10) || 0;
    await userGateway.deleteUserDataString(userId);

    if (userId) {
        const prev = await userGateway.getUserStoreValue(userId, 'avatar_url') ?? '';
        if (prev !== '') {
            await userGateway.putUserStoreValue(userId, 'avatar_url', '');
            await indexGateway.updateAvatar(userId, '');
        }
    }

    return jsonResponse({ ok: true });
}
