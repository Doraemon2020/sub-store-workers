/**
 * QuickJS module loader for Deno.
 *
 * Deno 侧不直接 import 本地复制的 wasm 文件，而是使用 quickjs-emscripten
 * 官方变体定义，让包自身接管 wasm 装载。
 */

import { newQuickJSWASMModule, RELEASE_SYNC } from 'npm:quickjs-emscripten';

let quickJsModulePromise = null;

export async function getQuickJsModuleForDeno() {
    if (!quickJsModulePromise) {
        quickJsModulePromise = newQuickJSWASMModule(RELEASE_SYNC);
    }
    return await quickJsModulePromise;
}
