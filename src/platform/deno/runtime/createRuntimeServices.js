import { getSharedPgPool } from './postgres/createPgPool.js';
import { createDenoIndexGateway } from './indexGateway.js';
import { createDenoUserGateway } from './userGateway.js';
import { createDenoMmdbGateway } from './mmdbGateway.js';

export function createRuntimeServices({ pool = getSharedPgPool(), now = () => Date.now() } = {}) {
    return {
        indexGateway: createDenoIndexGateway({ pool, now }),
        userGateway: createDenoUserGateway({ pool, now }),
        mmdbGateway: createDenoMmdbGateway({ pool, now }),
    };
}
