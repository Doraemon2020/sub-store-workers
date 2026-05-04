/**
 * Runtime-aware QuickJS module loader.
 */

let quickJsModulePromise = null;

export async function getQuickJsModule() {
    if (!quickJsModulePromise) {
        quickJsModulePromise = loadQuickJsModule();
    }
    return await quickJsModulePromise;
}

async function loadQuickJsModule() {
    if (typeof globalThis.__loadQuickJsModule__ !== 'function') {
        throw new Error('QuickJS loader is not registered');
    }
    return await globalThis.__loadQuickJsModule__();
}
