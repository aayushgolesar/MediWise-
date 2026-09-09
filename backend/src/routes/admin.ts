import express from 'express';
import type { QuarantineItem, DisputeCase, TenantHub } from '../types/index.js';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../security.js';
import { getAuditLogs, logAuditEvent } from '../audit.js';
import { QuarantineItem as QuarantineItemModel } from '../models/QuarantineItem.js';
import { ReassignmentTask } from '../models/ReassignmentTask.js';
import { Order } from '../models/Order.js';
import { DisputeCase as DisputeCaseModel } from '../models/DisputeCase.js';
import { TenantHub as TenantHubModel } from '../models/TenantHub.js';

const router = express.Router();
router.use(requireAuth, requireRole('admin'));

// ─── Quarantine ───────────────────────────────────────────────────────────────

function rowToQuarantine(item: {
  _id: string;
  sku_name: string;
  generic_composition: string;
  hub_id: string;
  hub_name: string;
  locality: string;
  reported_price: number;
  system_floor_price: number;
  discrepancy_percent: number;
  last_heartbeat_ago: string;
  reason: string;
  severity: string;
  status: string;
}): QuarantineItem {
  return {
    id: item._id,
    skuName: item.sku_name,
    genericComposition: item.generic_composition,
    hubId: item.hub_id,
    hubName: item.hub_name,
    locality: item.locality,
    reportedPrice: item.reported_price,
    systemFloorPrice: item.system_floor_price,
    discrepancyPercent: item.discrepancy_percent,
    lastHeartbeatAgo: item.last_heartbeat_ago,
    reason: item.reason as QuarantineItem['reason'],
    severity: item.severity as QuarantineItem['severity'],
    status: item.status as QuarantineItem['status'],
  };
}

/** GET /api/admin/quarantine */
router.get('/quarantine', async (_req, res, next) => {
  try {
    const items = await QuarantineItemModel.find()
      .sort({
        severity: 1, // MongoDB will sort Critical < High < Low < Medium alphabetically, we need custom sort
      })
      .lean();
    
    // Custom severity sort: Critical=1, High=2, Medium=3, Low=4
    const severityOrder: Record<string, number> = { Critical: 1, High: 2, Medium: 3, Low: 4 };
    items.sort((a, b) => (severityOrder[a.severity] ?? 5) - (severityOrder[b.severity] ?? 5));
    
    res.json({ data: items.map(rowToQuarantine), count: items.length });
  } catch (error: unknown) { next(error); }
});

/** PUT /api/admin/quarantine/:id */
router.put('/quarantine/:id', async (req, res, next) => {
  try {
    const { action } = req.body as { action: 'release' | 'escalate' };
    const newStatus = action === 'release' ? 'Released' : 'Quarantined';
    const result = await QuarantineItemModel.findByIdAndUpdate(
      req.params.id,
      { status: newStatus },
      { new: true }
    );
    if (!result) { res.status(404).json({ error: 'Quarantine item not found' }); return; }
    res.json({ data: { id: req.params.id, status: newStatus }, message: `Item ${action}d successfully.` });
  } catch (error: unknown) { next(error); }
});

// ─── Reassignment ─────────────────────────────────────────────────────────────

/** GET /api/admin/reassignment */
router.get('/reassignment', async (_req, res, next) => {
  try {
    const tasks = await ReassignmentTask.find().lean();
    const data = tasks.map(r => ({
      orderId: r._id,
      patientName: r.patient_name,
      medicineName: r.medicine_name,
      originalHub: r.original_hub,
      timeRemainingSec: r.time_remaining_sec,
      totalTimeoutSec: r.total_timeout_sec,
      timeoutReason: r.timeout_reason,
      candidateHubs: JSON.parse(r.candidate_hubs),
    }));
    res.json({ data, count: data.length });
  } catch (error: unknown) { next(error); }
});

/** POST /api/admin/reassignment/:orderId/assign */
router.post('/reassignment/:orderId/assign', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { hubId } = req.body as { hubId: string };
    await ReassignmentTask.findByIdAndDelete(req.params.orderId);
    await Order.findByIdAndUpdate(req.params.orderId, {
      pharmacy_hub_id: hubId,
      status: 'locked_escrow',
    });

    await logAuditEvent('ORDER_REASSIGNED', req.params.orderId, req.auth?.sub ?? null, {
      orderId: req.params.orderId,
      assignedHubId: hubId,
      status: 'locked_escrow',
    });

    res.json({ data: { orderId: req.params.orderId, assignedHubId: hubId }, message: 'Order reassigned successfully.' });
  } catch (error: unknown) { next(error); }
});

// ─── Disputes ─────────────────────────────────────────────────────────────────

