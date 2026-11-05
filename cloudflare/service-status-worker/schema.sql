PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS probe_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id TEXT NOT NULL,
  checked_at INTEGER NOT NULL,
  latency_ms INTEGER,
  up INTEGER NOT NULL CHECK (up IN (0,1)),
  http_status INTEGER,
  error_code TEXT,
  health_status TEXT NOT NULL,
  status_indicator TEXT,
  status_summary TEXT,
  status_api_available INTEGER NOT NULL DEFAULT 0 CHECK (status_api_available IN (0,1))
);

CREATE INDEX IF NOT EXISTS idx_probe_service_time
  ON probe_results(service_id, checked_at);

CREATE INDEX IF NOT EXISTS idx_probe_checked_at
  ON probe_results(checked_at);

CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  ended_at INTEGER,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'http_probe'
);

CREATE INDEX IF NOT EXISTS idx_incidents_started
  ON incidents(started_at);

CREATE INDEX IF NOT EXISTS idx_incidents_active
  ON incidents(ended_at, service_id);

CREATE TABLE IF NOT EXISTS service_state (
  service_id TEXT PRIMARY KEY,
  consecutive_bad INTEGER NOT NULL DEFAULT 0,
  consecutive_good INTEGER NOT NULL DEFAULT 0,
  current_incident_id TEXT,
  last_status TEXT NOT NULL DEFAULT 'unknown',
  updated_at INTEGER NOT NULL
);
