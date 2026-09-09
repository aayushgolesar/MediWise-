import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_PATH = process.env.DB_PATH ?? path.resolve(__dirname, '../mediwise.db');
const SCHEMA_PATH = path.resolve(__dirname, 'schema.sql');

// Create and configure the SQLite database connection
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Apply schema on startup (idempotent — uses CREATE TABLE IF NOT EXISTS)
const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
db.exec(schemaSql);

const addColumnIfMissing = (table: string, column: string, definition: string): void => {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  if (!columns.some((entry) => entry.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
};

addColumnIfMissing('prescription_audits', 'drug_name', "TEXT NOT NULL DEFAULT ''");
addColumnIfMissing('prescription_audits', 'needs_pharmacist_review', 'INTEGER NOT NULL DEFAULT 0');
addColumnIfMissing('prescription_audits', 'confidence_json', "TEXT NOT NULL DEFAULT '{}'");

export default db;
