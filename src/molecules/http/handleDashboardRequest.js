/**
 * L3 - Molecule
 * 处理 dashboard 相关请求：
 * - /api/dashboard 交给 entryGateway 处理
 * - /dashboard/assets/* 走静态资源
 * - /dashboard/* 走 SPA index.html
 */

export async function handleDashboardRequest({ request, requestId, route, entryGateway }) {
    const { isApi, isAssets } = route.dashboard;

    if (isApi) {
        return await entryGateway.forwardDashboardApi({ request, requestId });
    }

    if (isAssets) {
        return await entryGateway.fetchDashboardAsset({ requestOrUrl: request });
    }

    const indexUrl = new URL(request.url);
    indexUrl.pathname = '/dashboard/index.html';
    return await entryGateway.fetchDashboardAsset({ requestOrUrl: indexUrl.toString() });
}
