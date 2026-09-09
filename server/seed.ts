/**
 * seed.ts — Populates the MediWise SQLite database from mockData.ts
 * Run once: npx tsx server/seed.ts
 * Idempotent: uses INSERT OR REPLACE so it's safe to re-run.
 */

import db from './db.js';
import {
  MEDICINES_CATALOG,
  PATIENTS,
  INITIAL_PRESCRIPTION,
  INITIAL_ORDER,
  QUARANTINE_ITEMS,
  REASSIGNMENT_TASK,
  DISPUTE_CASE_SAMPLE,
  TENANT_HUBS_SAMPLE,
  NOOR_INTERCEPT_SESSION,
} from '../src/data/mockData.js';
import { randomUUID } from 'crypto';
import { hashPassword } from './security.js';

console.log('🌱 Seeding MediWise database…');

const DEMO_PASSWORD = 'MediWiseDemo2026!';
const insertUser = db.prepare(`
  INSERT OR REPLACE INTO users (id, name, email, phone, password_hash, role, abha_id, pharmacy_hub_name, pharmacist_reg_no, cdsco_license)
  VALUES (@id, @name, @email, @phone, @passwordHash, @role, @abhaId, @pharmacyHubName, @pharmacistRegNo, @cdscoLicense)
`);
for (const user of [
  { id: 'usr-pat-01', name: 'Anika Sharma', email: 'anika.sharma@example.com', phone: '+91 98841 20492', role: 'patient', abhaId: '91-4821-9920-1123@abdm', pharmacyHubName: null, pharmacistRegNo: null, cdscoLicense: null },
  { id: 'usr-pharm-01', name: 'K. Ramesh, B.Pharm', email: 'ramesh@medplus.example', phone: '+91 98841 20493', role: 'pharmacist', abhaId: null, pharmacyHubName: 'MedPlus Central Indiranagar', pharmacistRegNo: 'KSPC-48192-A', cdscoLicense: 'KA-BLR-20B-10928' },
  { id: 'usr-admin-01', name: 'Dr. Vikram Roy', email: 'admin@mediwise.example', phone: '+91 98841 20494', role: 'admin', abhaId: null, pharmacyHubName: null, pharmacistRegNo: null, cdscoLicense: null },
  { id: 'usr-oem-01', name: 'Cipla Enterprise Rep', email: 'rajiv.mehta@cipla.com', phone: '+91 99201 44819', role: 'oem', abhaId: null, pharmacyHubName: null, pharmacistRegNo: null, cdscoLicense: null },
]) {
  insertUser.run({ ...user, passwordHash: hashPassword(DEMO_PASSWORD) });
}
console.log('  ✅ 4 secured demo users');

// ─── Tenant Hubs ─────────────────────────────────────────────────────────────
const insertHub = db.prepare(`
  INSERT OR REPLACE INTO tenant_hubs
    (tenant_id, hub_name, schema_name, city, locality, db_latency_ms, active_orders, storage_mb, cdsco_license, status)
  VALUES
    (@tenantId, @hubName, @schemaName, @city, @locality, @dbLatencyMs, @activeOrders, @storageMb, @cdscoLicense, @status)
`);

for (const hub of TENANT_HUBS_SAMPLE) {
  insertHub.run(hub);
}
console.log(`  ✅ ${TENANT_HUBS_SAMPLE.length} tenant hubs`);

// ─── Medicines & Pharmacy Offers ─────────────────────────────────────────────
const insertMedicine = db.prepare(`
  INSERT OR REPLACE INTO medicines
    (id, brand_name, generic_name, strength, dosage_form, therapeutic_category, category,
     schedule, mrp_reference, starting_price, discount_percent, cdsco_approved,
     bioequivalent_verified, bioequivalent_to, in_stock, stock_count, hub_count,
     indications, description, pack_options)
  VALUES
    (@id, @brand_name, @generic_name, @strength, @dosage_form, @therapeutic_category,
     @category, @schedule, @mrp_reference, @starting_price, @discount_percent,
     @cdsco_approved, @bioequivalent_verified, @bioequivalent_to, @in_stock,
     @stock_count, @hub_count, @indications, @description, @pack_options)
`);

const insertOffer = db.prepare(`
  INSERT OR REPLACE INTO pharmacy_offers
    (id, medicine_id, pharmacy_name, hub_id, locality, distance_km, sla_minutes,
     mrp, discounted_price, discount_percent, in_stock, stock_units, batch_number,
     expiry_date, hologram_verified, license_number, rating, review_count, savings, is_recommended)
  VALUES
    (@id, @medicine_id, @pharmacy_name, @hub_id, @locality, @distance_km, @sla_minutes,
     @mrp, @discounted_price, @discount_percent, @in_stock, @stock_units, @batch_number,
     @expiry_date, @hologram_verified, @license_number, @rating, @review_count, @savings, @is_recommended)
`);

