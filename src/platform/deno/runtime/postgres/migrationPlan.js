export const INDEX_SCHEMA_STATEMENTS = [
    `CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      path TEXT UNIQUE NOT NULL,
      notes TEXT DEFAULT '',
      token_version INTEGER DEFAULT 0,
      avatar_url TEXT DEFAULT '',
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL
    )`,
    'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
    'CREATE INDEX IF NOT EXISTS idx_users_path ON users(path)',
    `CREATE TABLE IF NOT EXISTS captchas (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      attempts INTEGER DEFAULT 0,
      expires_at BIGINT NOT NULL
    )`,
    'CREATE INDEX IF NOT EXISTS idx_captchas_expires ON captchas(expires_at)',
    `CREATE TABLE IF NOT EXISTS system_settings (
      id INTEGER PRIMARY KEY,
      settings TEXT DEFAULT '{}',
      updated_at BIGINT NOT NULL
    )`,
    `INSERT INTO system_settings (id, settings, updated_at)
     VALUES (1, '{}', 0)
     ON CONFLICT (id) DO NOTHING`,
    `CREATE TABLE IF NOT EXISTS mmdb_meta (
      name TEXT PRIMARY KEY,
      etag TEXT,
      updated_at BIGINT NOT NULL,
      source_url TEXT,
      build_epoch BIGINT,
      total_size BIGINT NOT NULL,
      chunk_size INTEGER NOT NULL,
      chunks INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS mmdb_chunks (
      name TEXT NOT NULL,
      idx INTEGER NOT NULL,
      data BYTEA NOT NULL,
      PRIMARY KEY (name, idx)
    )`,
    'CREATE INDEX IF NOT EXISTS idx_mmdb_chunks_name ON mmdb_chunks(name)',
];

export const USER_SCHEMA_STATEMENTS = [
    `CREATE TABLE IF NOT EXISTS user_store (
      user_id BIGINT NOT NULL,
      key TEXT NOT NULL,
      value TEXT,
      updated_at BIGINT NOT NULL,
      PRIMARY KEY (user_id, key)
    )`,
    `CREATE TABLE IF NOT EXISTS download_access_log (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL,
      ts BIGINT NOT NULL,
      kind TEXT NOT NULL,
      name TEXT NOT NULL,
      target TEXT,
      status INTEGER,
      path TEXT,
      ua TEXT,
      ip TEXT
    )`,
    'CREATE INDEX IF NOT EXISTS idx_download_access_log_user_id_id ON download_access_log(user_id, id DESC)',
];

export const DENO_POSTGRES_MIGRATION_PLAN = Object.freeze({
    index: INDEX_SCHEMA_STATEMENTS,
    user: USER_SCHEMA_STATEMENTS,
});
