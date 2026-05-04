import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDashboardBuildParts } from './vite.shared.config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dashboard = createDashboardBuildParts();

export default defineConfig({
    plugins: dashboard.plugins,
    resolve: dashboard.resolve,
    optimizeDeps: dashboard.optimizeDeps,
    build: {
        outDir: path.join(__dirname, 'dist/client'),
        emptyOutDir: true,
        assetsDir: dashboard.assetsDir,
        rollupOptions: {
            input: dashboard.input,
        },
    },
});
