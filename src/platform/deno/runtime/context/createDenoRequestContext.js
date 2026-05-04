import { createIndexEntryContext, handleIndexEntry } from '../../IndexEntry.js';
import { createUserEntryContext, handleUserEntry } from '../../UserEntry.js';
import { createEntryGatewayForDeno } from '../createEntryGateway.js';
import { createDashboardAssetFetcher } from '../assets/createDashboardAssetFetcher.js';

export function createDenoRequestContext({ env = {}, pool, assetBaseDir, now = () => Date.now() }) {
    let indexContextPromise = null;
    let userContextPromise = null;

    const ensureIndexContext = async () => {
        if (!indexContextPromise) {
            indexContextPromise = createIndexEntryContext({ env, pool, now });
        }
        return await indexContextPromise;
    };

    const ensureUserContext = async () => {
        if (!userContextPromise) {
            userContextPromise = createUserEntryContext({ env, pool, now });
        }
        return await userContextPromise;
    };

    const entryGateway = createEntryGatewayForDeno({
        ensureIndexContext: async () => {
            const ctx = await ensureIndexContext();
            return { ...ctx, handleIndexEntry };
        },
        ensureUserContext: async () => {
            const ctx = await ensureUserContext();
            return { ...ctx, handleUserEntry };
        },
        fetchAsset: createDashboardAssetFetcher({ baseDir: assetBaseDir }),
    });

    return {
        ensureIndexContext,
        ensureUserContext,
        entryGateway,
    };
}
