/**
 * L2 - Commander
 * Index 域入口编排：只负责分发到对应 L3 molecule，不实现业务逻辑/SQL。
 */

import { parseIndexEntryRoute } from '../dataOfficer/indexEntryRouteDataOfficer.js';
import { mergeSystemSettings, mergeSystemSettingsPatch } from '../dataOfficer/systemSettingsDataOfficer.js';
import { getSettings } from '../../molecules/index/getSettings.js';
import { patchSettings } from '../../molecules/index/patchSettings.js';
import { getUserByPath } from '../../molecules/index/getUserByPath.js';
import { listUsers } from '../../molecules/index/listUsers.js';
import { updateAvatar } from '../../molecules/index/updateAvatar.js';
import { proxyUserData } from '../../molecules/index/proxyUserData.js';
import { getMmdbMeta } from '../../molecules/index/getMmdbMeta.js';
import { getMmdbFile } from '../../molecules/index/getMmdbFile.js';
import { putMmdbFile } from '../../molecules/index/putMmdbFile.js';
import { handleDashboardApiViaDashboardCommander } from '../diplomat/dashboardApiViaDashboardCommanderDiplomat.js';
import { buildNotFoundResponse } from '../../atoms/http/httpAtoms.js';

export async function handle({ request, env, storage, requestId, services }) {
    const route = parseIndexEntryRoute(request);
    const { indexGateway, userGateway, mmdbGateway } = services;

    if (route.kind === 'settings-get') {
        return await getSettings({ request, env, storage, requestId, mergeSettings: mergeSystemSettings, indexGateway });
    }

    if (route.kind === 'settings-patch') {
        return await patchSettings({
            request,
            env,
            storage,
            requestId,
            mergeSettings: mergeSystemSettings,
            mergePatch: mergeSystemSettingsPatch,
            indexGateway,
        });
    }

    if (route.kind === 'user-by-path') {
        return await getUserByPath({ request, env, storage, requestId, route, indexGateway });
    }

    if (route.kind === 'users-list') {
        return await listUsers({ request, env, storage, requestId, route, indexGateway });
    }

    if (route.kind === 'users-avatar') {
        return await updateAvatar({ request, env, storage, requestId, indexGateway });
    }

    if (route.kind === 'user-data') {
        return await proxyUserData({ request, env, storage, requestId, route, userGateway });
    }

    if (route.kind === 'dashboard-api') {
        return await handleDashboardApiViaDashboardCommander({ request, env, storage, requestId, services });
    }

    if (route.kind === 'mmdb-meta') {
        return await getMmdbMeta({ request, env, storage, requestId, route, mmdbGateway });
    }

    if (route.kind === 'mmdb-file-get') {
        return await getMmdbFile({ request, env, storage, requestId, route, mmdbGateway });
    }

    if (route.kind === 'mmdb-file-put') {
        return await putMmdbFile({ request, env, storage, requestId, route, mmdbGateway });
    }

    return buildNotFoundResponse();
}
