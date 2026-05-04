globalThis.__loadSubStoreEntry__ = async () => {
    await import('../../../../sub-store/backend/src/main.js');
};

globalThis.__loadQuickJsModule__ = async () => {
    const mod = await import('./quickjsModule.js');
    return await mod.getQuickJsModuleForWorkers();
};
