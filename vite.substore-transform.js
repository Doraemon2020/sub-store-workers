import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const SUB_STORE_PATH = path.join(__dirname, 'sub-store/backend');
export const FASTEST_TEXT_ENCODER_DECODER_PATH = path.join(
    SUB_STORE_PATH,
    'node_modules/fastestsmallesttextencoderdecoder/NodeJS/EncoderAndDecoderNodeJS.min.mjs',
);

export function subStoreTransformPlugin() {
    let expressPatchApplied = 0;
    let expressFileSeen = false;
    let openApiPatchApplied = 0;
    let openApiFileSeen = false;
    let downloadPatchApplied = 0;
    let downloadFileSeen = false;
    let processorsPatchApplied = 0;
    let processorsFileSeen = false;
    let openApiDebugPatchApplied = 0;
    let openApiDebugFileSeen = false;

    return {
        name: 'sub-store-transform',
        enforce: 'pre',
        transform(code, id) {
            if (!id.includes('sub-store/backend/src')) {
                return null;
            }

            let contents = code;

            contents = contents.replace(/eval\s*\(\s*['"`]require\s*\(\s*['"`]dotenv['"`]\s*\)['"`]\s*\)/g, '({ config: () => {} })');
            contents = contents.replace(/eval\s*\(\s*["'`]require\s*\(\s*['"`]fs['"`]\s*\)["'`]\s*\)/g, 'globalThis.__fs_shim__');
            contents = contents.replace(/eval\s*\(\s*["'`]require\s*\(\s*['"`]path['"`]\s*\)["'`]\s*\)/g, 'globalThis.__path_shim__');
            contents = contents.replace(/eval\s*\(\s*["'`]require\s*\(\s*['"`]undici['"`]\s*\)["'`]\s*\)/g, '({ request: globalThis.fetch, Agent: class {}, ProxyAgent: class {}, EnvHttpProxyAgent: class {} })');
            contents = contents.replace(/eval\s*\(\s*["'`]require\s*\(\s*['"`]fetch-socks['"`]\s*\)["'`]\s*\)/g, '({ socksDispatcher: () => null })');
            contents = contents.replace(/eval\s*\(\s*['"`]require\s*\(\s*['"`]express['"`]\s*\)['"`]\s*\)/g, 'null');
            contents = contents.replace(/eval\s*\(\s*['"`]require\s*\(\s*['"`]body-parser['"`]\s*\)['"`]\s*\)/g, '({ json: () => (req, res, next) => next(), urlencoded: () => (req, res, next) => next(), raw: () => (req, res, next) => next() })');
            contents = contents.replace(/eval\s*\(\s*['"`]require\s*\(\s*['"`]cron['"`]\s*\)['"`]\s*\)/g, '({ CronJob: class { constructor() {} } })');
            contents = contents.replace(/eval\s*\(\s*['"`]require\s*\(\s*['"`]child_process['"`]\s*\)['"`]\s*\)/g, '({ execFile: () => {} })');
            contents = contents.replace(/eval\s*\(\s*['"`]require\s*\(\s*['"`]connect-history-api-fallback['"`]\s*\)['"`]\s*\)/g, '(() => (req, res, next) => next())');
            contents = contents.replace(/eval\s*\(\s*['"`]require\s*\(\s*['"`]http-proxy-middleware['"`]\s*\)['"`]\s*\)/g, '({ createProxyMiddleware: () => (req, res, next) => next() })');
            contents = contents.replace(/eval\s*\(\s*['"`]require\s*\(\s*['"`]mime-types['"`]\s*\)['"`]\s*\)/g, '({ contentType: () => "text/plain" })');
            contents = contents.replace(/eval\s*\(\s*['"`]require\s*\(\s*['"`]ms['"`]\s*\)['"`]\s*\)/g, 'globalThis.__ms_shim__');
            contents = contents.replace(/eval\s*\(\s*['"`]require\s*\(\s*['"`]nanoid['"`]\s*\)['"`]\s*\)/g, '({ nanoid: (size = 21) => crypto.randomUUID().replace(/-/g, "").slice(0, size) })');
            contents = contents.replace(/eval\s*\(\s*['"`]require\s*\(\s*['"`]@maxmind\/geoip2-node['"`]\s*\)['"`]\s*\)/g, '({ Reader: { openBuffer: () => ({ country: () => null, asn: () => null }) } })');
            contents = contents.replace(/eval\s*\(\s*["'`]require\s*\(\s*['"`]stream\/promises['"`]\s*\)["'`]\s*\)/g, 'globalThis.__stream_promises_shim__');

            contents = contents.replace(/const\s+isNode\s*=\s*eval\s*\(\s*`typeof\s+process\s*!==\s*"undefined"`\s*\)/g, 'const isNode = false');
            contents = contents.replace(/const\s+isSurge\s*=\s*typeof\s+\$httpClient\s*!==\s*['"]undefined['"]\s*&&\s*!isLoon\s*;/g, 'const isSurge = true;');

            if (id.includes('vendor/express.js')) {
                expressFileSeen = true;
                const before = contents;
                if (!contents.includes('__SUB_STORE_WORKERS_PATCH__REQUEST_DONE_DISPATCH__')) {
                    contents = contents.replace(
                        'const handlers = [];',
                        `// __SUB_STORE_WORKERS_PATCH__REQUEST_DONE_DISPATCH__
const handlers = [];

function __emitDone__(requestId, response) {
    const activeContext = globalThis.__substore_get_active_context__?.();
    if (activeContext && (!requestId || activeContext.requestId === requestId) && typeof activeContext.done === 'function') {
        activeContext.done(response);
        return;
    }
    const context = requestId ? globalThis.__substore_get_context_by_id__?.(requestId) : null;
    if (context && typeof context.done === 'function') {
        context.done(response);
        return;
    }
    if (typeof globalThis.$done === 'function') {
        globalThis.$done(response);
    }
}`,
                    );
                    contents = contents.replace(
                        'const req = {',
                        `const req = {
                __requestId: request.__requestId,`,
                    );
                    contents = contents.replace(
                        'const res = Response();',
                        'const res = Response(req.__requestId);',
                    );
                    contents = contents.replace(
                        'function Response() {',
                        'function Response(requestId) {',
                    );
                    contents = contents.replace(
                        '$done(response);',
                        '__emitDone__(requestId, response);',
                    );
                    contents = contents.replace(
                        `$done({
                        response,
                    });`,
                        `__emitDone__(requestId, {
                        response,
                    });`,
                    );
                }
                contents = contents.replace(
                    /app\.start\s*=\s*\(\)\s*=>\s*\{\s*dispatch\s*\(\s*\$request\s*\)\s*;\s*\}/g,
                    `app.start = () => {
                        // __SUB_STORE_WORKERS_PATCH__DISPATCH_EXPORT__
                        globalThis.__substore_dispatch__ = dispatch;
                    }`,
                );
                if (contents !== before) {
                    expressPatchApplied += 1;
                    if (!contents.includes('__SUB_STORE_WORKERS_PATCH__DISPATCH_EXPORT__')) {
                        this.error('[sub-store-transform] express.js 补丁自检失败：缺少 marker');
                    }
                    if (!contents.includes('__SUB_STORE_WORKERS_PATCH__REQUEST_DONE_DISPATCH__')) {
                        this.error('[sub-store-transform] express.js 请求级 done 补丁自检失败：缺少 marker');
                    }
                } else {
                    this.error('[sub-store-transform] express.js 补丁未应用：未命中 app.start/dispatch($request) 片段');
                }
            }

            if (id.includes('vendor/open-api.js')) {
                openApiFileSeen = true;
                const beforeOpenApi = contents;

                const needsIsNodePatch = beforeOpenApi.includes('const isNode = eval(`typeof process');
                if (needsIsNodePatch && !contents.includes('const isNode = false')) {
                    this.error('[sub-store-transform] open-api.js 环境检测补丁未生效：isNode 仍可能触发 eval()');
                }
                const needsIsSurgePatch = beforeOpenApi.includes('const isSurge = typeof $httpClient');
                if (needsIsSurgePatch && !contents.includes('const isSurge = true;')) {
                    this.error('[sub-store-transform] open-api.js 环境检测补丁未生效：isSurge 未被固定为 true');
                }

                if (contents.includes('export class OpenAPI')) {
                    contents = contents.replace(
                        'export class OpenAPI',
                        `// 获取当前请求的缓存（请求级隔离）
// __SUB_STORE_WORKERS_PATCH__REQUEST_CACHE_ISOLATION__
function __getRequestCache__() {
    const context = globalThis.__substore_get_active_context__?.();
    if (!context) return {};
    if (!context.cache) context.cache = {};
    return context.cache;
}

function __setRequestCache__(key, value) {
    const context = globalThis.__substore_get_active_context__?.();
    if (!context) return;
    const cache = context.cache || (context.cache = {});
    cache[key] = value;
}

export class OpenAPI`,
                    );
                } else {
                    this.error('[sub-store-transform] open-api.js 补丁未应用：未找到 export class OpenAPI');
                }

                contents = contents.replace(/this\.cache\s*=\s*JSON\.parse\s*\(\s*\$persistentStore\.read\s*\(\s*this\.name\s*\)\s*\|\|\s*'{}'\s*\)/g, 'this.cache = __getRequestCache__()');
                contents = contents.replace(/const\s+data\s*=\s*JSON\.stringify\s*\(\s*this\.cache\s*,\s*null\s*,\s*2\s*\)/g, 'const data = JSON.stringify(__getRequestCache__(), null, 2)');
                contents = contents.replace(/this\.cache\[key\]\s*=\s*data;/g, '__setRequestCache__(key, data);');
                contents = contents.replace(/return\s+this\.cache\[key\];/g, 'return __getRequestCache__()[key];');
                contents = contents.replace(/delete\s+this\.cache\[key\];/g, 'const __cache__ = __getRequestCache__(); delete __cache__[key];');

                if (contents !== beforeOpenApi) openApiPatchApplied += 1;

                const requiredMarkers = [
                    '__SUB_STORE_WORKERS_PATCH__REQUEST_CACHE_ISOLATION__',
                    'this.cache = __getRequestCache__()',
                    'const data = JSON.stringify(__getRequestCache__(), null, 2)',
                    '__setRequestCache__(key, data);',
                    'return __getRequestCache__()[key];',
                    'const __cache__ = __getRequestCache__(); delete __cache__[key];',
                ];
                const missing = requiredMarkers.filter((m) => !contents.includes(m));
                if (missing.length > 0) {
                    this.error(`[sub-store-transform] open-api.js 补丁自检失败：缺少片段: ${missing.join(', ')}`);
                }
            }

            if (id.includes('sub-store/backend/src/utils/download.js')) {
                downloadFileSeen = true;
                if (!contents.includes('__SUB_STORE_WORKERS_PATCH__INFLIGHT_TASKS__')) {
                    const startMarker = 'export default async function download';
                    const endMarker = 'export async function downloadFile';
                    if (!contents.includes('const tasks = new Map();')) {
                        this.error('[sub-store-transform] download.js 结构已变化，补丁未应用：缺少 tasks 定义');
                    }
                    contents = contents.replace('const tasks = new Map();', `// __SUB_STORE_WORKERS_PATCH__INFLIGHT_TASKS__
const tasks = {
    has: () => false,
    get: () => undefined,
    set: () => {},
    delete: () => {},
};`);
                    const startIdx = contents.indexOf(startMarker);
                    const endIdx = contents.indexOf(endMarker);
                    if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
                        this.error(`[sub-store-transform] 无法定位 download() 的边界，补丁未应用：${id}`);
                    }
                    const before = contents.slice(0, startIdx);
                    const chunk = contents.slice(startIdx, endIdx);
                    const after = contents.slice(endIdx);
                    const requiredNeedles = ['tasks.has(id)', 'tasks.set(id, result)', 'const id = hex_md5('];
                    const missing = requiredNeedles.filter((n) => !chunk.includes(n));
                    if (missing.length > 0) {
                        this.error(`[sub-store-transform] download.js 结构已变化，补丁未应用：缺少关键片段: ${missing.join(', ')}`);
                    }
                    let patchedChunk = chunk.replace(startMarker, 'async function __download_impl__');
                    const wrapper = `export default async function download(
    rawUrl = '',
    ua,
    timeout,
    customProxy,
    skipCustomCache,
    awaitCustomCache,
    noCache,
    preprocess,
) {
    let $arguments = {};
    try {
        let url = String(rawUrl).replace(/#noFlow$/, '');
        const rawArgs = url.split('#');
        url = url.split('#')[0];
        if (rawArgs.length > 1) {
            try {
                $arguments = JSON.parse(decodeURIComponent(rawArgs[1]));
            } catch (e) {
                for (const pair of rawArgs[1].split('&')) {
                    const key = pair.split('=')[0];
                    const value = pair.split('=')[1];
                    $arguments[key] = value == null || value === '' ? true : decodeURIComponent(value);
                }
            }
        }
    } catch (e) {
        $arguments = {};
    }

    if (noCache || ($arguments && $arguments.noCache)) {
        return await __download_impl__(rawUrl, ua, timeout, customProxy, skipCustomCache, awaitCustomCache, noCache, preprocess);
    }

    const context = globalThis.__substore_get_active_context__?.();
    const scope = context?.user?.id ?? context?.requestId ?? '';
    const inflightKey = String(scope) + '::' + String(ua || '') + '::' + String(rawUrl) + '::' + (preprocess ? '1' : '0');
    if (!globalThis.__sub_store_workers_inflight_tasks__) {
        globalThis.__sub_store_workers_inflight_tasks__ = new Map();
    }
    if (globalThis.__sub_store_workers_inflight_tasks__.has(inflightKey)) {
        return await globalThis.__sub_store_workers_inflight_tasks__.get(inflightKey);
    }
    const p = (async () => {
        try {
            return await __download_impl__(rawUrl, ua, timeout, customProxy, skipCustomCache, awaitCustomCache, noCache, preprocess);
        } finally {
            globalThis.__sub_store_workers_inflight_tasks__.delete(inflightKey);
        }
    })();
    globalThis.__sub_store_workers_inflight_tasks__.set(inflightKey, p);
    return await p;
}
`;
                    patchedChunk = wrapper + '\n' + patchedChunk;
                    if (!patchedChunk.includes('export default async function download(')) {
                        this.error('[sub-store-transform] download.js 补丁自检失败：wrapper 未注入');
                    }
                    downloadPatchApplied += 1;
                    contents = before + patchedChunk + after;
                    if (!contents.includes('__SUB_STORE_WORKERS_PATCH__INFLIGHT_TASKS__')) {
                        this.error('[sub-store-transform] download.js 补丁自检失败：缺少 marker');
                    }
                }
            }

            if (id.includes('sub-store/backend/src/core/proxy-utils/processors/index.js')) {
                processorsFileSeen = true;
                if (!contents.includes('__SUB_STORE_WORKERS_PATCH__QUICKJS_CREATE_DYNAMIC_FUNCTION__')) {
                    const startMarker = 'function createDynamicFunction(name, script, $arguments, $options) {';
                    const startIdx = contents.indexOf(startMarker);
                    if (startIdx === -1) {
                        this.error('[sub-store-transform] processors/index.js 补丁未应用：未找到 createDynamicFunction 定义');
                    }
                    const before = contents.slice(0, startIdx);
                    const patched = `function createDynamicFunction(name, script, $arguments, $options) {
    // __SUB_STORE_WORKERS_PATCH__QUICKJS_CREATE_DYNAMIC_FUNCTION__
    const flowUtils = {
        getFlowField,
        getFlowHeaders,
        parseFlowHeaders,
        flowTransfer,
        validCheck,
        getRmainingDays,
        normalizeFlowHeader,
    };

    const factory = globalThis.__substore_workers_createDynamicFunction__;
    if (typeof factory !== 'function') {
        throw new Error('[Sub-Store Workers] QuickJS script engine not installed');
    }

    return factory({
        name,
        script,
        $arguments,
        $options,
        $substore: $,
        lodash,
        ProxyUtils,
        scriptResourceCache,
        flowUtils,
        produceArtifact,
    });
}
`;
                    processorsPatchApplied += 1;
                    contents = before + patched;
                    if (!contents.includes('__SUB_STORE_WORKERS_PATCH__QUICKJS_CREATE_DYNAMIC_FUNCTION__')) {
                        this.error('[sub-store-transform] processors/index.js 补丁自检失败：缺少 marker');
                    }
                }
            }

            if (id.includes('sub-store/backend/src/core/app.js')) {
                openApiDebugFileSeen = true;
                if (!contents.includes('__SUB_STORE_WORKERS_PATCH__OPENAPI_DEBUG__')) {
                    const beforeApp = contents;
                    contents = contents.replace(
                        "const $ = new OpenAPI('sub-store');",
                        "const $ = new OpenAPI('sub-store', (process.env.DEBUG === 'true' || process.env.DEBUG === true)); /* __SUB_STORE_WORKERS_PATCH__OPENAPI_DEBUG__ */",
                    );
                    if (contents !== beforeApp) {
                        openApiDebugPatchApplied += 1;
                    } else {
                        this.error('[sub-store-transform] core/app.js debug 补丁未应用：未命中 OpenAPI 初始化行');
                    }
                }
            }

            if (contents !== code) {
                return { code: contents, map: null };
            }
            return null;
        },

        buildEnd() {
            if (!downloadFileSeen) return;
            if (downloadPatchApplied !== 1) this.error(`[sub-store-transform] download.js in-flight 补丁未正确应用：期望 1 次，实际 ${downloadPatchApplied} 次`);
            if (expressFileSeen && expressPatchApplied !== 1) this.error(`[sub-store-transform] express.js 补丁未正确应用：期望 1 次，实际 ${expressPatchApplied} 次`);
            if (openApiFileSeen && openApiPatchApplied !== 1) this.error(`[sub-store-transform] open-api.js 补丁未正确应用：期望 1 次，实际 ${openApiPatchApplied} 次`);
            if (processorsFileSeen && processorsPatchApplied !== 1) this.error(`[sub-store-transform] processors/index.js 补丁未正确应用：期望 1 次，实际 ${processorsPatchApplied} 次`);
            if (openApiDebugFileSeen && openApiDebugPatchApplied !== 1) this.error(`[sub-store-transform] core/app.js OpenAPI debug 补丁未正确应用：期望 1 次，实际 ${openApiDebugPatchApplied} 次`);
        },
    };
}
