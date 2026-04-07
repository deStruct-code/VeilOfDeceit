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
  game_id     CHAR(6)     NOT NULL REFERENCES games(id) ON DELETE CASCADE,
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

-- Лобби-комнаты (заменяет in-memory issuedRoomCodes + rooms)
CREATE TABLE IF NOT EXISTS rooms (
  code        CHAR(6)     PRIMARY KEY,
  status      TEXT        NOT NULL DEFAULT 'pending',  -- pending | open | started
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Слоты игроков в комнате
CREATE TABLE IF NOT EXISTS room_players (
  room_code   CHAR(6)     NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
  player_id   TEXT        NOT NULL,
  slot        TEXT        NOT NULL,  -- 'player-1' | 'player-2'
  player_name TEXT        NOT NULL DEFAULT 'Shadow',
  card_back   TEXT        NOT NULL DEFAULT 'veil-mandala',
  user_id     INT         REFERENCES users(id) ON DELETE SET NULL,  -- null если гость
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (room_code, player_id)
);

CREATE INDEX IF NOT EXISTS room_players_room_idx ON room_players (room_code);
CREATE INDEX IF NOT EXISTS room_players_user_idx ON room_players (user_id);

-- Итог игры
CREATE TABLE IF NOT EXISTS game_results (
  id          SERIAL      PRIMARY KEY,
  game_id     CHAR(6)     NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  outcome     TEXT        NOT NULL,  -- 'victory' | 'defeat'
  turns       INT         NOT NULL,
  ended_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Результат каждого участника в игре
-- outcome: 'win' | 'loss' | 'solo_win' | 'solo_loss'
CREATE TABLE IF NOT EXISTS player_results (
  id          SERIAL      PRIMARY KEY,
  game_id     CHAR(6)     NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id     INT         REFERENCES users(id) ON DELETE SET NULL,
  player_id   TEXT        NOT NULL,  -- локальный id (всегда есть, даже у гостей)
  player_name TEXT        NOT NULL,
  slot        TEXT        NOT NULL,  -- 'player-1' | 'player-2'
  outcome     TEXT        NOT NULL,  -- 'win' | 'loss'
  hp_left     INT         NOT NULL DEFAULT 0,
  ended_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS player_results_user_idx  ON player_results (user_id);
CREATE INDEX IF NOT EXISTS player_results_game_idx  ON player_results (game_id);
`;

export async function runMigration() {
    console.log("Current Directory:", process.cwd());
    await db.query(SCHEMA_SQL);
    console.log("[db] Migration applied");
}
