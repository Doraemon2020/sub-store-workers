import path from 'node:path';
import { debug } from '../../../../utils/logger.js';

export function createDashboardAssetFetcher({ baseDir } = {}) {
    const rootDir = path.resolve(baseDir || path.join(Deno.cwd(), 'dist/client'));

    return {
        async fetchDashboardAsset({ requestOrUrl }) {
            const url = typeof requestOrUrl === 'string' || requestOrUrl instanceof URL
                ? new URL(String(requestOrUrl), 'https://local')
                : new URL(requestOrUrl.url);

            const pathname = url.pathname === '/' ? '/dashboard/index.html' : url.pathname;
            const relativePath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
            const filePath = path.resolve(rootDir, relativePath);
            if (filePath !== rootDir && !filePath.startsWith(`${rootDir}${path.sep}`)) {
                debug(`[DenoAssets] rejected ${relativePath} @ ${filePath}`);
                return new Response('Not Found', { status: 404 });
            }
            try {
                const file = await Deno.readFile(filePath);
                const headers = new Headers();
                if (filePath.endsWith('.html')) headers.set('Content-Type', 'text/html; charset=utf-8');
                if (filePath.endsWith('.js')) headers.set('Content-Type', 'application/javascript; charset=utf-8');
                if (filePath.endsWith('.css')) headers.set('Content-Type', 'text/css; charset=utf-8');
                if (filePath.endsWith('.json')) headers.set('Content-Type', 'application/json; charset=utf-8');
                if (filePath.endsWith('.svg')) headers.set('Content-Type', 'image/svg+xml');
                if (filePath.endsWith('.wasm')) headers.set('Content-Type', 'application/wasm');
                if (filePath.endsWith('.woff2')) headers.set('Content-Type', 'font/woff2');
                if (filePath.endsWith('.woff')) headers.set('Content-Type', 'font/woff');
                debug(`[DenoAssets] hit ${relativePath} @ ${filePath}`);
                return new Response(file, { status: 200, headers });
            } catch {
                debug(`[DenoAssets] miss ${relativePath} @ ${filePath}`);
                return new Response('Not Found', { status: 404 });
            }
        },
    };
}
