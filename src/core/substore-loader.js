/**
 * Sub-Store 初始化包装器
 * 
 * Sub-Store 的 main.js 会在 import 时自动执行。
 * 这个包装器提供延迟初始化功能，以便在 Workers 环境准备好后再执行。
 */

import { debug, error } from '../utils/logger.js';

let initialized = false;

async function importSubStoreEntry() {
    debug('[SubStore] loading registered runtime entry');
    if (typeof globalThis.__loadSubStoreEntry__ !== 'function') {
        throw new Error('SubStore runtime loader is not registered');
    }
    await globalThis.__loadSubStoreEntry__();
}

/**
 * 初始化 Sub-Store
 * 必须在全局环境（$httpClient, $persistentStore 等）设置完成后调用
 * @param {object} $request - 当前请求对象，(本地开发使用) 必须传入以避免并发请求覆盖
 */
export async function initSubStore($request) {
    if (initialized) {
        debug('[SubStore] 已初始化，调用 dispatch 处理请求...');
        // 已初始化时，直接调用 dispatch 处理当前请求
        if (globalThis.__substore_dispatch__) {
            globalThis.__substore_dispatch__($request);
        } else {
            error('[SubStore] dispatch 函数未找到！');
        }
        return;
    }

    await importSubStoreEntry();

    initialized = true;
    debug('[SubStore] 首次初始化完成');

    // 在模块完全加载后调用 dispatch 处理首次请求
    // 这避免了在模块导入期间执行 async I/O（Workers 禁止此操作）
    if (globalThis.__substore_dispatch__) {
        globalThis.__substore_dispatch__($request);
    } else {
        error('[SubStore] dispatch 函数未找到！');
    }
}
