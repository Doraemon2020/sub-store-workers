/**
 * L3 - Molecule
 * Index 域：读取系统设置（补齐默认值并在缺失时回写）。
 */

import { jsonResponse } from '../../atoms/http/httpAtoms.js';

export async function getSettings({ mergeSettings, indexGateway }) {
    const settings = await indexGateway.getSystemSettings({ mergeSettings });
    return jsonResponse(settings);
}