const seedMedicines = db.transaction(() => {
  for (const med of MEDICINES_CATALOG) {
    insertMedicine.run({
      id: med.id,
      brand_name: med.brandName,
      generic_name: med.genericName,
      strength: med.strength,
      dosage_form: med.dosageForm,
      therapeutic_category: med.therapeuticCategory,
      category: med.category,
      schedule: med.schedule,
      mrp_reference: med.mrpReference,
      starting_price: med.startingPrice,
      discount_percent: med.discountPercent,
      cdsco_approved: med.cdscoApproved ? 1 : 0,
      bioequivalent_verified: med.bioequivalentVerified ? 1 : 0,
      bioequivalent_to: med.bioequivalentTo,
      in_stock: med.inStock ? 1 : 0,
      stock_count: med.stockCount,
      hub_count: med.hubCount,
      indications: JSON.stringify(med.indications),
      description: med.description,
      pack_options: JSON.stringify(med.packOptions),
    });

    for (const offer of med.pharmacyOffers) {
      insertOffer.run({
        id: offer.id,
        medicine_id: med.id,
        pharmacy_name: offer.pharmacyName,
        hub_id: offer.hubId,
        locality: offer.locality,
        distance_km: offer.distanceKm,
        sla_minutes: offer.slaMinutes,
        mrp: offer.mrp,
        discounted_price: offer.discountedPrice,
        discount_percent: offer.discountPercent,
        in_stock: offer.inStock ? 1 : 0,
        stock_units: offer.stockUnits,
        batch_number: offer.batchNumber,
        expiry_date: offer.expiryDate,
        hologram_verified: offer.hologramVerified ? 1 : 0,
        license_number: offer.licenseNumber,
        rating: offer.rating,
        review_count: offer.reviewCount,
        savings: offer.savings,
        is_recommended: offer.isRecommended ? 1 : 0,
      });
    }
  }
});

seedMedicines();
console.log(`  ✅ ${MEDICINES_CATALOG.length} medicines + ${MEDICINES_CATALOG.flatMap(m => m.pharmacyOffers).length} pharmacy offers`);

// ─── Patients ─────────────────────────────────────────────────────────────────
const insertPatient = db.prepare(`
  INSERT OR REPLACE INTO patients (id, user_id, name, age, gender, relation, abha_id, phone)
  VALUES (@id, NULL, @name, @age, @gender, @relation, @abhaId, @phone)
`);

for (const p of PATIENTS) {
  insertPatient.run(p);
}
console.log(`  ✅ ${PATIENTS.length} patients`);

// ─── Prescription Audit ────────────────────────────────────────────────────────
const insertRx = db.prepare(`
  INSERT OR REPLACE INTO prescription_audits
    (rx_id, order_id, file_name, upload_date, doctor_name, doctor_reg_no,
     hospital_clinic, prescribed_for, drug_name, dosage, duration_days, frequency,
     dispense_limit, ocr_verified, needs_pharmacist_review, confidence_json, schedule_category)
  VALUES
    (@rxId, @orderId, @fileName, @uploadDate, @doctorName, @doctorRegNo,
     @hospitalClinic, @prescribedFor, @drugName, @dosage, @durationDays, @frequency,
     @dispenseLimitQty, @ocrVerified, @needsPharmacistReview, @confidenceJson, @scheduleCategory)
`);
insertRx.run({
  ...INITIAL_PRESCRIPTION,
  orderId: INITIAL_ORDER.orderId,
  drugName: INITIAL_PRESCRIPTION.drugName ?? 'Atorvastatin Calcium 20 mg',
  ocrVerified: INITIAL_PRESCRIPTION.ocrVerified ? 1 : 0,
  needsPharmacistReview: INITIAL_PRESCRIPTION.needsPharmacistReview ? 1 : 0,
  confidenceJson: JSON.stringify(INITIAL_PRESCRIPTION.fieldConfidence ?? {}),
});
console.log('  ✅ 1 prescription audit');

// ─── Initial Order ─────────────────────────────────────────────────────────────
const insertOrder = db.prepare(`
  INSERT OR REPLACE INTO orders
    (order_id, placed_time, delivery_eta, delivery_otp, status,
     customer_name, customer_address, customer_phone,
     pharmacy_name, pharmacy_hub_id, pharmacy_address, pharmacy_license, pharmacist_name, pharmacist_reg,
     courier_name, courier_phone, courier_rating, vehicle_number, cold_chain_verified, current_distance_km,
     medicine_name, composition, pack_size, batch_number, seal_hash, price,
     item_total, packaging_tamper_fee, delivery_fee, platform_convenience, generic_savings, total_paid, escrow_status)
  VALUES
    (@orderId, @placedTime, @deliveryEta, @deliveryOtp, @status,
     @customerName, @customerAddress, @customerPhone,
     @pharmacyName, @pharmacyHubId, @pharmacyAddress, @pharmacyLicense, @pharmacistName, @pharmacistReg,
     @courierName, @courierPhone, @courierRating, @vehicleNumber, @coldChainVerified, @currentDistanceKm,
     @medicineName, @composition, @packSize, @batchNumber, @sealHash, @price,
     @itemTotal, @packagingTamperFee, @deliveryFee, @platformConvenience, @genericSavings, @totalPaid, @escrowStatus)
`);