function rowToDispute(dispute: {
  _id: string;
  order_id: string;
  customer_name: string;
  medicine_name: string;
  dispute_type: string;
  escrow_amount: number;
  customer_claim_photo_url: string;
  dispatch_baseline_url: string;
  seal_barcode_expected: string;
  seal_barcode_reported: string;
  courier_gps_duration: string;
  courier_shock_spike: string;
  status: string;
}): DisputeCase {
  return {
    caseId: dispute._id,
    orderId: dispute.order_id,
    customerName: dispute.customer_name,
    medicineName: dispute.medicine_name,
    disputeType: dispute.dispute_type as DisputeCase['disputeType'],
    escrowAmount: dispute.escrow_amount,
    customerClaimPhotoUrl: dispute.customer_claim_photo_url,
    dispatchBaselinePhotoUrl: dispute.dispatch_baseline_url,
    sealBarcodeExpected: dispute.seal_barcode_expected,
    sealBarcodeReported: dispute.seal_barcode_reported,
    courierGpsDuration: dispute.courier_gps_duration,
    courierShockSpike: dispute.courier_shock_spike,
    status: dispute.status as DisputeCase['status'],
  };
}

/** GET /api/admin/disputes */
router.get('/disputes', async (_req, res, next) => {
  try {
    const disputes = await DisputeCaseModel.find().sort({ status: -1 }).lean();
    res.json({ data: disputes.map(rowToDispute), count: disputes.length });
  } catch (error: unknown) { next(error); }
});

/** PUT /api/admin/disputes/:id/resolve */
router.put('/disputes/:id/resolve', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { resolution } = req.body as { resolution: 'Refund Approved' | 'Dispute Rejected' | 'Hub Penalized' };
    const validResolutions = ['Refund Approved', 'Dispute Rejected', 'Hub Penalized'];
    if (!validResolutions.includes(resolution)) {
      res.status(400).json({ error: 'Invalid resolution. Must be: Refund Approved | Dispute Rejected | Hub Penalized' });
      return;
    }
    const result = await DisputeCaseModel.findByIdAndUpdate(
      req.params.id,
      { status: resolution },
      { new: true }
    );
    if (!result) { res.status(404).json({ error: 'Dispute case not found' }); return; }

    // Update escrow status on the linked order
    const dispute = await DisputeCaseModel.findById(req.params.id).lean();
    if (dispute) {
      const escrowStatus = resolution === 'Refund Approved' ? 'Refunded' : 'Released to Pharmacy';
      await Order.findByIdAndUpdate(dispute.order_id, { escrow_status: escrowStatus });

      const auditType = resolution === 'Refund Approved' ? 'ESCROW_REFUNDED' : 'DISPUTE_RESOLVED';
      await logAuditEvent(auditType, dispute.order_id, req.auth?.sub ?? null, {
        caseId: req.params.id,
        resolution,
        escrowAmount: dispute.escrow_amount,
        newEscrowStatus: escrowStatus,
      });
    }

    res.json({ data: { caseId: req.params.id, status: resolution }, message: `Dispute resolved: ${resolution}` });
  } catch (error: unknown) { next(error); }
});

// ─── Tenant Hubs (Super Admin) ────────────────────────────────────────────────

function rowToHub(hub: {
  _id: string;
  hub_name: string;
  schema_name: string;
  city: string;
  locality: string;
  db_latency_ms: number;
  active_orders: number;
  storage_mb: number;
  cdsco_license: string;
  status: string;
}): TenantHub {
  return {
    tenantId: hub._id,
    hubName: hub.hub_name,
    schemaName: hub.schema_name,
    city: hub.city,
    locality: hub.locality,
    dbLatencyMs: hub.db_latency_ms,
    activeOrders: hub.active_orders,
    storageMb: hub.storage_mb,
    cdscoLicense: hub.cdsco_license,
    status: hub.status as TenantHub['status'],
  };
}

/** GET /api/admin/hubs */
router.get('/hubs', async (_req, res, next) => {
  try {
    const hubs = await TenantHubModel.find().sort({ hub_name: 1 }).lean();
    res.json({ data: hubs.map(rowToHub), count: hubs.length });
  } catch (error: unknown) { next(error); }
});

// ─── Manual Admin Escrow Overrides ───────────────────────────────────────────

/** POST /api/admin/escrow/:orderId/release */
router.post('/escrow/:orderId/release', async (req: AuthenticatedRequest, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId).lean();

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    await Order.findByIdAndUpdate(req.params.orderId, {
      escrow_status: 'Released to Pharmacy',
    });

    await logAuditEvent('ESCROW_RELEASED', req.params.orderId, req.auth?.sub ?? null, {
      orderId: req.params.orderId,
      releasedAmount: order.total_paid,
      destinationHubId: order.pharmacy_hub_id,
      overrideByAdmin: true,
    });

    res.json({ data: { orderId: req.params.orderId, escrowStatus: 'Released to Pharmacy' }, message: 'Escrow released manually by Admin.' });
  } catch (error: unknown) { next(error); }
});

/** POST /api/admin/escrow/:orderId/refund */
router.post('/escrow/:orderId/refund', async (req: AuthenticatedRequest, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId).lean();

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    await Order.findByIdAndUpdate(req.params.orderId, {
      escrow_status: 'Refunded',
    });

    await logAuditEvent('ESCROW_REFUNDED', req.params.orderId, req.auth?.sub ?? null, {
      orderId: req.params.orderId,
      refundedAmount: order.total_paid,
      overrideByAdmin: true,
    });

    res.json({ data: { orderId: req.params.orderId, escrowStatus: 'Refunded' }, message: 'Escrow refunded manually by Admin.' });
  } catch (error: unknown) { next(error); }
});

export default router;
