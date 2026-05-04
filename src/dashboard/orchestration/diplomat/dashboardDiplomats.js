import { debug, error as logError } from '../../../utils/logger.js';

const PUBLIC_SETTINGS_CACHE_TAG = 'dashboard-public-settings';

function buildCacheKey(request) {
    return new Request(request.url, { method: 'GET' });
}

function buildPublicSettingsCacheKey(request) {
    const url = new URL('/api/dashboard/settings/public', request.url);
    return new Request(url.toString(), { method: 'GET' });
}

export async function matchPublicSettingsCache({ request }) {
    if (!globalThis.caches?.default) {
        return null;
    }
    const cacheKey = buildCacheKey(request);
    return await caches.default.match(cacheKey);
}

export async function putPublicSettingsCache({ request, response }) {
    if (!globalThis.caches?.default) {
        return { success: true, mode: 'header-cache-only' };
    }
    const cacheKey = buildCacheKey(request);
    await caches.default.put(cacheKey, response.clone());
    return { success: true };
}

export async function deletePublicSettingsCache({ request }) {
    if (!globalThis.caches?.default) {
        try {
            await fetch('http://cache.localhost/invalidate/http', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tags: [PUBLIC_SETTINGS_CACHE_TAG] }),
            });
        } catch {
            // ignore in runtimes without cache invalidation endpoint
        }
        return { success: true, mode: 'tag-invalidation-or-noop' };
    }
    const cacheKey = buildPublicSettingsCacheKey(request);
    await caches.default.delete(cacheKey);
    return { success: true };
}

export function getPublicSettingsCacheHeaders() {
    return {
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
        'Deno-Cache-Tag': PUBLIC_SETTINGS_CACHE_TAG,
    };
}

export async function verifyTurnstileToken({ token, secretKey, ip }) {
    debug('[Turnstile] Verifying with secretKey length:', secretKey.length, 'token length:', token?.length);
    try {
        const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}&remoteip=${encodeURIComponent(ip)}`,
        });
        const data = await res.json();
        debug('[Turnstile] Verify result:', JSON.stringify(data));
        return data.success === true;
    } catch (e) {
        logError('[Turnstile] Verification error:', e);
        return false;
    }
}

export async function fetchDashboardAsset({ env, requestOrUrl }) {
    if (!env?.__dashboardAssetFetcher?.fetchDashboardAsset) {
        return new Response('Dashboard asset gateway not available', { status: 501 });
    }
    return await env.__dashboardAssetFetcher.fetchDashboardAsset({ requestOrUrl });
}

export async function fetchMmdbFromUrl({ url, requestId }) {
    debug(`[MMDB] [${requestId}] fetch start: ${url}`);
    const resp = await fetch(url);
    debug(`[MMDB] [${requestId}] fetch response: ${url} -> ${resp.status}`);
    if (!resp.ok) {
        return {
            ok: false,
            status: resp.status,
            etag: resp.headers.get('etag') || '',
            arrayBuffer: null,
        };
    }

    const arrayBuffer = await resp.arrayBuffer();
    debug(`[MMDB] [${requestId}] fetch bytes: ${url} -> ${arrayBuffer.byteLength}`);

    return {
        ok: true,
        status: resp.status,
        etag: resp.headers.get('etag') || '',
        arrayBuffer,
    };
}
