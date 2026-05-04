import path from 'node:path';

globalThis.__loadSubStoreEntry__ = async () => {
    const denoBundleUrl = path.normalize(path.join(Deno.cwd(), 'dist/deno/substore-runtime.js'));
    await import(/* @vite-ignore */ denoBundleUrl);
};

globalThis.__loadQuickJsModule__ = async () => {
    const mod = await import('./quickjsModule.js');
    return await mod.getQuickJsModuleForDeno();
};
