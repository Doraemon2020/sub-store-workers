/**
 * L4 - Atom
 * 读取并清理旧版全局 user data dirty 标记。
 * 正常持久化应由调用方通过 userGateway 完成，避免全局状态绕过运行时边界。
 */

export function flushDirtyGlobalUserData() {
    if (globalThis.__user_data_dirty__ && globalThis.__user_data__) {
        const dataString = JSON.stringify(globalThis.__user_data__);
        globalThis.__user_data_dirty__ = false;
        globalThis.__user_data__ = null;
        return dataString;
    }
    return null;
}
