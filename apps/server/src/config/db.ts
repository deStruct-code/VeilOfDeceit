import { Pool } from 'pg';
import { env } from './env';

export const db = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

db.on('error', (err) => {
  console.error('[pg] Unexpected pool error:', err.message);
});

// SQL встроен напрямую — tsc не копирует .sql файлы в dist
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS games (
  id          CHAR(6)     PRIMARY KEY,
  state       JSONB       NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS games_phase_idx
  ON games ((state->>'phase'));

CREATE TABLE IF NOT EXISTS game_results (
  id          SERIAL      PRIMARY KEY,
  game_id     CHAR(6)     NOT NULL,
  winner      TEXT,
  turns       INT,
  ended_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

export async function runMigration() {
  await db.query(SCHEMA_SQL);
  console.log('[db] Migration applied');
}