import express from 'express';
import db from '../db.js';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../security.js';
import { logAuditEvent } from '../audit.js';
import { emitOrderUpdated } from '../realtime.js';

const router = express.Router();
router.use(requireAuth, requireRole('pharmacist', 'admin'));

/**
 * GET /api/partner/orders
 * Returns all orders in non-delivered states for pharmacist review.
 */
router.get('/orders', (_req, res) => {
  const rows = db.prepare(`
    SELECT * FROM orders
    WHERE status NOT IN ('delivered')
    ORDER BY placed_time DESC
  `).all() as Record<string, unknown>[];
  res.json({ data: rows, count: rows.length });
});

/**
 * PUT /api/partner/orders/:id/accept
 * Pharmacist accepts order and starts prescription audit / dispensing verification.
 */
router.put('/orders/:id/accept', (req: AuthenticatedRequest, res) => {
  const exists = db.prepare('SELECT order_id, medicine_name, pharmacy_hub_id FROM orders WHERE order_id = ?').get(req.params.id) as {
    order_id: string;
    medicine_name: string;
    pharmacy_hub_id: string;
  } | undefined;

  if (!exists) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  db.prepare("UPDATE orders SET status = 'pharmacist_audit' WHERE order_id = ?").run(req.params.id);
  emitOrderUpdated(req.params.id, 'pharmacist_audit');

  // Regulatory audit record for dispensing process start
  logAuditEvent('PRESCRIPTION_VERIFIED', req.params.id, req.auth?.sub ?? null, {
    orderId: req.params.id,
    medicineName: exists.medicine_name,
    pharmacyHubId: exists.pharmacy_hub_id,
    action: 'Accepted for Pharmacist Audit',
  });

  res.json({ data: { status: 'pharmacist_audit' }, message: 'Order accepted for audit.' });
});

/**
 * PUT /api/partner/orders/:id/reject
 * Rejection triggers the reassignment engine.
 */
router.put('/orders/:id/reject', (req: AuthenticatedRequest, res) => {
  const exists = db.prepare('SELECT order_id, medicine_name, pharmacy_hub_id FROM orders WHERE order_id = ?').get(req.params.id) as {
    order_id: string;
    medicine_name: string;
    pharmacy_hub_id: string;
  } | undefined;

  if (!exists) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  db.prepare("UPDATE orders SET status = 'locked_escrow' WHERE order_id = ?").run(req.params.id);
  emitOrderUpdated(req.params.id, 'locked_escrow');

  logAuditEvent('ORDER_REASSIGNED', req.params.id, req.auth?.sub ?? null, {
    orderId: req.params.id,
    rejectedByHub: exists.pharmacy_hub_id,
    reason: 'Pharmacist rejected or out of stock',
  });

  res.json({ data: { status: 'locked_escrow' }, message: 'Order rejected. Reassignment engine triggered.' });
});

/**
 * GET /api/partner/inventory
 * Returns all pharmacy offers (inventory proxy) with their hub info.
 */
router.get('/inventory', (_req, res) => {
  const rows = db.prepare(`
    SELECT po.*, m.brand_name, m.generic_name, m.schedule
    FROM pharmacy_offers po
    JOIN medicines m ON po.medicine_id = m.id
    ORDER BY po.pharmacy_name, po.batch_number
  `).all() as Record<string, unknown>[];
  res.json({ data: rows, count: rows.length });
});

export default router;
