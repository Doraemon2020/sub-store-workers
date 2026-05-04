/**
 * QuickJS module loader for Cloudflare Workers.
 *
 * Workers 侧继续使用本地复制到 src/ 下的 wasm 模块，交给构建器处理。
 */

import { newQuickJSWASMModule, newVariant, RELEASE_SYNC as baseVariant } from 'quickjs-emscripten';
import wasmModule from './wasm/RELEASE_SYNC.wasm';

let quickJsModulePromise = null;

export async function getQuickJsModuleForWorkers() {
    if (!quickJsModulePromise) {
        const variant = newVariant(baseVariant, {
            wasmModule,
        });
        quickJsModulePromise = newQuickJSWASMModule(variant);
    }
    return await quickJsModulePromise;
}
