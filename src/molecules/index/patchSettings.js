/**
 * L3 - Molecule
 * Index 域：更新系统设置（基于当前 settings 合并 patch 后写回）。
 */

import { jsonResponse } from '../../atoms/http/httpAtoms.js';
import { readJsonBody } from '../../atoms/http/httpAtoms.js';

export async function patchSettings({ request, mergeSettings, mergePatch, indexGateway }) {
    const patch = (await readJsonBody(request)) || {};
    await indexGateway.patchSystemSettings({ patch, mergeSettings, mergePatch });
    return jsonResponse({ ok: true });
}
