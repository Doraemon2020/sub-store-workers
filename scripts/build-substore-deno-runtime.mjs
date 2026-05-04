import { spawn } from 'node:child_process';

async function run() {
    await new Promise((resolve, reject) => {
        const child = spawn('npx', ['vite', 'build', '--config', 'vite.deno-substore.config.js'], {
            stdio: 'inherit',
            env: process.env,
        });
        child.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`vite deno substore build failed with code ${code}`));
        });
        child.on('error', reject);
    });
}

run().catch((error) => {
    console.error('[build-substore-deno-runtime] failed:', error?.stack || error?.message || error);
    process.exitCode = 1;
});
