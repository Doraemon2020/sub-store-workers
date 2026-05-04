/**
 * L3 - Molecule（Service）
 * 系统设置：读取/回填默认值/更新。
 */

import { defaultSettings } from '../../settings-defaults.js';
import { mergeSettingsWithDefaults } from '../../atoms/settings/settingsAtoms.js';

/**
 * 获取系统设置
 * 如果数据库中没有某个 key，则从 defaultSettings 获取并自动保存
 * @param {object} ctx
 * @returns {Promise<object>}
 */
export async function getSystemSettings(ctx) {
    return await ctx.services.indexGateway.getSystemSettings({
        mergeSettings: ({ dbSettings }) => mergeSettingsWithDefaults({ defaultSettings, dbSettings }),
    });
}

/**
 * 获取单个设置项
 * @param {object} ctx
 * @param {string} key 
 * @returns {Promise<any>}
 */
export async function getSetting(ctx, key) {
    const settings = await getSystemSettings(ctx);
    return settings[key];
}

/**
 * 更新系统设置
 * @param {object} ctx
 * @param {object} settings 
 */
export async function updateSystemSettings(ctx, settings) {
    await ctx.services.indexGateway.patchSystemSettings({
        patch: settings,
        mergeSettings: ({ dbSettings }) => mergeSettingsWithDefaults({ defaultSettings, dbSettings }),
        mergePatch: ({ current, patch }) => ({ ...current, ...patch }),
    });
}
