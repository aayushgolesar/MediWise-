import express from 'express';
import db from '../db.js';
import type { OrderDetail, PrescriptionAudit } from '../../src/types/index.js';
import { randomUUID } from 'crypto';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../security.js';
import { logAuditEvent } from '../audit.js';
import { emitOrderUpdated } from '../realtime.js';

const router = express.Router();
router.use(requireAuth, requireRole('patient', 'admin'));

router.get('/patients', (_req, res) => {
  const rows = db.prepare('SELECT * FROM patients ORDER BY name').all() as Record<string, unknown>[];
  res.json({
    data: rows.map(row => ({
      id: row.id,
      name: row.name,
      age: row.age,
      gender: row.gender,
      relation: row.relation,
      abhaId: row.abha_id,
      phone: row.phone,
    })),
  });
});

router.get('/prescription', (_req, res) => {
  const row = db.prepare('SELECT * FROM prescription_audits ORDER BY upload_date DESC LIMIT 1').get() as Record<string, unknown> | undefined;
  if (!row) {
    res.json({ data: null });
    return;
  }
  let fieldConfidence: PrescriptionAudit['fieldConfidence'];
  try {
    const parsed = JSON.parse(String(row.confidence_json ?? '{}')) as PrescriptionAudit['fieldConfidence'];
    if (parsed && Object.keys(parsed).length > 0) {
      fieldConfidence = parsed;
    }
  } catch {
    fieldConfidence = undefined;
  }

  res.json({
    data: {
      rxId: row.rx_id,
      fileName: row.file_name,
      uploadDate: row.upload_date,
      doctorName: row.doctor_name,
      doctorRegNo: row.doctor_reg_no,
      hospitalClinic: row.hospital_clinic,
      prescribedFor: row.prescribed_for,
      drugName: row.drug_name ?? '',
      dosage: row.dosage,
      durationDays: row.duration_days,
      frequency: row.frequency,
      dispenseLimitQty: row.dispense_limit,
      ocrVerified: Boolean(row.ocr_verified),
      needsPharmacistReview: Boolean(row.needs_pharmacist_review),
      fieldConfidence,
      scheduleCategory: row.schedule_category,
    },
  });
});

function rowToOrder(row: Record<string, unknown>): OrderDetail {
  return {
    orderId: row.order_id as string,
    placedTime: row.placed_time as string,
    deliveryEta: row.delivery_eta as string,
    deliveryOtp: row.delivery_otp as string,
    status: row.status as OrderDetail['status'],
    customer: {
      name: row.customer_name as string,
      address: row.customer_address as string,
      phone: row.customer_phone as string,
    },
    pharmacy: {
      name: row.pharmacy_name as string,
      hubId: row.pharmacy_hub_id as string,
      address: row.pharmacy_address as string,
      license: row.pharmacy_license as string,
      pharmacistName: row.pharmacist_name as string,
      pharmacistReg: row.pharmacist_reg as string,
    },
    courier: {
      name: row.courier_name as string,
      phone: row.courier_phone as string,
      rating: row.courier_rating as number,
      vehicleNumber: row.vehicle_number as string,
      coldChainVerified: Boolean(row.cold_chain_verified),
      currentDistanceKm: row.current_distance_km as number,
    },
    medicine: {
      brandGenericName: row.medicine_name as string,
      composition: row.composition as string,
      packSize: row.pack_size as number,
      batchNumber: row.batch_number as string,
      sealHash: row.seal_hash as string,
      price: row.price as number,
    },
    financials: {
      itemTotal: row.item_total as number,
      packagingTamperFee: row.packaging_tamper_fee as number,
      deliveryFee: row.delivery_fee as number,
      platformConvenience: row.platform_convenience as number,
      genericSavings: row.generic_savings as number,
      totalPaid: row.total_paid as number,
      escrowStatus: row.escrow_status as OrderDetail['financials']['escrowStatus'],
    },
  };
}

/**
 * GET /api/orders/:id
 */
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(req.params.id) as Record<string, unknown> | undefined;
  if (!row) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json({ data: rowToOrder(row) });
});

/**
 * POST /api/orders — Place a new order (locks escrow)
 */
