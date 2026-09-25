-- One row per answer. The client id makes resends harmless (INSERT OR IGNORE).
CREATE TABLE IF NOT EXISTS responses (
  id      TEXT PRIMARY KEY,
  ts      TEXT NOT NULL,              -- ISO date, set by the Worker
  email   TEXT NOT NULL,              -- lower-cased
  pillar  INTEGER NOT NULL CHECK (pillar BETWEEN 1 AND 4),
  answer  TEXT NOT NULL,
  synced  INTEGER NOT NULL DEFAULT 0  -- 1 once copied to the Google Sheet
);
CREATE INDEX IF NOT EXISTS idx_responses_email ON responses (email);
CREATE INDEX IF NOT EXISTS idx_responses_unsynced ON responses (synced, ts) WHERE synced = 0;
