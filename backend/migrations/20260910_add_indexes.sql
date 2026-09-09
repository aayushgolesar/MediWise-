-- migrations/20260910_add_indexes.sql
-- Performance optimisation: add indexes on hot query columns

-- Index on orders.status to speed up status-based lookups (tracking, admin queues)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Index on orders.pharmacy_hub_id for partner portal queries
CREATE INDEX IF NOT EXISTS idx_orders_pharmacy_hub_id ON orders(pharmacy_hub_id);

-- Index on pharmacy_offers.medicine_id for catalog and availability lookups
CREATE INDEX IF NOT EXISTS idx_pharmacy_offers_medicine_id ON pharmacy_offers(medicine_id);

-- Index on pharmacy_offers.hub_id for per-pharmacy stock queries
CREATE INDEX IF NOT EXISTS idx_pharmacy_offers_hub_id ON pharmacy_offers(hub_id);

-- Index on audit_log.entity_id for audit trail queries
CREATE INDEX IF NOT EXISTS idx_audit_log_entity_id ON audit_log(entity_id);

-- Index on audit_log.created_at for time-range compliance queries
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
