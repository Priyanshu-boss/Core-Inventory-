-- ============================================================
-- Inventory Management System — Database Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  sku         TEXT    NOT NULL UNIQUE,
  name        TEXT    NOT NULL,
  category    TEXT    NOT NULL DEFAULT 'General',
  uom         TEXT    NOT NULL DEFAULT 'unit',
  reorder_point INTEGER NOT NULL DEFAULT 10,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  email           TEXT    NOT NULL UNIQUE,
  password_hash   TEXT    NOT NULL,
  otp             TEXT,
  otp_expiry      TEXT,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS locations (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL UNIQUE,
  type        TEXT    NOT NULL CHECK(type IN ('internal','vendor','customer','virtual')),
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS documents (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  type          TEXT    NOT NULL CHECK(type IN ('receipt','delivery','transfer','adjustment')),
  status        TEXT    NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','done')),
  reference     TEXT,
  notes         TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  validated_at  TEXT
);

CREATE TABLE IF NOT EXISTS document_lines (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id   INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  product_id    INTEGER NOT NULL REFERENCES products(id),
  from_location_id INTEGER NOT NULL REFERENCES locations(id),
  to_location_id   INTEGER NOT NULL REFERENCES locations(id),
  quantity      REAL    NOT NULL CHECK(quantity > 0)
);

CREATE TABLE IF NOT EXISTS stock_moves (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id     INTEGER NOT NULL REFERENCES documents(id),
  product_id      INTEGER NOT NULL REFERENCES products(id),
  from_location_id INTEGER NOT NULL REFERENCES locations(id),
  to_location_id   INTEGER NOT NULL REFERENCES locations(id),
  quantity        REAL    NOT NULL,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_moves_product   ON stock_moves(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_moves_from_loc  ON stock_moves(from_location_id);
CREATE INDEX IF NOT EXISTS idx_stock_moves_to_loc    ON stock_moves(to_location_id);
CREATE INDEX IF NOT EXISTS idx_stock_moves_doc       ON stock_moves(document_id);
CREATE INDEX IF NOT EXISTS idx_document_lines_doc    ON document_lines(document_id);
CREATE INDEX IF NOT EXISTS idx_documents_type_status ON documents(type, status);
