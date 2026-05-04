/**
 * L2 - Diplomat
 * Index 域入口：把 /api/dashboard 请求交给 Dashboard 子系统处理（2-A：视为内部业务）。
 *
 * 为什么是 Diplomat：
 * - 需要通过 runtime services 访问用户数据（外部 I/O）
 * - 需要调用 Dashboard 子系统的 L2（dataOfficer + commander）做编排
 *
 * 约定：
 * - 这里不实现 dashboard 业务逻辑，只做“接线 + I/O 封装”。
 */

import { parseDashboardRoute } from '../../dashboard/orchestration/dataOfficer/dashboardRouteDataOfficer.js';
import { handle as dashboardCommanderHandle } from '../../dashboard/orchestration/commander/dashboardCommander.js';

export async function handleDashboardApiViaDashboardCommander({ request, env, storage, requestId, services }) {
    const userDataStore = {
        get: async (userId) => await services.userGateway.getUserDataString(userId),
        put: async (userId, data) => {
            await services.userGateway.putUserDataString(userId, JSON.stringify(data ?? {}));
            return true;
        },
        delete: async (userId) => {
            await services.userGateway.deleteUserDataString(userId);
            return true;
        },
    };

    const ctx = { storage, userDataStore, services };
    const route = parseDashboardRoute(request);

    return await dashboardCommanderHandle({ request, env: { ...env, DB: ctx }, route, services });
}
