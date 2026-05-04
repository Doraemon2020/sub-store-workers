/**
 * L3 - Molecule
 * Index 域：透传用户 data（读/写/删）到 User 域 gateway。
 */

import { jsonResponse, errorResponse } from '../../atoms/http/httpAtoms.js';
import { readJsonBody } from '../../atoms/http/httpAtoms.js';

export async function proxyUserData({ request, route, userGateway }) {
    const userId = route.userId || 0;
    if (!userId) return errorResponse('userId required', 400);

    if (route.method === 'GET') {
        const rawData = await userGateway.getUserDataString(userId);
        const data = rawData ? JSON.parse(rawData) : null;
        return jsonResponse({ data });
    }

    if (route.method === 'PUT') {
        const body = (await readJsonBody(request)) || {};
        await userGateway.putUserDataString(userId, JSON.stringify(body?.data ?? {}));
        return jsonResponse({ ok: true });
    }

    if (route.method === 'DELETE') {
        await userGateway.deleteUserDataString(userId);
        return jsonResponse({ ok: true });
    }

    return errorResponse('Method Not Allowed', 405);
}
