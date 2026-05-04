import { parseJsonObjectOrEmpty } from '../../../atoms/json/parseJsonObjectOrEmpty.js';
import {
    selectSystemSettingsRow,
    upsertSystemSettingsRow,
    selectUserByPath,
    selectUsersAfterId,
    updateAvatarUrl,
    selectMmdbFilesMeta,
    selectMmdbFileByName,
    upsertMmdbFile,
    getIndexUserByUsername,
    getIndexUserById,
    createIndexUser,
    updateIndexUsername,
    updateIndexPath,
    updateIndexNotes,
    updateIndexPasswordAndBumpTokenVersion,
    deleteIndexUser,
    listIndexUsersForAdmin,
    getIndexUserTokenVersionById,
    countIndexUsers,
    deleteExpiredIndexCaptchas,
    insertIndexCaptcha,
    getIndexCaptchaForVerify,
    deleteIndexCaptcha,
    incrementIndexCaptchaAttempts,
} from '../../../atoms/indexSql/indexSqlAtoms.js';
import {
    selectUserStoreValue,
    upsertUserStoreValue,
    deleteUserStoreKey,
    appendAccessLogWithRetention,
    selectAccessLogPage,
} from '../../../atoms/userSql/userSqlAtoms.js';
import { createIndexGateway } from '../../../runtime/gateways/indexGateway.js';
import { createUserGateway } from '../../../runtime/gateways/userGateway.js';
import { createMmdbGateway } from '../../../runtime/gateways/mmdbGateway.js';
import {
    deleteUserDataFromUserDo,
    getAccessLogFromUserDo,
    getMmdbFileFromIndexDo,
    getMmdbMetaFromIndexDo,
    getUserDataFromUserDo,
    putMmdbFileToIndexDo,
    putUserDataToUserDo,
    updateAvatarInIndexDo,
} from './bindings.js';

function createWorkersIndexGateway({ storage, env, entry }) {
    const gateway = createIndexGateway({
        async getSystemSettings({ mergeSettings }) {
            const row = selectSystemSettingsRow(storage);
            const dbSettings = parseJsonObjectOrEmpty(row?.settings || '{}');
            const { merged, needsSave } = mergeSettings({ dbSettings });
            if (needsSave) {
                upsertSystemSettingsRow(storage, JSON.stringify(merged), Date.now());
            }
            return merged;
        },

        async patchSystemSettings({ patch, mergeSettings, mergePatch }) {
            const row = selectSystemSettingsRow(storage);
            const dbSettings = parseJsonObjectOrEmpty(row?.settings || '{}');
            const { merged: current, needsSave } = mergeSettings({ dbSettings });
            if (needsSave) {
                upsertSystemSettingsRow(storage, JSON.stringify(current), Date.now());
            }
            const next = mergePatch({ current, patch });
            upsertSystemSettingsRow(storage, JSON.stringify(next), Date.now());
            return next;
        },

        async getUserByPath(path) {
            return selectUserByPath(storage, path) || null;
        },

        async getUserById(id) {
            return getIndexUserById(storage, id) || null;
        },

        async getUserByUsername(username) {
            return getIndexUserByUsername(storage, username) || null;
        },

        async listUsers(afterId, limit) {
            return selectUsersAfterId(storage, afterId, limit) || [];
        },

        async listUsersForAdmin() {
            return listIndexUsersForAdmin(storage) || [];
        },

        async countUsers() {
            return countIndexUsers(storage) || 0;
        },

        async createUser({ username, passwordHash, role, path }) {
            return createIndexUser(storage, username, passwordHash, role, path);
        },

        async deleteUser(userId) {
            deleteIndexUser(storage, userId);
        },

        async updateUsername(userId, username) {
            updateIndexUsername(storage, userId, username, Date.now());
        },

        async updatePath(userId, path) {
            updateIndexPath(storage, userId, path, Date.now());
        },

        async updateNotes(userId, notes) {
            updateIndexNotes(storage, userId, notes, Date.now());
        },

        async updatePasswordAndBumpTokenVersion(userId, passwordHash) {
            updateIndexPasswordAndBumpTokenVersion(storage, userId, passwordHash, Date.now());
        },

        async updateAvatar(userId, avatarUrl) {
            updateAvatarUrl(storage, userId, avatarUrl, Date.now());
        },

        async getUserTokenVersion(userId) {
            return getIndexUserTokenVersionById(storage, userId);
        },

        async createCaptcha({ id, code, expiresAt }) {
            insertIndexCaptcha(storage, id, code, expiresAt);
        },

        async getCaptchaForVerify(id) {
            return getIndexCaptchaForVerify(storage, id) || null;
        },

        async incrementCaptchaAttempts(id) {
            incrementIndexCaptchaAttempts(storage, id);
        },

        async deleteCaptcha(id) {
            deleteIndexCaptcha(storage, id);
        },

        async deleteExpiredCaptchas(now) {
            deleteExpiredIndexCaptchas(storage, now);
        },
    });

    if (entry === 'user') {
        gateway.updateAvatar = async (userId, avatarUrl) => {
            await updateAvatarInIndexDo({ env, userId, avatarUrl, requestId: 'runtime-gateway' });
        };
    }

    return gateway;
}

