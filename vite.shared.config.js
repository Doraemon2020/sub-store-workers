import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    SUB_STORE_PATH,
    subStoreTransformPlugin,
} from './vite.substore-transform.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createSharedResolveConfig() {
    return {
        alias: {
            '@': path.join(SUB_STORE_PATH, 'src'),
        },
    };
}

export function createDashboardBuildParts() {
    return {
        plugins: [
            tailwindcss(),
            react(),
            subStoreTransformPlugin(),
        ],
        resolve: createSharedResolveConfig(),
        optimizeDeps: {
            include: ['react', 'react-dom', 'jose'],
        },
        assetsDir: 'dashboard/assets',
        input: {
            dashboard: path.join(__dirname, 'dashboard/index.html'),
        },
        external: ['net'],
    };
}
