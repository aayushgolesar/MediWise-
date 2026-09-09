import express from 'express';
import db from '../db.js';
import type { Medicine, PharmacyOffer } from '../../src/types/index.js';
import { requireAuth } from '../security.js';

const router = express.Router();
router.use(requireAuth);

// Helper — map DB row to Medicine shape
function rowToMedicine(row: Record<string, unknown>): Medicine {
  return {
    id: row.id as string,
    brandName: row.brand_name as string,
    genericName: row.generic_name as string,
    strength: row.strength as string,
    dosageForm: row.dosage_form as string,
    therapeuticCategory: row.therapeutic_category as string,
    category: row.category as Medicine['category'],
    schedule: row.schedule as Medicine['schedule'],
    mrpReference: row.mrp_reference as number,
    startingPrice: row.starting_price as number,
    discountPercent: row.discount_percent as number,
    cdscoApproved: Boolean(row.cdsco_approved),
    bioequivalentVerified: Boolean(row.bioequivalent_verified),
    bioequivalentTo: row.bioequivalent_to as string,
    inStock: Boolean(row.in_stock),
    stockCount: row.stock_count as number,
    hubCount: row.hub_count as number,
    indications: JSON.parse(row.indications as string) as string[],
    description: row.description as string,
    packOptions: JSON.parse(row.pack_options as string),
    pharmacyOffers: [],
  };
}

// Helper — map DB row to PharmacyOffer shape
function rowToOffer(row: Record<string, unknown>): PharmacyOffer {
  return {
    id: row.id as string,
    pharmacyName: row.pharmacy_name as string,
    hubId: row.hub_id as string,
    locality: row.locality as string,
    distanceKm: row.distance_km as number,
    slaMinutes: row.sla_minutes as number,
    mrp: row.mrp as number,
    discountedPrice: row.discounted_price as number,
    discountPercent: row.discount_percent as number,
    inStock: Boolean(row.in_stock),
    stockUnits: row.stock_units as number,
    batchNumber: row.batch_number as string,
    expiryDate: row.expiry_date as string,
    hologramVerified: Boolean(row.hologram_verified),
    licenseNumber: row.license_number as string,
    rating: row.rating as number,
    reviewCount: row.review_count as number,
    savings: row.savings as number,
    isRecommended: Boolean(row.is_recommended),
  };
}

/**
 * GET /api/medicines
 * Query params: ?category=Cardiovascular&schedule=OTC&search=atorva
 */
router.get('/', (req, res) => {
  const { category, schedule, search } = req.query;

  let query = 'SELECT * FROM medicines WHERE 1=1';
  const params: unknown[] = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (schedule) {
    query += ' AND schedule LIKE ?';
    params.push(`%${schedule}%`);
  }
  if (search) {
    query += ' AND (brand_name LIKE ? OR generic_name LIKE ? OR bioequivalent_to LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  const rows = db.prepare(query).all(...params) as Record<string, unknown>[];
  const medicines = rows.map(rowToMedicine);
  res.json({ data: medicines, count: medicines.length });
});

/**
 * GET /api/medicines/:id
 */
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM medicines WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
  if (!row) {
    res.status(404).json({ error: 'Medicine not found' });
    return;
  }
  const medicine = rowToMedicine(row);
  // Attach offers
  const offerRows = db.prepare('SELECT * FROM pharmacy_offers WHERE medicine_id = ?').all(req.params.id) as Record<string, unknown>[];
  medicine.pharmacyOffers = offerRows.map(rowToOffer);
  res.json({ data: medicine });
});

/**
 * GET /api/medicines/:id/offers
 */
router.get('/:id/offers', (req, res) => {
  const rows = db.prepare('SELECT * FROM pharmacy_offers WHERE medicine_id = ? ORDER BY discounted_price ASC').all(req.params.id) as Record<string, unknown>[];
  res.json({ data: rows.map(rowToOffer), count: rows.length });
});

export default router;
