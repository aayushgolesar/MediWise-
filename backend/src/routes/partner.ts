import express from 'express';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../security.js';
import { logAuditEvent } from '../audit.js';
import { emitOrderUpdated } from '../realtime.js';
import { Order } from '../models/Order.js';
import { PharmacyOffer } from '../models/PharmacyOffer.js';
import { Medicine } from '../models/Medicine.js';

const router = express.Router();
router.use(requireAuth, requireRole('pharmacist', 'admin'));

/**
 * GET /api/partner/orders
 * Returns all orders in non-delivered states for pharmacist review.
 */
router.get('/orders', async (_req, res, next) => {
  try {
    const orders = await Order.find({ status: { $nin: ['delivered'] } })
      .sort({ placed_time: -1 })
      .lean();
    res.json({ data: orders, count: orders.length });
  } catch (error: unknown) { next(error); }
});

/**
 * PUT /api/partner/orders/:id/accept
 * Pharmacist accepts order and starts prescription audit / dispensing verification.
 */
router.put('/orders/:id/accept', async (req: AuthenticatedRequest, res, next) => {
  try {
    const order = await Order.findById(req.params.id).lean();

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    await Order.findByIdAndUpdate(req.params.id, { status: 'pharmacist_audit' });
    emitOrderUpdated(req.params.id, 'pharmacist_audit');

    // Regulatory audit record for dispensing process start
    await logAuditEvent('PRESCRIPTION_VERIFIED', req.params.id, req.auth?.sub ?? null, {
      orderId: req.params.id,
      medicineName: order.medicine_name,
      pharmacyHubId: order.pharmacy_hub_id,
      action: 'Accepted for Pharmacist Audit',
    });

    res.json({ data: { status: 'pharmacist_audit' }, message: 'Order accepted for audit.' });
  } catch (error: unknown) { next(error); }
});

/**
 * PUT /api/partner/orders/:id/reject
 * Rejection triggers the reassignment engine.
 */
router.put('/orders/:id/reject', async (req: AuthenticatedRequest, res, next) => {
  try {
    const order = await Order.findById(req.params.id).lean();

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    await Order.findByIdAndUpdate(req.params.id, { status: 'locked_escrow' });
    emitOrderUpdated(req.params.id, 'locked_escrow');

    await logAuditEvent('ORDER_REASSIGNED', req.params.id, req.auth?.sub ?? null, {
      orderId: req.params.id,
      rejectedByHub: order.pharmacy_hub_id,
      reason: 'Pharmacist rejected or out of stock',
    });

    res.json({ data: { status: 'locked_escrow' }, message: 'Order rejected. Reassignment engine triggered.' });
  } catch (error: unknown) { next(error); }
});

/**
 * GET /api/partner/inventory
 * Returns all pharmacy offers (inventory proxy) with their hub info.
 */
router.get('/inventory', async (_req, res, next) => {
  try {
    const offers = await PharmacyOffer.find().lean();
    
    // Fetch medicine details for each offer
    const medicineIds = [...new Set(offers.map(o => o.medicine_id))];
    const medicines = await Medicine.find({ _id: { $in: medicineIds } }).lean();
    const medicineMap = new Map(medicines.map(m => [m._id, m]));
    
    const enrichedOffers = offers.map(offer => {
      const medicine = medicineMap.get(offer.medicine_id);
      return {
        ...offer,
        brand_name: medicine?.brand_name ?? '',
        generic_name: medicine?.generic_name ?? '',
        schedule: medicine?.schedule ?? '',
      };
    });
    
    res.json({ data: enrichedOffers, count: enrichedOffers.length });
  } catch (error: unknown) { next(error); }
});

export default router;
