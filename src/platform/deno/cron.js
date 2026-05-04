import { handleCron } from '../../orchestration/commander/httpCommander.js';
import { initLogger, warn, error as logError } from '../../utils/logger.js';
import { createDenoRequestContext } from './runtime/context/createDenoRequestContext.js';

const CRON_NAME = 'sub-store-cron';
const CRON_SCHEDULE = '0 */6 * * *';

export function registerDenoCron({ env = {}, pool, assetBaseDir, now = () => Date.now() } = {}) {
    if (typeof Deno.cron !== 'function') {
        initLogger(env);
        warn('[Deno] Deno.cron unavailable; cron registration skipped');
        return { registered: false, reason: 'deno-cron-unavailable' };
    }

    const { entryGateway } = createDenoRequestContext({ env, pool, assetBaseDir, now });

    Deno.cron(CRON_NAME, CRON_SCHEDULE, async () => {
        initLogger(env);

        try {
            await handleCron({ event: null, env, ctx: null, entryGateway });
        } catch (err) {
            logError('[Deno] [cron] unhandled error:', err?.stack || err?.message || err);
            throw err;
        }
    });

    return { registered: true, name: CRON_NAME, schedule: CRON_SCHEDULE };
}
