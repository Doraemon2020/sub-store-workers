/**
 * L2 - atomApiDoc
 *
 * IndexDomainGateway 契约说明：
 * - 负责全局域状态：users index / settings / captcha / avatar / tokenVersion
 * - Workers 实现依赖 IndexDO 的串行语义
 * - Deno 实现必须显式补齐事务与锁语义
 */

export const indexGatewayDoc = Object.freeze({
    domain: 'index',
    consistencyModel: {
        scope: 'global-index-domain',
        readAfterWrite: 'required',
        crossEntityConsistency: 'best-effort unless explicitly wrapped by higher-level orchestration',
    },
    methods: {
        getSystemSettings: {
            sideEffects: 'read-only',
            transaction: 'not required',
            lock: 'none',
            retry: 'optional',
        },
        patchSystemSettings: {
            sideEffects: 'writes global settings',
            transaction: 'required',
            lock: 'global index/settings lock',
            retry: 'required on transactional conflict in non-DO runtimes',
        },
        getUserById: {
            sideEffects: 'read-only',
            transaction: 'not required',
            lock: 'none',
        },
        getUserByUsername: {
            sideEffects: 'read-only',
            transaction: 'not required',
            lock: 'none',
        },
        getUserByPath: {
            sideEffects: 'read-only',
            transaction: 'not required',
            lock: 'none',
        },
        listUsers: {
            sideEffects: 'read-only',
            transaction: 'not required',
            lock: 'none',
        },
        listUsersForAdmin: {
            sideEffects: 'read-only',
            transaction: 'not required',
            lock: 'none',
        },
        countUsers: {
            sideEffects: 'read-only',
            transaction: 'not required',
            lock: 'none',
        },
        createUser: {
            sideEffects: 'creates user row',
            transaction: 'required',
            lock: 'unique constraints required; additional lock optional',
            retry: 'required on unique conflict / serialization conflict in non-DO runtimes',
        },
        deleteUser: {
            sideEffects: 'deletes user row',
            transaction: 'required',
            lock: 'userId-scoped lock recommended',
            retry: 'required on conflict in non-DO runtimes',
        },
        updateUsername: {
            sideEffects: 'updates username',
            transaction: 'required',
            lock: 'userId-scoped or unique-target lock required',
            retry: 'required on conflict in non-DO runtimes',
        },
        updatePath: {
            sideEffects: 'updates path',
            transaction: 'required',
            lock: 'userId-scoped or unique-target lock required',
            retry: 'required on conflict in non-DO runtimes',
        },
        updateNotes: {
            sideEffects: 'updates notes',
            transaction: 'required',
            lock: 'userId-scoped lock required',
            retry: 'required on conflict in non-DO runtimes',
        },
        updatePasswordAndBumpTokenVersion: {
            sideEffects: 'updates password and invalidates old tokens',
            transaction: 'required',
            lock: 'userId-scoped lock required',
            retry: 'required on conflict in non-DO runtimes',
        },
        updateAvatar: {
            sideEffects: 'updates avatar url',
            transaction: 'required',
            lock: 'userId-scoped lock required',
            retry: 'required on conflict in non-DO runtimes',
        },
        getUserTokenVersion: {
            sideEffects: 'read-only',
            transaction: 'not required',
            lock: 'none',
        },
        createCaptcha: {
            sideEffects: 'creates captcha row',
            transaction: 'required',
            lock: 'captcha-id lock optional',
        },
        getCaptchaForVerify: {
            sideEffects: 'read-only',
            transaction: 'not required',
            lock: 'none',
        },
        incrementCaptchaAttempts: {
            sideEffects: 'increments captcha attempts',
            transaction: 'required',
            lock: 'captcha-id scoped lock recommended',
        },
        deleteCaptcha: {
            sideEffects: 'deletes captcha row',
            transaction: 'required',
            lock: 'captcha-id scoped lock optional',
        },
        deleteExpiredCaptchas: {
            sideEffects: 'batch cleanup',
            transaction: 'required',
            lock: 'global captcha cleanup lock recommended in non-DO runtimes',
        },
    },
});
