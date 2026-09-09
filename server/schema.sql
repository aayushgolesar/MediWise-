-- MediWise Database Schema
-- SQLite-compatible; field types chosen for easy PostgreSQL migration.

-- ─────────────────────────────────────────────
-- GLOBAL TABLES
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id                  TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  email               TEXT UNIQUE NOT NULL,
  phone               TEXT NOT NULL,
  password_hash       TEXT NOT NULL,
  role                TEXT NOT NULL CHECK (role IN ('patient','pharmacist','admin','oem')),
  abha_id             TEXT,
  pharmacy_hub_name   TEXT,
  pharmacist_reg_no   TEXT,
  cdsco_license       TEXT,
  avatar_url          TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tenant_hubs (
  tenant_id     TEXT PRIMARY KEY,
  hub_name      TEXT NOT NULL,
  schema_name   TEXT NOT NULL UNIQUE,
  city          TEXT NOT NULL,
  locality      TEXT NOT NULL,
  db_latency_ms INTEGER NOT NULL DEFAULT 0,
  active_orders INTEGER NOT NULL DEFAULT 0,
  storage_mb    INTEGER NOT NULL DEFAULT 0,
  cdsco_license TEXT NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('Active','Degraded','Syncing','Maintenance'))
);

-- ─────────────────────────────────────────────
-- MEDICINES & OFFERS
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS medicines (
  id                     TEXT PRIMARY KEY,
  brand_name             TEXT NOT NULL,
  generic_name           TEXT NOT NULL,
  strength               TEXT NOT NULL,
  dosage_form            TEXT NOT NULL,
  therapeutic_category   TEXT NOT NULL,
  category               TEXT NOT NULL,
  schedule               TEXT NOT NULL,
  mrp_reference          REAL NOT NULL,
  starting_price         REAL NOT NULL,
  discount_percent       INTEGER NOT NULL,
  cdsco_approved         INTEGER NOT NULL DEFAULT 1,
  bioequivalent_verified INTEGER NOT NULL DEFAULT 1,
  bioequivalent_to       TEXT NOT NULL DEFAULT '',
  in_stock               INTEGER NOT NULL DEFAULT 1,
  stock_count            INTEGER NOT NULL DEFAULT 0,
  hub_count              INTEGER NOT NULL DEFAULT 0,
  indications            TEXT NOT NULL DEFAULT '[]',  -- JSON array
  description            TEXT NOT NULL DEFAULT '',
  pack_options           TEXT NOT NULL DEFAULT '[]'   -- JSON array
);

CREATE TABLE IF NOT EXISTS pharmacy_offers (
  id                TEXT PRIMARY KEY,
  medicine_id       TEXT NOT NULL REFERENCES medicines(id),
  pharmacy_name     TEXT NOT NULL,
  hub_id            TEXT NOT NULL,
  locality          TEXT NOT NULL,
  distance_km       REAL NOT NULL,
  sla_minutes       INTEGER NOT NULL,
  mrp               REAL NOT NULL,
  discounted_price  REAL NOT NULL,
  discount_percent  INTEGER NOT NULL,
  in_stock          INTEGER NOT NULL DEFAULT 1,
  stock_units       INTEGER NOT NULL DEFAULT 0,
  batch_number      TEXT NOT NULL,
  expiry_date       TEXT NOT NULL,
  hologram_verified INTEGER NOT NULL DEFAULT 1,
  license_number    TEXT NOT NULL,
  rating            REAL NOT NULL DEFAULT 0,
  review_count      INTEGER NOT NULL DEFAULT 0,
  savings           REAL NOT NULL DEFAULT 0,
  is_recommended    INTEGER NOT NULL DEFAULT 0
);

