import express from 'express';
import { Medicine, PharmacyOffer } from '../models/Medicine.js';
import { requireAuth } from '../security.js';
import { catalogCacheKey, getCached, setCached } from '../cache.js';

const router = express.Router();
router.use(requireAuth);

/**
 * GET /api/medicines
 * Query params: ?category=Cardiovascular&schedule=OTC&search=atorva
 */
router.get('/', async (req, res) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const schedule = typeof req.query.schedule === 'string' ? req.query.schedule : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const cacheKey = catalogCacheKey(category, schedule, search);

    // Check cache first
    const cached = await getCached(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(JSON.parse(cached) as { data: typeof Medicine[]; count: number });
      return;
    }

    // Build query filter
    const filter: Record<string, unknown> = {};
    if (category) {
      filter.category = category;
    }
    if (schedule) {
      filter.schedule = { $regex: schedule, $options: 'i' };
    }
    if (search) {
      filter.$or = [
        { brandName: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { bioequivalentTo: { $regex: search, $options: 'i' } },
      ];
    }

    const medicines = await Medicine.find(filter).lean();
    const payload = { data: medicines, count: medicines.length };

    // Cache result
    await setCached(cacheKey, JSON.stringify(payload), 60);
    res.setHeader('X-Cache', 'MISS');
    res.json(payload);
  } catch (error) {
    console.error('Error fetching medicines:', error);
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
});

/**
 * GET /api/medicines/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      res.status(404).json({ error: 'Medicine not found' });
      return;
    }

    // Attach pharmacy offers
    const offers = await PharmacyOffer.find({ medicineId: req.params.id }).lean();
    const responseData = {
      ...medicine.toObject(),
      pharmacyOffers: offers,
    };

    res.json({ data: responseData });
  } catch (error) {
    console.error('Error fetching medicine:', error);
    res.status(500).json({ error: 'Failed to fetch medicine' });
  }
});

/**
 * GET /api/medicines/:id/offers
 */
router.get('/:id/offers', async (req, res) => {
  try {
    const offers = await PharmacyOffer.find({ medicineId: req.params.id })
      .sort({ discountedPrice: 1 })
      .lean();

    res.json({ data: offers, count: offers.length });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

export default router;
