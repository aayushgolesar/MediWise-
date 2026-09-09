import express from 'express';
import type { OrderDetail, PrescriptionAudit } from '../types/index.js';
import { randomUUID } from 'crypto';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../security.js';
import { logAuditEvent } from '../audit.js';
import { emitOrderUpdated } from '../realtime.js';
import { Patient } from '../models/Patient.js';
import { PrescriptionAudit as PrescriptionAuditModel } from '../models/PrescriptionAudit.js';
import { Order } from '../models/Order.js';

const router = express.Router();
router.use(requireAuth, requireRole('patient', 'admin'));

router.get('/patients', async (_req, res, next) => {
  try {
    const patients = await Patient.find().sort({ name: 1 }).lean();
    res.json({
      data: patients.map(p => ({
        id: p._id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        relation: p.relation,
        abhaId: p.abha_id,
        phone: p.phone,
      })),
    });
  } catch (error: unknown) { next(error); }
});

router.get('/prescription', async (_req, res, next) => {
  try {
    const prescription = await PrescriptionAuditModel.findOne().sort({ upload_date: -1 }).lean();
    if (!prescription) {
      res.json({ data: null });
      return;
    }
    let fieldConfidence: PrescriptionAudit['fieldConfidence'];
    try {
      const parsed = JSON.parse(prescription.confidence_json ?? '{}') as PrescriptionAudit['fieldConfidence'];
      if (parsed && Object.keys(parsed).length > 0) {
        fieldConfidence = parsed;
      }
    } catch {
      fieldConfidence = undefined;
    }

    res.json({
      data: {
        rxId: prescription._id,
        fileName: prescription.file_name,
        uploadDate: prescription.upload_date,
        doctorName: prescription.doctor_name,
        doctorRegNo: prescription.doctor_reg_no,
        hospitalClinic: prescription.hospital_clinic,
        prescribedFor: prescription.prescribed_for,
        drugName: prescription.drug_name ?? '',
        dosage: prescription.dosage,
        durationDays: prescription.duration_days,
        frequency: prescription.frequency,
        dispenseLimitQty: prescription.dispense_limit,
        ocrVerified: prescription.ocr_verified,
        needsPharmacistReview: prescription.needs_pharmacist_review,
        fieldConfidence,
        scheduleCategory: prescription.schedule_category,
      },
    });
  } catch (error: unknown) { next(error); }
});

function rowToOrder(order: {
  _id: string;
  placed_time: string;
  delivery_eta: string;
  delivery_otp: string;
  status: string;
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  pharmacy_name: string;
  pharmacy_hub_id: string;
  pharmacy_address: string;
  pharmacy_license: string;
  pharmacist_name: string;
  pharmacist_reg: string;
  courier_name: string;
  courier_phone: string;
  courier_rating: number;
  vehicle_number: string;
  cold_chain_verified: boolean;
  current_distance_km: number;
  medicine_name: string;
  composition: string;
  pack_size: number;
  batch_number: string;
  seal_hash: string;
  price: number;
  item_total: number;
  packaging_tamper_fee: number;
  delivery_fee: number;
  platform_convenience: number;
  generic_savings: number;
  total_paid: number;
  escrow_status: string;
}): OrderDetail {
  return {
    orderId: order._id,
    placedTime: order.placed_time,
    deliveryEta: order.delivery_eta,
    deliveryOtp: order.delivery_otp,
    status: order.status as OrderDetail['status'],
    customer: {
      name: order.customer_name,
      address: order.customer_address,
      phone: order.customer_phone,
    },
    pharmacy: {
      name: order.pharmacy_name,
      hubId: order.pharmacy_hub_id,
      address: order.pharmacy_address,
      license: order.pharmacy_license,
      pharmacistName: order.pharmacist_name,
      pharmacistReg: order.pharmacist_reg,
    },
    courier: {
      name: order.courier_name,
      phone: order.courier_phone,
      rating: order.courier_rating,
      vehicleNumber: order.vehicle_number,
      coldChainVerified: order.cold_chain_verified,
      currentDistanceKm: order.current_distance_km,
    },
    medicine: {
      brandGenericName: order.medicine_name,
      composition: order.composition,
      packSize: order.pack_size,
      batchNumber: order.batch_number,
      sealHash: order.seal_hash,
      price: order.price,
    },
    financials: {
      itemTotal: order.item_total,
      packagingTamperFee: order.packaging_tamper_fee,
      deliveryFee: order.delivery_fee,
      platformConvenience: order.platform_convenience,
      genericSavings: order.generic_savings,
      totalPaid: order.total_paid,
      escrowStatus: order.escrow_status as OrderDetail['financials']['escrowStatus'],
    },
  };
}

/**
 * GET /api/orders/:id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json({ data: rowToOrder(order) });
  } catch (error: unknown) { next(error); }
});

/**
 * POST /api/orders — Place a new order (locks escrow)
 */
