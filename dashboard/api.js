/**
 * Dashboard 统一 API 调用封装
 *
 * - 自动从 localStorage 注入 token
 * - 401 统一拦截，自动登出
 * - 支持 rawBody 发送非 JSON 请求体
 */

const TOKEN_KEY = 'ss_token';

function getToken() {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

function clearAuth() {
    try {
        ['ss_token', 'ss_role', 'ss_path', 'ss_frontend_url', 'ss_must_change_password']
            .forEach((k) => localStorage.removeItem(k));
    } catch { /* noop */ }
}

export async function api(path, opts = {}) {
    const { method = 'GET', body, rawBody, token } = opts;

    const headers = {};
    const jwt = token ?? getToken();
    if (jwt) headers.Authorization = `Bearer ${jwt}`;

    if (rawBody !== undefined) {
        headers['Content-Type'] = 'text/plain';
    } else if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(path, {
        method,
        headers,
        body: rawBody !== undefined ? rawBody : body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401 && getToken()) {
        clearAuth();
        window.location.href = '/dashboard/';
        return { ok: false, status: 401, data: { error: '未授权' } };
    }

    const data = res.headers.get('content-type')?.includes('application/json')
        ? await res.json()
        : await res.text();

    return { ok: res.ok, status: res.status, data };
}
