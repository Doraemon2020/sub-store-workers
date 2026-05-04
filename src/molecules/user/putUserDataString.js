/**
 * L3 - Molecule
 * User 域：写入当前用户的整段 data（字符串形式），并在需要时同步 avatarUrl 到 Index 域。
 */

import { jsonResponse } from '../../atoms/http/httpAtoms.js';
import { readJsonBody } from '../../atoms/http/httpAtoms.js';
import { extractAvatarUrlFromUserDataString } from '../../atoms/user/extractAvatarUrlFromUserDataString.js';

export async function putUserDataString({ request, userGateway, indexGateway }) {
    const body = (await readJsonBody(request)) || {};
    const dataString = JSON.stringify(body?.data ?? {});

    const headerUserId = request.headers.get('X-User-Id');
    const userId = parseInt(headerUserId || '0', 10) || 0;
    await userGateway.putUserDataString(userId, dataString);

    if (userId) {
        const avatarUrl = extractAvatarUrlFromUserDataString(dataString);
        const prev = await userGateway.getUserStoreValue(userId, 'avatar_url') ?? '';
        if (prev !== avatarUrl) {
            await userGateway.putUserStoreValue(userId, 'avatar_url', avatarUrl);
            await indexGateway.updateAvatar(userId, avatarUrl);
        }
    }

    return jsonResponse({ ok: true });
}
