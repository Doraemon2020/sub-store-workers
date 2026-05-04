export function mergeSettingsWithDefaults({ defaultSettings, dbSettings }) {
    let needsSave = false;
    const merged = { ...defaultSettings };

    for (const key of Object.keys(defaultSettings)) {
        if (key in dbSettings) {
            merged[key] = dbSettings[key];
        } else {
            needsSave = true;
        }
    }

    for (const key of Object.keys(dbSettings)) {
        if (!(key in defaultSettings)) {
            merged[key] = dbSettings[key];
        }
    }

    return { merged, needsSave };
}
