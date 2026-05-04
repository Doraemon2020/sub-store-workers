import './runtime/registerRuntimeLoaders.js';
import { createDenoFetchHandler } from './fetchHandler.js';
import { registerDenoCron } from './cron.js';
import { getSharedPgPool } from './runtime/postgres/createPgPool.js';

const env = Deno.env.toObject();
const port = Number(Deno.env.get('PORT') || '8000');
const pool = getSharedPgPool();
const assetBaseDir = env.DENO_ASSET_BASE_DIR;

registerDenoCron({ env, pool, assetBaseDir });

const handler = createDenoFetchHandler({ env, pool, assetBaseDir });

Deno.serve({ port }, async (request) => {
    return await handler(request);
});
