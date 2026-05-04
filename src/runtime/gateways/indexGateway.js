/**
 * L2 Runtime Gateway
 *
 * Index 域状态访问契约：
 * - users index / settings / captcha / avatar / mmdb meta
 * - 具体实现由 runtime adapter 提供（Workers / Deno）
 * - 详细约束见 src/orchestration/atomApiDoc/runtime/indexGatewayDoc.js
 */

/**
 * @typedef {Object} IndexDomainGateway
 * @property {(args: { mergeSettings: Function }) => Promise<Record<string, unknown>>} getSystemSettings 读取 settings；必须满足读后写一致
 * @property {(args: { patch: Record<string, unknown>, mergeSettings: Function, mergePatch: Function }) => Promise<Record<string, unknown>>} patchSystemSettings 写 settings；非 DO 平台必须事务+全局锁
 * @property {(id: number) => Promise<Record<string, unknown>|null>} getUserById
 * @property {(username: string) => Promise<Record<string, unknown>|null>} getUserByUsername
 * @property {(path: string) => Promise<Record<string, unknown>|null>} getUserByPath
 * @property {(afterId: number, limit: number) => Promise<Array<Record<string, unknown>>>} listUsers
 * @property {() => Promise<Array<Record<string, unknown>>>} listUsersForAdmin
 * @property {() => Promise<number>} countUsers
 * @property {(args: { username: string, passwordHash: string, role: string, path: string }) => Promise<Record<string, unknown>>} createUser 创建用户；非 DO 平台必须事务，依赖唯一约束或重试
 * @property {(userId: number) => Promise<void>} deleteUser 删除用户；非 DO 平台必须 userId 级锁
 * @property {(userId: number, username: string) => Promise<void>} updateUsername 更新用户名；非 DO 平台必须事务+userId/目标唯一键锁
 * @property {(userId: number, path: string) => Promise<void>} updatePath 更新 path；非 DO 平台必须事务+userId/目标唯一键锁
 * @property {(userId: number, notes: string) => Promise<void>} updateNotes 更新 notes；非 DO 平台必须事务+userId 锁
 * @property {(userId: number, passwordHash: string) => Promise<void>} updatePasswordAndBumpTokenVersion 更新密码并 bump tokenVersion；非 DO 平台必须事务+userId 锁
 * @property {(userId: number, avatarUrl: string) => Promise<void>} updateAvatar 更新 avatar；非 DO 平台必须事务+userId 锁
 * @property {(userId: number) => Promise<number|null>} getUserTokenVersion
 * @property {(args: { id: string, code: string, expiresAt: number }) => Promise<void>} createCaptcha 创建验证码；非 DO 平台建议事务
 * @property {(id: string) => Promise<Record<string, unknown>|null>} getCaptchaForVerify
 * @property {(id: string) => Promise<void>} incrementCaptchaAttempts 增加尝试次数；非 DO 平台建议 captchaId 级锁
 * @property {(id: string) => Promise<void>} deleteCaptcha 删除验证码；非 DO 平台建议事务
 * @property {(now: number) => Promise<void>} deleteExpiredCaptchas 清理过期验证码；非 DO 平台建议全局 cleanup 锁
 */

/**
 * @param {IndexDomainGateway} impl
 * @returns {IndexDomainGateway}
 */
export function createIndexGateway(impl) {
    return impl;
}