const o = INITIAL_ORDER;
insertOrder.run({
  orderId: o.orderId, placedTime: o.placedTime, deliveryEta: o.deliveryEta,
  deliveryOtp: o.deliveryOtp, status: o.status,
  customerName: o.customer.name, customerAddress: o.customer.address, customerPhone: o.customer.phone,
  pharmacyName: o.pharmacy.name, pharmacyHubId: o.pharmacy.hubId, pharmacyAddress: o.pharmacy.address,
  pharmacyLicense: o.pharmacy.license, pharmacistName: o.pharmacy.pharmacistName, pharmacistReg: o.pharmacy.pharmacistReg,
  courierName: o.courier.name, courierPhone: o.courier.phone, courierRating: o.courier.rating,
  vehicleNumber: o.courier.vehicleNumber, coldChainVerified: o.courier.coldChainVerified ? 1 : 0,
  currentDistanceKm: o.courier.currentDistanceKm,
  medicineName: o.medicine.brandGenericName, composition: o.medicine.composition,
  packSize: o.medicine.packSize, batchNumber: o.medicine.batchNumber, sealHash: o.medicine.sealHash, price: o.medicine.price,
  itemTotal: o.financials.itemTotal, packagingTamperFee: o.financials.packagingTamperFee,
  deliveryFee: o.financials.deliveryFee, platformConvenience: o.financials.platformConvenience,
  genericSavings: o.financials.genericSavings, totalPaid: o.financials.totalPaid,
  escrowStatus: o.financials.escrowStatus,
});
console.log('  ✅ 1 order');

// ─── Quarantine Items ─────────────────────────────────────────────────────────
const insertQ = db.prepare(`
  INSERT OR REPLACE INTO quarantine_items
    (id, sku_name, generic_composition, hub_id, hub_name, locality,
     reported_price, system_floor_price, discrepancy_percent, last_heartbeat_ago, reason, severity, status)
  VALUES
    (@id, @skuName, @genericComposition, @hubId, @hubName, @locality,
     @reportedPrice, @systemFloorPrice, @discrepancyPercent, @lastHeartbeatAgo, @reason, @severity, @status)
`);
for (const q of QUARANTINE_ITEMS) { insertQ.run(q); }
console.log(`  ✅ ${QUARANTINE_ITEMS.length} quarantine items`);

// ─── Reassignment Task ────────────────────────────────────────────────────────
const insertRT = db.prepare(`
  INSERT OR REPLACE INTO reassignment_tasks
    (order_id, patient_name, medicine_name, original_hub, time_remaining_sec, total_timeout_sec, timeout_reason, candidate_hubs)
  VALUES
    (@orderId, @patientName, @medicineName, @originalHub, @timeRemainingSec, @totalTimeoutSec, @timeoutReason, @candidateHubs)
`);
insertRT.run({ ...REASSIGNMENT_TASK, candidateHubs: JSON.stringify(REASSIGNMENT_TASK.candidateHubs) });
console.log('  ✅ 1 reassignment task');

// ─── Dispute Case ─────────────────────────────────────────────────────────────
const insertD = db.prepare(`
  INSERT OR REPLACE INTO dispute_cases
    (case_id, order_id, customer_name, medicine_name, dispute_type, escrow_amount,
     customer_claim_photo_url, dispatch_baseline_url, seal_barcode_expected, seal_barcode_reported,
     courier_gps_duration, courier_shock_spike, status)
  VALUES
    (@caseId, @orderId, @customerName, @medicineName, @disputeType, @escrowAmount,
     @customerClaimPhotoUrl, @dispatchBaselinePhotoUrl, @sealBarcodeExpected, @sealBarcodeReported,
     @courierGpsDuration, @courierShockSpike, @status)
`);
insertD.run(DISPUTE_CASE_SAMPLE);
console.log('  ✅ 1 dispute case');

// ─── Noor Moderation Log ──────────────────────────────────────────────────────
const insertNoor = db.prepare(`
  INSERT OR REPLACE INTO noor_moderation_log
    (id, session_id, patient_name, user_prompt, bot_response, guardrail_fired, risk_level)
  VALUES
    (@id, @sessionId, @patientName, @userPrompt, @botResponse, @guardrailFired, @riskLevel)
`);
insertNoor.run({
  id: randomUUID(),
  sessionId: NOOR_INTERCEPT_SESSION.sessionId,
  patientName: NOOR_INTERCEPT_SESSION.patientName,
  userPrompt: NOOR_INTERCEPT_SESSION.userPrompt,
  botResponse: NOOR_INTERCEPT_SESSION.botSystemResponse,
  guardrailFired: 1,
  riskLevel: NOOR_INTERCEPT_SESSION.riskLevel,
});
console.log('  ✅ 1 Noor moderation log entry');

console.log('\n🎉 Seed complete! Database ready at:', process.env.DB_PATH ?? './mediwise.db');
