import { handleHttp } from '../../orchestration/commander/httpCommander.js';
import { getRequestId, initLogger, error as logError } from '../../utils/logger.js';
import { addRequestIdHeaderToResponse } from '../../atoms/http/httpAtoms.js';
import { getSharedPgPool } from './runtime/postgres/createPgPool.js';
import { createDenoRequestContext } from './runtime/context/createDenoRequestContext.js';

export function createDenoFetchHandler({ env = {}, pool = getSharedPgPool(), assetBaseDir, now = () => Date.now() } = {}) {
    const { entryGateway } = createDenoRequestContext({
        env,
        pool,
        assetBaseDir,
        now,
    });

    return async function handle(request) {
        initLogger(env);
        const requestId = getRequestId(request);
        const url = new URL(request.url);

        if (url.pathname.startsWith('/_internal/')) {
            return addRequestIdHeaderToResponse(new Response('Not Found', { status: 404 }), requestId);
        }

        try {
            const response = await handleHttp({ request, env, ctx: null, requestId, entryGateway });
            return addRequestIdHeaderToResponse(response, requestId);
        } catch (err) {
            logError(`[DenoWorker] [${requestId}] unhandled error:`, err?.stack || err?.message || err);
            return addRequestIdHeaderToResponse(new Response('Internal Server Error', { status: 500 }), requestId);
        }
    };
}
