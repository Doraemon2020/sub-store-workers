/**
 * Sub-Store Workers - Vite 配置
 *
 * 重要说明：
 * Cloudflare Vite 插件会自动处理 Worker 入口和静态资源。
 * 但 Sub-Store 源码需要特殊的代码替换处理。
 */
import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import { createDashboardBuildParts } from './vite.shared.config.js';

const dashboard = createDashboardBuildParts();

export default defineConfig({
    plugins: [
        ...dashboard.plugins,
        cloudflare(),
    ],
    resolve: dashboard.resolve,
    environments: {
        client: {
            build: {
                assetsDir: dashboard.assetsDir,
                rollupOptions: {
                    input: dashboard.input,
                },
            },
        },
    },
    optimizeDeps: dashboard.optimizeDeps,
    // 开发服务器配置
    server: {
        strictPort: true,
        cors: {
            origin: '*',
            methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
            credentials: true,
        },
    },
});
