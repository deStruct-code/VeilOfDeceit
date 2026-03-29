import {Pool} from "pg";
import {env} from "./env";

export const db = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.NODE_ENV === "production" ? {rejectUnauthorized: false} : false,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
});

db.on("error", (err) => {
    console.error("[pg] Unexpected pool error:", err.message);
});

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

CREATE TABLE IF NOT EXISTS users (
  id          SERIAL      PRIMARY KEY,
  google_id   TEXT        NOT NULL UNIQUE,
  email       TEXT        NOT NULL,
  name        TEXT        NOT NULL,
  avatar      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT        PRIMARY KEY,
  user_id     INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '30 days'
);

CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);
`;

export async function runMigration() {
    console.log("Current Directory:", process.cwd());
    await db.query(SCHEMA_SQL);
    console.log("[db] Migration applied");
}
