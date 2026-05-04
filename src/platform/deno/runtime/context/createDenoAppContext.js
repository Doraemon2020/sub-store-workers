import { createRuntimeServices } from '../createRuntimeServices.js';
import { createUserDataStore } from '../postgres/createUserDataStore.js';

export function createDenoAppContext({ pool, now = () => Date.now() }) {
    const services = createRuntimeServices({ pool, now });
    return {
        services,
        userDataStore: createUserDataStore({ pool, now }),
    };
}
