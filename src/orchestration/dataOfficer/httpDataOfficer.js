/**
 * L2 - Data Officer
 * 只负责解析/归一化 HTTP 请求信息，不做业务决策、不做外部交互。
 */

export function parseHttpRoute(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method === 'OPTIONS') {
        return { kind: 'cors-preflight' };
    }

    if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/dashboard')) {
        const isApi = pathname.startsWith('/api/dashboard');
        const isAssets = pathname.startsWith('/dashboard/assets/');
        return {
            kind: 'dashboard',
            dashboard: {
                isApi,
                isAssets,
                pathname,
            },
        };
    }

    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length === 0) {
        return { kind: 'not-found' };
    }

    return {
        kind: 'user-path',
        user: {
            userPath: pathSegments[0],
        },
    };
}
