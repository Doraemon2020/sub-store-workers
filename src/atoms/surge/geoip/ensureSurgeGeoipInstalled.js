/**
 * L4 Atom
 *
 * Ensure Surge-like GeoIP utilities exist:
 * - $utils.geoip(ip)
 * - $utils.ipasn(ip)
 * - $utils.ipaso(ip)
 */

import { ensureGeoDbLoaded } from './ensureGeoDbLoaded.js';
import { installSurgeUtilsGeoip } from './installSurgeUtilsGeoip.js';

export async function ensureSurgeGeoipInstalled(env, { requestId } = {}) {
    const cache = await ensureGeoDbLoaded(env, { requestId });
    installSurgeUtilsGeoip({
        countryReader: cache.countryReader,
        asnReader: cache.asnReader,
        requestId,
    });
}
