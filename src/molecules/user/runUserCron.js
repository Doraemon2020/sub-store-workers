/**
 * L3 - Molecule
 * User 域：执行单个用户的 cron（触发 Sub-Store /api/utils/refresh）。
 */

import { jsonResponse } from '../../atoms/http/httpAtoms.js';
import { flushDirtyGlobalUserData } from '../../atoms/user/flushDirtyGlobalUserData.js';
import { extractAvatarUrlFromUserDataString } from '../../atoms/user/extractAvatarUrlFromUserDataString.js';
import { runSubStoreCronForUser } from '../../atoms/substore/runSubStoreCronForUser.js';

export async function runUserCron({ request, env, state, storage, requestId, userGateway, mmdbGateway, indexGateway }) {
    const headerUserId = request.headers.get('X-User-Id');
    const userId = parseInt(headerUserId || '0', 10) || 0;

    const username = request.headers.get('X-Username') || `user-${userId || 'unknown'}`;
    const role = request.headers.get('X-Role') || 'user';
    const userPath = request.headers.get('X-User-Path') || '';
    const userData = (await userGateway.getUserDataString(userId)) ?? '{}';
    const user = { id: userId, username, role, path: userPath, data: userData };

    const saveUserData = async (id, savedFromContext) => {
        const saved = savedFromContext || flushDirtyGlobalUserData();
        if (!saved) return;
        if (id) {
            await userGateway.putUserDataString(id, saved);
        }
        const avatarUrl = extractAvatarUrlFromUserDataString(saved);
        const prev = await userGateway.getUserStoreValue(id, 'avatar_url') ?? '';
        if (prev !== avatarUrl) {
            await userGateway.putUserStoreValue(id, 'avatar_url', avatarUrl);
            if (id) await indexGateway.updateAvatar(id, avatarUrl);
        }
    };

    const cronEnv = { ...env, __saveUserData: (id, savedFromContext) => saveUserData(id, savedFromContext), __mmdbGateway: mmdbGateway };
    await runSubStoreCronForUser({ user, env: cronEnv });
    return jsonResponse({ ok: true });
}
