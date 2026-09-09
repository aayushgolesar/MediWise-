import express from 'express';
import db from '../db.js';
import type { QuarantineItem, DisputeCase, TenantHub } from '../types/index.js';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../security.js';
import { getAuditLogs, logAuditEvent } from '../audit.js';

const router = express.Router();
router.use(requireAuth, requireRole('admin'));

// ─── Quarantine ───────────────────────────────────────────────────────────────

function rowToQuarantine(row: Record<string, unknown>): QuarantineItem {
  return {
    id: row.id as string,
    skuName: row.sku_name as string,
    genericComposition: row.generic_composition as string,
    hubId: row.hub_id as string,
    hubName: row.hub_name as string,
    locality: row.locality as string,
    reportedPrice: row.reported_price as number,
    systemFloorPrice: row.system_floor_price as number,
    discrepancyPercent: row.discrepancy_percent as number,
    lastHeartbeatAgo: row.last_heartbeat_ago as string,
    reason: row.reason as QuarantineItem['reason'],
    severity: row.severity as QuarantineItem['severity'],
    status: row.status as QuarantineItem['status'],
  };
}

/** GET /api/admin/quarantine */
router.get('/quarantine', (_req, res) => {
  const rows = db.prepare("SELECT * FROM quarantine_items ORDER BY CASE severity WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END").all() as Record<string, unknown>[];
  res.json({ data: rows.map(rowToQuarantine), count: rows.length });
});

/** PUT /api/admin/quarantine/:id */
router.put('/quarantine/:id', (req, res) => {
  const { action } = req.body as { action: 'release' | 'escalate' };
  const newStatus = action === 'release' ? 'Released' : 'Quarantined';
  const result = db.prepare("UPDATE quarantine_items SET status = ? WHERE id = ?").run(newStatus, req.params.id);
  if (result.changes === 0) { res.status(404).json({ error: 'Quarantine item not found' }); return; }
  res.json({ data: { id: req.params.id, status: newStatus }, message: `Item ${action}d successfully.` });
});

// ─── Reassignment ─────────────────────────────────────────────────────────────

/** GET /api/admin/reassignment */
router.get('/reassignment', (_req, res) => {
  const rows = db.prepare('SELECT * FROM reassignment_tasks').all() as Record<string, unknown>[];
  const data = rows.map(r => ({
    orderId: r.order_id,
    patientName: r.patient_name,
    medicineName: r.medicine_name,
    originalHub: r.original_hub,
    timeRemainingSec: r.time_remaining_sec,
    totalTimeoutSec: r.total_timeout_sec,
    timeoutReason: r.timeout_reason,
    candidateHubs: JSON.parse(r.candidate_hubs as string),
  }));
  res.json({ data, count: data.length });
});

/** POST /api/admin/reassignment/:orderId/assign */
router.post('/reassignment/:orderId/assign', (req: AuthenticatedRequest, res) => {
  const { hubId } = req.body as { hubId: string };
  db.prepare('DELETE FROM reassignment_tasks WHERE order_id = ?').run(req.params.orderId);
  db.prepare("UPDATE orders SET pharmacy_hub_id = ?, status = 'locked_escrow' WHERE order_id = ?").run(hubId, req.params.orderId);

  logAuditEvent('ORDER_REASSIGNED', req.params.orderId, req.auth?.sub ?? null, {
    orderId: req.params.orderId,
    assignedHubId: hubId,
    status: 'locked_escrow',
  });

  res.json({ data: { orderId: req.params.orderId, assignedHubId: hubId }, message: 'Order reassigned successfully.' });
});

// ─── Disputes ─────────────────────────────────────────────────────────────────

function rowToDispute(row: Record<string, unknown>): DisputeCase {
  return {
    caseId: row.case_id as string,
    orderId: row.order_id as string,
    customerName: row.customer_name as string,
    medicineName: row.medicine_name as string,
    disputeType: row.dispute_type as DisputeCase['disputeType'],
    escrowAmount: row.escrow_amount as number,
    customerClaimPhotoUrl: row.customer_claim_photo_url as string,
    dispatchBaselinePhotoUrl: row.dispatch_baseline_url as string,
    sealBarcodeExpected: row.seal_barcode_expected as string,
    sealBarcodeReported: row.seal_barcode_reported as string,
    courierGpsDuration: row.courier_gps_duration as string,
    courierShockSpike: row.courier_shock_spike as string,
    status: row.status as DisputeCase['status'],
  };
}

/** GET /api/admin/disputes */
router.get('/disputes', (_req, res) => {
  const rows = db.prepare("SELECT * FROM dispute_cases ORDER BY status DESC").all() as Record<string, unknown>[];
  res.json({ data: rows.map(rowToDispute), count: rows.length });
});

