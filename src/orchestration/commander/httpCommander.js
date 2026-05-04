/**
 * L2 - Commander
 * HTTP / Cron 入口编排：只负责选择执行顺序，不实现业务逻辑/数据处理/IO。
 */

import { parseHttpRoute } from '../dataOfficer/httpDataOfficer.js';
import { normalizeCronSettings } from '../dataOfficer/cronDataOfficer.js';
import { handleDashboardRequest } from '../../molecules/http/handleDashboardRequest.js';
import { handleUserPathRequest } from '../../molecules/http/handleUserPathRequest.js';
import { runCronBatch } from '../../molecules/http/runCronBatch.js';
import { buildCorsPreflightResponse } from '../../atoms/http/httpAtoms.js';
import { buildNotFoundResponse } from '../../atoms/http/httpAtoms.js';

export async function handleHttp({ request, env, ctx, requestId, entryGateway }) {
    const route = parseHttpRoute(request);

    if (route.kind === 'cors-preflight') {
        return buildCorsPreflightResponse();
    }

    if (route.kind === 'dashboard') {
        return await handleDashboardRequest({ request, env, requestId, route, entryGateway });
    }

    if (route.kind === 'user-path') {
        return await handleUserPathRequest({ request, env, requestId, route, entryGateway });
    }

    return buildNotFoundResponse();
}

export async function handleCron({ event, env, ctx, entryGateway }) {
    const settings = await runCronBatch({
        settingsNormalizer: normalizeCronSettings,
        entryGateway,
    });
    return settings;
}
