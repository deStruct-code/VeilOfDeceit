-- Veil of Deceit — database schema
-- Run once on a fresh PostgreSQL instance (Railway Postgres)

CREATE TABLE IF NOT EXISTS games (
  id          CHAR(6)     PRIMARY KEY,
  state       JSONB       NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- fast lookup for "is this game finished?"
CREATE INDEX IF NOT EXISTS games_phase_idx
  ON games ((state->>'phase'));

CREATE TABLE IF NOT EXISTS game_results (
  id          SERIAL      PRIMARY KEY,
  game_id     CHAR(6)     NOT NULL,
  winner      TEXT,                        -- 'players' | 'boss'
  turns       INT,
  ended_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
