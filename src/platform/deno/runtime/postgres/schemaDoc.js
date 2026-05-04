/**
 * Deno platform runtime doc
 *
 * Deno/Postgres schema 契约：
 * - 作为 Deno runtime 的持久化真相源
 * - 用于承接 IndexDomainGateway / UserDomainGateway / MmdbDomainGateway
 * - 迁移脚本与 ensurePgSchema 必须与此文档保持一致
 */

export const postgresSchemaDoc = Object.freeze({
    engine: 'postgresql',
    domains: {
        index: {
            tables: ['users', 'captchas', 'system_settings', 'mmdb_meta', 'mmdb_chunks'],
            requiredIndexes: ['idx_users_role', 'idx_users_path', 'idx_captchas_expires', 'idx_mmdb_chunks_name'],
            notes: [
                'users 表承接 dashboard admin / auth / path routing 的全局索引状态',
                'captchas 表承接 dashboard captcha 状态，非 DO 运行时建议配合锁使用',
                'system_settings 必须保留单行语义（id=1）',
                'mmdb_meta + mmdb_chunks 共同组成唯一真相源，不允许使用本地 seed file 作为生产真相源',
            ],
        },
        user: {
            tables: ['user_store', 'download_access_log'],
            requiredIndexes: ['idx_download_access_log_user_id_id'],
            notes: [
                '所有 user_store / access_log 写操作都必须按 user_id 串行',
                'download_access_log 保留 user_id 维度 retention 语义',
            ],
        },
    },
    migrationRules: {
        idempotent: true,
        splitByDomain: ['index', 'user'],
        runBeforeTraffic: true,
        preferredTrigger: 'pre-deploy command or explicit migration task',
    },
});
