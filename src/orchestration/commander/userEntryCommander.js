/**
 * L2 - Commander
 * User 域入口编排：只负责分发到对应 L3 molecule，不实现业务逻辑/SQL。
 */

import { parseUserEntryRoute } from '../dataOfficer/userEntryRouteDataOfficer.js';
import { listAccessLog } from '../../molecules/user/listAccessLog.js';
import { getUserDataString } from '../../molecules/user/getUserDataString.js';
import { putUserDataString } from '../../molecules/user/putUserDataString.js';
import { deleteUserDataString } from '../../molecules/user/deleteUserDataString.js';
import { buildNotFoundResponse } from '../../atoms/http/httpAtoms.js';

export async function handle({ request, env, state, storage, requestId, services }) {
    const route = parseUserEntryRoute(request);
    const { userGateway, mmdbGateway, indexGateway } = services;

    if (route.kind === 'access-log') {
        return await listAccessLog({ request, env, storage, requestId, route, userGateway });
    }

    if (route.kind === 'user-data-get') {
        return await getUserDataString({ request, env, storage, requestId, route, userGateway });
    }

    if (route.kind === 'user-data-put') {
        return await putUserDataString({ request, env, storage, requestId, route, userGateway, indexGateway });
    }

    if (route.kind === 'user-data-delete') {
        return await deleteUserDataString({ request, env, storage, requestId, route, userGateway, indexGateway });
    }

    if (route.kind === 'cron') {
        const { runUserCron } = await import('../../molecules/user/runUserCron.js');
        return await runUserCron({ request, env, state, storage, requestId, route, userGateway, mmdbGateway, indexGateway });
    }

    if (route.kind === 'substore') {
        const { forwardToSubStore } = await import('../../molecules/user/forwardToSubStore.js');
        return await forwardToSubStore({ request, env, state, storage, requestId, route, userGateway, mmdbGateway, indexGateway });
    }

    return buildNotFoundResponse();
}