/** PUT /api/admin/disputes/:id/resolve */
router.put('/disputes/:id/resolve', (req: AuthenticatedRequest, res) => {
  const { resolution } = req.body as { resolution: 'Refund Approved' | 'Dispute Rejected' | 'Hub Penalized' };
  const validResolutions = ['Refund Approved', 'Dispute Rejected', 'Hub Penalized'];
  if (!validResolutions.includes(resolution)) {
    res.status(400).json({ error: 'Invalid resolution. Must be: Refund Approved | Dispute Rejected | Hub Penalized' });
    return;
  }
  const result = db.prepare("UPDATE dispute_cases SET status = ? WHERE case_id = ?").run(resolution, req.params.id);
  if (result.changes === 0) { res.status(404).json({ error: 'Dispute case not found' }); return; }

  // Update escrow status on the linked order
  const disputeRow = db.prepare('SELECT order_id, escrow_amount FROM dispute_cases WHERE case_id = ?').get(req.params.id) as { order_id: string; escrow_amount: number } | undefined;
  if (disputeRow) {
    const escrowStatus = resolution === 'Refund Approved' ? 'Refunded' : 'Released to Pharmacy';
    db.prepare("UPDATE orders SET escrow_status = ? WHERE order_id = ?").run(escrowStatus, disputeRow.order_id);

    const auditType = resolution === 'Refund Approved' ? 'ESCROW_REFUNDED' : 'DISPUTE_RESOLVED';
    logAuditEvent(auditType, disputeRow.order_id, req.auth?.sub ?? null, {
      caseId: req.params.id,
      resolution,
      escrowAmount: disputeRow.escrow_amount,
      newEscrowStatus: escrowStatus,
    });
  }

  res.json({ data: { caseId: req.params.id, status: resolution }, message: `Dispute resolved: ${resolution}` });
});

// ─── Tenant Hubs (Super Admin) ────────────────────────────────────────────────

function rowToHub(row: Record<string, unknown>): TenantHub {
  return {
    tenantId: row.tenant_id as string,
    hubName: row.hub_name as string,
    schemaName: row.schema_name as string,
    city: row.city as string,
    locality: row.locality as string,
    dbLatencyMs: row.db_latency_ms as number,
    activeOrders: row.active_orders as number,
    storageMb: row.storage_mb as number,
    cdscoLicense: row.cdsco_license as string,
    status: row.status as TenantHub['status'],
  };
}

/** GET /api/admin/hubs */
router.get('/hubs', (_req, res) => {
  const rows = db.prepare('SELECT * FROM tenant_hubs ORDER BY hub_name').all() as Record<string, unknown>[];
  res.json({ data: rows.map(rowToHub), count: rows.length });
});

// ─── Manual Admin Escrow Overrides ───────────────────────────────────────────

/** POST /api/admin/escrow/:orderId/release */
router.post('/escrow/:orderId/release', (req: AuthenticatedRequest, res) => {
  const row = db.prepare('SELECT order_id, total_paid, pharmacy_hub_id FROM orders WHERE order_id = ?').get(req.params.orderId) as {
    order_id: string;
    total_paid: number;
    pharmacy_hub_id: string;
  } | undefined;

  if (!row) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  db.prepare("UPDATE orders SET escrow_status = 'Released to Pharmacy' WHERE order_id = ?").run(req.params.orderId);

  logAuditEvent('ESCROW_RELEASED', req.params.orderId, req.auth?.sub ?? null, {
    orderId: req.params.orderId,
    releasedAmount: row.total_paid,
    destinationHubId: row.pharmacy_hub_id,
    overrideByAdmin: true,
  });

  res.json({ data: { orderId: req.params.orderId, escrowStatus: 'Released to Pharmacy' }, message: 'Escrow released manually by Admin.' });
});

/** POST /api/admin/escrow/:orderId/refund */
router.post('/escrow/:orderId/refund', (req: AuthenticatedRequest, res) => {
  const row = db.prepare('SELECT order_id, total_paid FROM orders WHERE order_id = ?').get(req.params.orderId) as {
    order_id: string;
    total_paid: number;
  } | undefined;

  if (!row) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  db.prepare("UPDATE orders SET escrow_status = 'Refunded' WHERE order_id = ?").run(req.params.orderId);

  logAuditEvent('ESCROW_REFUNDED', req.params.orderId, req.auth?.sub ?? null, {
    orderId: req.params.orderId,
    refundedAmount: row.total_paid,
    overrideByAdmin: true,
  });

  res.json({ data: { orderId: req.params.orderId, escrowStatus: 'Refunded' }, message: 'Escrow refunded manually by Admin.' });
});

export default router;