router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = req.body as Partial<Record<string, unknown>>;
    const orderId = `MW-${Math.floor(Math.random() * 90000 + 10000)}-BLR`;
    const otp = String(Math.floor(Math.random() * 9000 + 1000));
    const now = new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) + ', Today';

    const itemTotal = (body.itemTotal as number) ?? 0;
    const totalPaid = itemTotal + 32;

    await Order.create({
      _id: orderId,
      placed_time: now,
      delivery_eta: (body.deliveryEta as string) ?? '45 min SLA',
      delivery_otp: otp,
      status: 'locked_escrow',
      customer_name: (body.customerName as string) ?? 'Patient',
      customer_address: (body.customerAddress as string) ?? '',
      customer_phone: (body.customerPhone as string) ?? '',
      pharmacy_name: (body.pharmacyName as string) ?? '',
      pharmacy_hub_id: (body.pharmacyHubId as string) ?? '',
      pharmacy_address: '',
      pharmacy_license: '',
      pharmacist_name: '',
      pharmacist_reg: '',
      courier_name: 'Pending Assignment',
      courier_phone: '',
      courier_rating: 0,
      vehicle_number: '',
      cold_chain_verified: false,
      current_distance_km: 0,
      medicine_name: (body.medicineName as string) ?? '',
      composition: '',
      pack_size: (body.packSize as number) ?? 1,
      batch_number: '',
      seal_hash: `0x${randomUUID().replace(/-/g, '').slice(0, 24).toUpperCase()}`,
      price: (body.price as number) ?? 0,
      item_total: itemTotal,
      packaging_tamper_fee: 12,
      delivery_fee: 15,
      platform_convenience: 5,
      generic_savings: (body.genericSavings as number) ?? 0,
      total_paid: totalPaid,
      escrow_status: 'Held in Escrow',
    });

    // Immutable audit log write
    await logAuditEvent('ORDER_PLACED_ESCROW_LOCKED', orderId, req.auth?.sub ?? null, {
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
  } catch (error: unknown) { next(error); }
});

/**
 * PUT /api/orders/:id/otp — Confirm delivery with OTP and release escrow
 */
router.put('/:id/otp', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { otp } = req.body as { otp: string };
    const order = await Order.findById(req.params.id).lean();

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    if (order.delivery_otp !== String(otp)) {
      res.status(400).json({ error: 'Invalid OTP' });
      return;
    }

    await Order.findByIdAndUpdate(req.params.id, {
      status: 'delivered',
      escrow_status: 'Released to Pharmacy',
    });

    // Immutable audit log write for escrow release
    await logAuditEvent('ESCROW_RELEASED', req.params.id, req.auth?.sub ?? null, {
      orderId: req.params.id,
      releasedAmount: order.total_paid,
      destinationHubId: order.pharmacy_hub_id,
      confirmedVia: 'Customer OTP',
    });
    emitOrderUpdated(req.params.id, 'delivered');

    res.json({
      data: { status: 'delivered', escrowStatus: 'Released to Pharmacy' },
      message: 'Delivery confirmed. Escrow released to pharmacy.',
    });
  } catch (error: unknown) { next(error); }
});

/**
 * POST /api/orders/:id/dispute — Put escrow under dispute
 */
router.post('/:id/dispute', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { reason } = req.body as { reason: string };
    const order = await Order.findById(req.params.id).lean();

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    await Order.findByIdAndUpdate(req.params.id, {
      escrow_status: 'Under Dispute',
    });

    await logAuditEvent('DISPUTE_FILED', req.params.id, req.auth?.sub ?? null, {
      orderId: req.params.id,
      reason: reason || 'Customer reported discrepancy',
      escrowAmount: order.total_paid,
      previousStatus: order.escrow_status,
    });

    res.json({
      data: { orderId: req.params.id, escrowStatus: 'Under Dispute' },
      message: 'Dispute filed successfully. Escrow funds locked pending clearinghouse review.',
    });
  } catch (error: unknown) { next(error); }
});

/**
 * POST /api/orders/:id/auto-release — Automatic escrow release after SLA / 7 days if no dispute
 */
router.post('/:id/auto-release', async (req: AuthenticatedRequest, res, next) => {
  try {
    const order = await Order.findById(req.params.id).lean();

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.escrow_status === 'Under Dispute') {
      res.status(400).json({ error: 'Cannot auto-release escrow funds while under active dispute.' });
      return;
    }

    await Order.findByIdAndUpdate(req.params.id, {
      escrow_status: 'Released to Pharmacy',
    });

    await logAuditEvent('ESCROW_RELEASED', req.params.id, req.auth?.sub ?? 'SYSTEM_TIMER', {
      orderId: req.params.id,
      releasedAmount: order.total_paid,
      destinationHubId: order.pharmacy_hub_id,
      trigger: 'Automatic SLA Timeout (7 Days No Dispute)',
    });

    res.json({
      data: { orderId: req.params.id, escrowStatus: 'Released to Pharmacy' },
      message: 'Escrow automatically settled and released to pharmacy.',
    });
  } catch (error: unknown) { next(error); }
});

export default router;

