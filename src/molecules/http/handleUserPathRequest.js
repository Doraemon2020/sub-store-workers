/**
 * L3 - Molecule
 * 处理用户路径请求：
 * - 通过 entryGateway 根据 userPath 查询用户
 * - 转发到对应用户的 Sub-Store 入口
 */

import { buildNotFoundResponse } from '../../atoms/http/httpAtoms.js';

export async function handleUserPathRequest({ request, requestId, route, entryGateway }) {
    const userPath = route.user.userPath;
    const user = await entryGateway.getUserByPath({ userPath, requestId });
    if (!user) return buildNotFoundResponse();

    return await entryGateway.forwardSubStoreRequest({ request, user, requestId });
}