router.post('/', (req: AuthenticatedRequest, res) => {
  const body = req.body as Partial<Record<string, unknown>>;
  const orderId = `MW-${Math.floor(Math.random() * 90000 + 10000)}-BLR`;
  const otp = String(Math.floor(Math.random() * 9000 + 1000));
  const now = new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) + ', Today';

  const itemTotal = (body.itemTotal as number) ?? 0;
  const totalPaid = itemTotal + 32;

  const stmt = db.prepare(`
    INSERT INTO orders
      (order_id, placed_time, delivery_eta, delivery_otp, status,
       customer_name, customer_address, customer_phone,
       pharmacy_name, pharmacy_hub_id, pharmacy_address, pharmacy_license, pharmacist_name, pharmacist_reg,
       courier_name, courier_phone, courier_rating, vehicle_number, cold_chain_verified, current_distance_km,
       medicine_name, composition, pack_size, batch_number, seal_hash, price,
       item_total, packaging_tamper_fee, delivery_fee, platform_convenience, generic_savings, total_paid, escrow_status)
    VALUES
      (?,?,?,?,?,  ?,?,?,  ?,?,?,?,?,?,  ?,?,?,?,?,?,  ?,?,?,?,?,?,  ?,?,?,?,?,?,?)
  `);

  stmt.run(
    orderId, now, (body.deliveryEta as string) ?? '45 min SLA', otp, 'locked_escrow',
    (body.customerName as string) ?? 'Patient', (body.customerAddress as string) ?? '', (body.customerPhone as string) ?? '',
    (body.pharmacyName as string) ?? '', (body.pharmacyHubId as string) ?? '', '', '', '', '',
    'Pending Assignment', '', 0, '', 0, 0,
    (body.medicineName as string) ?? '', '', (body.packSize as number) ?? 1, '', `0x${randomUUID().replace(/-/g, '').slice(0, 24).toUpperCase()}`, (body.price as number) ?? 0,
    itemTotal, 12, 15, 5, (body.genericSavings as number) ?? 0,
    totalPaid, 'Held in Escrow'
  );

  // Immutable audit log write
  logAuditEvent('ORDER_PLACED_ESCROW_LOCKED', orderId, req.auth?.sub ?? null, {
    orderId,
    customerName: body.customerName,
    medicineName: body.medicineName,
    pharmacyHubId: body.pharmacyHubId,
    totalPaid,
    escrowStatus: 'Held in Escrow',
  });
  emitOrderUpdated(orderId, 'locked_escrow');

  res.status(201).json({
    data: { orderId, deliveryOtp: otp, escrowStatus: 'Held in Escrow', status: 'locked_escrow' },
    message: 'Order placed successfully. Payment held in escrow.',
  });
});

/**
 * PUT /api/orders/:id/otp — Confirm delivery with OTP and release escrow
 */
router.put('/:id/otp', (req: AuthenticatedRequest, res) => {
  const { otp } = req.body as { otp: string };
  const row = db.prepare('SELECT delivery_otp, status, total_paid, pharmacy_hub_id FROM orders WHERE order_id = ?').get(req.params.id) as {
    delivery_otp: string;
    status: string;
    total_paid: number;
    pharmacy_hub_id: string;
  } | undefined;

  if (!row) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  if (row.delivery_otp !== String(otp)) {
    res.status(400).json({ error: 'Invalid OTP' });
    return;
  }

  db.prepare("UPDATE orders SET status = 'delivered', escrow_status = 'Released to Pharmacy' WHERE order_id = ?").run(req.params.id);

  // Immutable audit log write for escrow release
  logAuditEvent('ESCROW_RELEASED', req.params.id, req.auth?.sub ?? null, {
    orderId: req.params.id,
    releasedAmount: row.total_paid,
    destinationHubId: row.pharmacy_hub_id,
    confirmedVia: 'Customer OTP',
  });
  emitOrderUpdated(req.params.id, 'delivered');

  res.json({
    data: { status: 'delivered', escrowStatus: 'Released to Pharmacy' },
    message: 'Delivery confirmed. Escrow released to pharmacy.',
  });
});

/**
 * POST /api/orders/:id/dispute — Put escrow under dispute
 */
router.post('/:id/dispute', (req: AuthenticatedRequest, res) => {
  const { reason } = req.body as { reason: string };
  const row = db.prepare('SELECT order_id, status, escrow_status, total_paid FROM orders WHERE order_id = ?').get(req.params.id) as {
    order_id: string;
    status: string;
    escrow_status: string;
    total_paid: number;
  } | undefined;

  if (!row) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  db.prepare("UPDATE orders SET escrow_status = 'Under Dispute' WHERE order_id = ?").run(req.params.id);

  logAuditEvent('DISPUTE_FILED', req.params.id, req.auth?.sub ?? null, {
    orderId: req.params.id,
    reason: reason || 'Customer reported discrepancy',
    escrowAmount: row.total_paid,
    previousStatus: row.escrow_status,
  });

  res.json({
    data: { orderId: req.params.id, escrowStatus: 'Under Dispute' },
    message: 'Dispute filed successfully. Escrow funds locked pending clearinghouse review.',
  });
});

/**
 * POST /api/orders/:id/auto-release — Automatic escrow release after SLA / 7 days if no dispute
 */
router.post('/:id/auto-release', (req: AuthenticatedRequest, res) => {
  const row = db.prepare('SELECT order_id, escrow_status, total_paid, pharmacy_hub_id FROM orders WHERE order_id = ?').get(req.params.id) as {
    order_id: string;
    escrow_status: string;
    total_paid: number;
    pharmacy_hub_id: string;
  } | undefined;

  if (!row) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  if (row.escrow_status === 'Under Dispute') {
    res.status(400).json({ error: 'Cannot auto-release escrow funds while under active dispute.' });
    return;
  }

  db.prepare("UPDATE orders SET escrow_status = 'Released to Pharmacy' WHERE order_id = ?").run(req.params.id);

  logAuditEvent('ESCROW_RELEASED', req.params.id, req.auth?.sub ?? 'SYSTEM_TIMER', {
    orderId: req.params.id,
    releasedAmount: row.total_paid,
    destinationHubId: row.pharmacy_hub_id,
    trigger: 'Automatic SLA Timeout (7 Days No Dispute)',
  });

  res.json({
    data: { orderId: req.params.id, escrowStatus: 'Released to Pharmacy' },
    message: 'Escrow automatically settled and released to pharmacy.',
  });
});

export default router;

