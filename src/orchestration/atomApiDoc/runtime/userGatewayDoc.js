/**
 * L2 - atomApiDoc
 *
 * UserDomainGateway 契约说明：
 * - 负责用户域状态：user_data / user_store / access_log
 * - 所有写操作必须按 userId 串行
 */

export const userGatewayDoc = Object.freeze({
    domain: 'user',
    consistencyModel: {
        scope: 'per-user',
        readAfterWrite: 'required within same userId',
        writeSerialization: 'required for all writes under same userId',
    },
    methods: {
        getUserDataString: {
            sideEffects: 'read-only',
            transaction: 'not required',
            lock: 'none',
        },
        putUserDataString: {
            sideEffects: 'writes user_data',
            transaction: 'required',
            lock: 'userId lock required',
            retry: 'required on conflict in non-DO runtimes',
        },
        deleteUserDataString: {
            sideEffects: 'deletes user_data',
            transaction: 'required',
            lock: 'userId lock required',
            retry: 'required on conflict in non-DO runtimes',
        },
        getUserStoreValue: {
            sideEffects: 'read-only',
            transaction: 'not required',
            lock: 'none',
        },
        putUserStoreValue: {
            sideEffects: 'writes user_store',
            transaction: 'required',
            lock: 'userId lock required',
            retry: 'required on conflict in non-DO runtimes',
        },
        deleteUserStoreKey: {
            sideEffects: 'deletes user_store key',
            transaction: 'required',
            lock: 'userId lock required',
            retry: 'required on conflict in non-DO runtimes',
        },
        appendAccessLog: {
            sideEffects: 'appends access log and may perform retention cleanup',
            transaction: 'required',
            lock: 'userId lock required',
            retry: 'required on conflict in non-DO runtimes',
        },
        listAccessLog: {
            sideEffects: 'read-only',
            transaction: 'not required',
            lock: 'none',
        },
    },
});