function createWorkersUserDoGateway({ env }) {
    return createUserGateway({
        async getUserDataString(userId) {
            return await getUserDataFromUserDo({ env, userId, requestId: 'runtime-gateway' });
        },

        async putUserDataString(userId, dataString) {
            return await putUserDataToUserDo({ env, userId, data: JSON.parse(dataString || '{}'), requestId: 'runtime-gateway' });
        },

        async deleteUserDataString(userId) {
            return await deleteUserDataFromUserDo({ env, userId, requestId: 'runtime-gateway' });
        },

        async getUserStoreValue() {
            return null;
        },

        async putUserStoreValue() {},

        async deleteUserStoreKey() {},

        async appendAccessLog() {},

        async listAccessLog(userId, { limit, beforeId }) {
            return await getAccessLogFromUserDo({ env, userId, limit, beforeId, requestId: 'runtime-gateway' });
        },
    });
}

function createWorkersLocalUserGateway({ storage }) {
    return createUserGateway({
        async getUserDataString(_userId) {
            return selectUserStoreValue(storage, 'user_data');
        },

        async putUserDataString(_userId, dataString) {
            upsertUserStoreValue(storage, 'user_data', dataString, Date.now());
        },

        async deleteUserDataString(_userId) {
            deleteUserStoreKey(storage, 'user_data');
        },

        async getUserStoreValue(_userId, key) {
            return selectUserStoreValue(storage, key);
        },

        async putUserStoreValue(_userId, key, value) {
            upsertUserStoreValue(storage, key, value, Date.now());
        },

        async deleteUserStoreKey(_userId, key) {
            deleteUserStoreKey(storage, key);
        },

        async appendAccessLog(_userId, entry) {
            appendAccessLogWithRetention(storage, entry);
        },

        async listAccessLog(_userId, { limit, beforeId }) {
            const rows = selectAccessLogPage(storage, { limit, beforeId });
            const nextBeforeId = rows.length > 0 ? rows[rows.length - 1].id : null;
            return { results: rows, nextBeforeId };
        },
    });
}

function createWorkersMmdbGateway({ storage }) {
    return createMmdbGateway({
        async getMmdbMeta() {
            return selectMmdbFilesMeta(storage) || [];
        },

        async getMmdbFile(name) {
            return selectMmdbFileByName(storage, name) || null;
        },

        async putMmdbFile(args) {
            return upsertMmdbFile(storage, args);
        },
    });
}

function createWorkersIndexDoMmdbGateway({ env }) {
    return createMmdbGateway({
        async getMmdbMeta() {
            const body = await getMmdbMetaFromIndexDo({ env, requestId: 'runtime-gateway' });
            return body?.files || [];
        },

        async getMmdbFile(name) {
            const result = await getMmdbFileFromIndexDo({ env, name, requestId: 'runtime-gateway' });
            if (!result?.ok || !result.arrayBuffer) return null;
            return {
                name,
                etag: result.etag,
                updatedAt: result.updatedAt,
                data: new Uint8Array(result.arrayBuffer),
            };
        },

        async putMmdbFile({ name, etag, data }) {
            const arrayBuffer = data instanceof Uint8Array
                ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
                : data;
            const ok = await putMmdbFileToIndexDo({
                env,
                name,
                etag,
                arrayBuffer,
                requestId: 'runtime-gateway',
            });
            return { success: ok };
        },
    });
}

export function createRuntimeServices({ storage, env, entry = 'user' }) {
    return {
        indexGateway: createWorkersIndexGateway({ storage, env, entry }),
        userGateway: entry === 'index'
            ? createWorkersUserDoGateway({ env })
            : createWorkersLocalUserGateway({ storage }),
        mmdbGateway: entry === 'index'
            ? createWorkersMmdbGateway({ storage })
            : createWorkersIndexDoMmdbGateway({ env }),
    };
}