-- ─────────────────────────────────────────────
-- PATIENTS & PRESCRIPTIONS
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS patients (
  id       TEXT PRIMARY KEY,
  user_id  TEXT REFERENCES users(id),
  name     TEXT NOT NULL,
  age      INTEGER NOT NULL,
  gender   TEXT NOT NULL CHECK (gender IN ('Male','Female','Other')),
  relation TEXT NOT NULL,
  abha_id  TEXT NOT NULL,
  phone    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS prescription_audits (
  rx_id                     TEXT PRIMARY KEY,
  order_id                  TEXT,
  file_name                 TEXT NOT NULL,
  upload_date               TEXT NOT NULL,
  doctor_name               TEXT NOT NULL,
  doctor_reg_no             TEXT NOT NULL,
  hospital_clinic           TEXT NOT NULL,
  prescribed_for            TEXT NOT NULL,
  drug_name                 TEXT NOT NULL DEFAULT '',
  dosage                    TEXT NOT NULL,
  duration_days             INTEGER NOT NULL,
  frequency                 TEXT NOT NULL,
  dispense_limit            INTEGER NOT NULL,
  ocr_verified              INTEGER NOT NULL DEFAULT 0,
  needs_pharmacist_review   INTEGER NOT NULL DEFAULT 0,
  confidence_json           TEXT NOT NULL DEFAULT '{}',
  schedule_category         TEXT NOT NULL
);

-- ─────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orders (
  order_id               TEXT PRIMARY KEY,
  placed_time            TEXT NOT NULL,
  delivery_eta           TEXT NOT NULL,
  delivery_otp           TEXT NOT NULL,
  status                 TEXT NOT NULL,
  -- customer
  customer_name          TEXT NOT NULL,
  customer_address       TEXT NOT NULL,
  customer_phone         TEXT NOT NULL,
  -- pharmacy
  pharmacy_name          TEXT NOT NULL,
  pharmacy_hub_id        TEXT NOT NULL,
  pharmacy_address       TEXT NOT NULL,
  pharmacy_license       TEXT NOT NULL,
  pharmacist_name        TEXT NOT NULL,
  pharmacist_reg         TEXT NOT NULL,
  -- courier
  courier_name           TEXT NOT NULL,
  courier_phone          TEXT NOT NULL,
  courier_rating         REAL NOT NULL,
  vehicle_number         TEXT NOT NULL,
  cold_chain_verified    INTEGER NOT NULL DEFAULT 0,
  current_distance_km    REAL NOT NULL DEFAULT 0,
  -- medicine
  medicine_name          TEXT NOT NULL,
  composition            TEXT NOT NULL,
  pack_size              INTEGER NOT NULL,
  batch_number           TEXT NOT NULL,
  seal_hash              TEXT NOT NULL,
  price                  REAL NOT NULL,
  -- financials
  item_total             REAL NOT NULL,
  packaging_tamper_fee   REAL NOT NULL,
  delivery_fee           REAL NOT NULL,
  platform_convenience   REAL NOT NULL,
  generic_savings        REAL NOT NULL,
  total_paid             REAL NOT NULL,
  escrow_status          TEXT NOT NULL DEFAULT 'Held in Escrow'
);

-- ─────────────────────────────────────────────
-- ADMIN OPERATIONS
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quarantine_items (
  id                   TEXT PRIMARY KEY,
  sku_name             TEXT NOT NULL,
  generic_composition  TEXT NOT NULL,
  hub_id               TEXT NOT NULL,
  hub_name             TEXT NOT NULL,
  locality             TEXT NOT NULL,
  reported_price       REAL NOT NULL,
  system_floor_price   REAL NOT NULL,
  discrepancy_percent  REAL NOT NULL,
  last_heartbeat_ago   TEXT NOT NULL,
  reason               TEXT NOT NULL,
  severity             TEXT NOT NULL CHECK (severity IN ('Critical','High','Medium','Low')),
  status               TEXT NOT NULL CHECK (status IN ('Quarantined','Under Review','Released'))
);

CREATE TABLE IF NOT EXISTS dispute_cases (
  case_id                  TEXT PRIMARY KEY,
  order_id                 TEXT NOT NULL,
  customer_name            TEXT NOT NULL,
  medicine_name            TEXT NOT NULL,
  dispute_type             TEXT NOT NULL,
  escrow_amount            REAL NOT NULL,
  customer_claim_photo_url TEXT NOT NULL,
  dispatch_baseline_url    TEXT NOT NULL,
  seal_barcode_expected    TEXT NOT NULL,
  seal_barcode_reported    TEXT NOT NULL,
  courier_gps_duration     TEXT NOT NULL,
  courier_shock_spike      TEXT NOT NULL,
  status                   TEXT NOT NULL DEFAULT 'Pending Triage'
);

CREATE TABLE IF NOT EXISTS reassignment_tasks (
  order_id           TEXT PRIMARY KEY,
  patient_name       TEXT NOT NULL,
  medicine_name      TEXT NOT NULL,
  original_hub       TEXT NOT NULL,
  time_remaining_sec INTEGER NOT NULL,
  total_timeout_sec  INTEGER NOT NULL,
  timeout_reason     TEXT NOT NULL,
  candidate_hubs     TEXT NOT NULL DEFAULT '[]'  -- JSON array
);

-- ─────────────────────────────────────────────
-- NOOR AI MODERATION LOG
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS noor_moderation_log (
  id              TEXT PRIMARY KEY,
  session_id      TEXT NOT NULL,
  patient_name    TEXT NOT NULL,
  user_prompt     TEXT NOT NULL,
  bot_response    TEXT NOT NULL,
  guardrail_fired INTEGER NOT NULL DEFAULT 0,
  risk_level      TEXT NOT NULL DEFAULT 'LOW',
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed        INTEGER NOT NULL DEFAULT 0
);

-- ─────────────────────────────────────────────
-- IMMUTABLE AUDIT LOG
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_log (
  id          TEXT PRIMARY KEY,
  event_type  TEXT NOT NULL,
  entity_id   TEXT NOT NULL,
  actor_id    TEXT,
  metadata    TEXT NOT NULL DEFAULT '{}',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─────────────────────────────────────────────
-- PAYMENTS & ESCROW
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payments (
  id                TEXT PRIMARY KEY,
  gateway_order_id  TEXT UNIQUE NOT NULL,
  order_id          TEXT NOT NULL,
  amount            REAL NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'INR',
  status            TEXT NOT NULL CHECK (status IN ('created','captured','failed','refunded')),
  payment_method    TEXT NOT NULL,
  gateway_payment_id TEXT,
  signature         TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tax_invoices (
  invoice_number    TEXT PRIMARY KEY,
  order_id          TEXT UNIQUE NOT NULL,
  invoice_date      TEXT NOT NULL,
  buyer_name        TEXT NOT NULL,
  buyer_address     TEXT NOT NULL,
  seller_hub        TEXT NOT NULL,
  seller_gstin      TEXT NOT NULL,
  seller_license    TEXT NOT NULL,
  hsn_sac_code      TEXT NOT NULL,
  item_total        REAL NOT NULL,
  platform_fee      REAL NOT NULL,
  cgst_rate         REAL NOT NULL DEFAULT 9.0,
  cgst_amount       REAL NOT NULL,
  sgst_rate         REAL NOT NULL DEFAULT 9.0,
  sgst_amount       REAL NOT NULL,
  grand_total       REAL NOT NULL,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

