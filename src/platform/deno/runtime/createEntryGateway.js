import { setRequestIdHeader } from '../../../utils/logger.js';
import { createEntryGateway } from '../../../runtime/gateways/entryGateway.js';

function setUserHeaders(headers, user) {
    if (!headers) return;
    if (user?.id !== undefined && user?.id !== null) headers.set('X-User-Id', String(user.id));
    if (user?.username) headers.set('X-Username', user.username);
    if (user?.role) headers.set('X-Role', user.role);
    if (user?.path) headers.set('X-User-Path', user.path);
}

function stripFirstPathSegment(pathname) {
    const segments = String(pathname || '').split('/').filter(Boolean);
    return '/' + segments.slice(1).join('/');
}

export function createEntryGatewayForDeno({
    ensureIndexContext,
    ensureUserContext,
    fetchAsset = async () => new Response('Deno asset gateway not wired yet', { status: 501 }),
}) {
    return createEntryGateway({
        async forwardDashboardApi({ request }) {
            const ctx = await ensureIndexContext();
            return await ctx.handleIndexEntry({ request, env: ctx.env, pool: ctx.pool, services: ctx.services });
        },

        async fetchDashboardAsset({ requestOrUrl }) {
            return await fetchAsset.fetchDashboardAsset({ requestOrUrl });
        },

        async getUserByPath({ userPath }) {
            const ctx = await ensureIndexContext();
            return await ctx.services.indexGateway.getUserByPath(userPath);
        },

        async forwardSubStoreRequest({ request, user, requestId }) {
            const ctx = await ensureUserContext();
            const originalUrl = new URL(request.url);
            const newUrl = new URL(request.url);
            newUrl.pathname = stripFirstPathSegment(originalUrl.pathname);
            newUrl.search = originalUrl.search;
            const forwarded = new Request(newUrl.toString(), request);
            setUserHeaders(forwarded.headers, user);
            setRequestIdHeader(forwarded.headers, requestId);
            return await ctx.handleUserEntry({ request: forwarded, env: ctx.env, pool: ctx.pool, services: ctx.services });
        },

        async getSettings({ requestId }) {
            const ctx = await ensureIndexContext();
            const req = new Request('https://deno/_internal/index/settings', { method: 'GET' });
            setRequestIdHeader(req.headers, requestId);
            const resp = await ctx.handleIndexEntry({ request: req, env: ctx.env, pool: ctx.pool, services: ctx.services });
            return await resp.json();
        },

        async listUsers({ afterId, limit, requestId }) {
            const ctx = await ensureIndexContext();
            const url = new URL('https://deno/_internal/index/users/list');
            url.searchParams.set('afterId', String(afterId || 0));
            url.searchParams.set('limit', String(limit || 200));
            const req = new Request(url.toString(), { method: 'GET' });
            setRequestIdHeader(req.headers, requestId);
            const resp = await ctx.handleIndexEntry({ request: req, env: ctx.env, pool: ctx.pool, services: ctx.services });
            return await resp.json();
        },

        async patchSettings({ patch, requestId }) {
            const ctx = await ensureIndexContext();
            const req = new Request('https://deno/_internal/index/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
                body: JSON.stringify(patch || {}),
            });
            const resp = await ctx.handleIndexEntry({ request: req, env: ctx.env, pool: ctx.pool, services: ctx.services });
            return resp.ok;
        },

        async triggerUserCron({ user, requestId }) {
            const ctx = await ensureUserContext();
            const req = new Request('https://deno/_internal/cron', { method: 'POST' });
            setUserHeaders(req.headers, user);
            setRequestIdHeader(req.headers, requestId);
            const resp = await ctx.handleUserEntry({ request: req, env: ctx.env, pool: ctx.pool, services: ctx.services });
            return resp.ok;
        },
    });
}
