/**
 * L2 Runtime Gateway
 *
 * 跨入口 transport 契约：
 * - Public entry <-> Index entry
 * - Public entry <-> User entry
 * - Dashboard assets
 * - Cron 所需的跨入口调用
 */

/**
 * @typedef {Object} EntryGateway
 * @property {(args: { request: Request, requestId: string }) => Promise<Response>} forwardDashboardApi
 * @property {(args: { requestOrUrl: Request|string|URL }) => Promise<Response>} fetchDashboardAsset
 * @property {(args: { userPath: string, requestId: string }) => Promise<Record<string, unknown>|null>} getUserByPath
 * @property {(args: { request: Request, user: Record<string, unknown>, requestId: string }) => Promise<Response>} forwardSubStoreRequest
 * @property {(args: { requestId: string }) => Promise<Record<string, unknown>>} getSettings
 * @property {(args: { afterId: number, limit: number, requestId: string }) => Promise<{results: Array<Record<string, unknown>>}>} listUsers
 * @property {(args: { patch: Record<string, unknown>, requestId: string }) => Promise<boolean>} patchSettings
 * @property {(args: { user: Record<string, unknown>, requestId: string }) => Promise<boolean>} triggerUserCron
 */

/**
 * @param {EntryGateway} impl
 * @returns {EntryGateway}
 */
export function createEntryGateway(impl) {
    return impl;
}
