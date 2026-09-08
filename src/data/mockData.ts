import { PharmacyOffer, PatientProfile, PrescriptionAudit, OrderDetail, QuarantineItem, ReassignmentTask, DisputeCase, TenantHub } from '../types';

export const MEDICINE_DETAILS = {
  id: 'med-atorva-20',
  brandName: 'Atorvastatin Calcium Tablets 20mg',
  genericName: 'Atorvastatin IP',
  strength: '20 mg',
  dosageForm: 'Film-Coated Tablet',
  therapeuticCategory: 'Cardiovascular / Lipid Lowering / HMG-CoA Reductase Inhibitor',
  schedule: 'Schedule H (Prescription Required)',
  mrpReference: 245.00,
  cdscoApproved: true,
  bioequivalentVerified: true,
  indications: ['Hypercholesterolemia', 'Dyslipidemia', 'Prevention of Cardiovascular Events'],
  packOptions: [
    { count: 10, label: '10 Tablets', unitDiscount: 0.50, isRecommended: false },
    { count: 30, label: '30 Tablets (1 Month Pack)', unitDiscount: 0.54, isRecommended: true },
    { count: 60, label: '60 Tablets (2 Months Pack)', unitDiscount: 0.58, isRecommended: false },
    { count: 90, label: '90 Tablets (Quarterly Pack)', unitDiscount: 0.62, isRecommended: false },
  ]
};

export const PHARMACY_OFFERS: PharmacyOffer[] = [
  {
    id: 'offer-medplus-indiranagar',
    pharmacyName: 'MedPlus Central Indiranagar',
    hubId: 'HUB-KA-1204',
    locality: 'Indiranagar 100ft Rd, Bengaluru',
    distanceKm: 1.4,
    slaMinutes: 45,
    mrp: 245.00,
    discountedPrice: 112.50,
    discountPercent: 54,
    inStock: true,
    stockUnits: 84,
    batchNumber: 'MP-8849-B',
    expiryDate: '11/2027',
    hologramVerified: true,
    licenseNumber: 'KA-B2-094182',
    rating: 4.85,
    reviewCount: 1420,
    savings: 132.50,
    isRecommended: true
  },
  {
    id: 'offer-apollo-100ft',
    pharmacyName: 'Apollo Care 24/7 Indiranagar',
    hubId: 'HUB-KA-1198',
    locality: '12th Main Road, Bengaluru',
    distanceKm: 2.1,
    slaMinutes: 35,
    mrp: 245.00,
    discountedPrice: 118.00,
    discountPercent: 52,
    inStock: true,
    stockUnits: 42,
    batchNumber: 'AP-9921-A',
    expiryDate: '09/2027',
    hologramVerified: true,
    licenseNumber: 'KA-B1-081290',
    rating: 4.78,
    reviewCount: 980,
    savings: 127.00
  },
  {
    id: 'offer-wellness-koramangala',
    pharmacyName: 'Wellness Forever Express',
    hubId: 'HUB-KA-1340',
    locality: '80 Feet Road, Koramangala, Bengaluru',
    distanceKm: 3.8,
    slaMinutes: 60,
    mrp: 245.00,
    discountedPrice: 124.00,
    discountPercent: 49,
    inStock: true,
    stockUnits: 65,
    batchNumber: 'WF-7710-C',
    expiryDate: '01/2028',
    hologramVerified: true,
    licenseNumber: 'KA-B3-044192',
    rating: 4.70,
    reviewCount: 620,
    savings: 121.00
  }
];

export const PATIENTS: PatientProfile[] = [
  {
    id: 'pat-1',
    name: 'Anika Sharma',
    age: 48,
    gender: 'Female',
    relation: 'Self',
    abhaId: '91-4819-2041-9921',
    phone: '+91 98450 91283'
  },
  {
    id: 'pat-2',
    name: 'Ravi Sharma',
    age: 52,
    gender: 'Male',
    relation: 'Spouse',
    abhaId: '91-3829-1102-8841',
    phone: '+91 98450 11942'
  }
];

export const INITIAL_PRESCRIPTION: PrescriptionAudit = {
  rxId: 'RX-2026-88912',
  fileName: 'Dr_Sharma_Prescription_Aug2026.pdf',
  uploadDate: '28 Aug 2026, 11:30 AM',
  doctorName: 'Dr. Rajesh Iyer, M.D. (Cardiology)',
  doctorRegNo: 'KMC-48192 / MCI-2009',
  hospitalClinic: 'Manipal Heart Institute & Cardiology Clinic',
  prescribedFor: 'Anika Sharma (48y / F)',
  dosage: 'Tab. Atorvastatin 20mg',
  durationDays: 30,
  frequency: '1 tablet once daily at bedtime (HS)',
  dispenseLimitQty: 30,
  ocrVerified: true,
  scheduleCategory: 'Schedule H1'
};

export const INITIAL_ORDER: OrderDetail = {
  orderId: 'MW-89421-BLR',
  placedTime: '02:14 PM, Today',
  deliveryEta: '05:45 PM (Guaranteed 45-min SLA window)',
  deliveryOtp: '4921',
  status: 'out_for_delivery',
  customer: {
    name: 'Anika Sharma',
    address: 'Flat 402, Greenfield Heights, 12th Main, Indiranagar, Bengaluru - 560038',
    phone: '+91 98450 91283'
  },
  pharmacy: {
    name: 'MedPlus Central Indiranagar',
    hubId: 'HUB-KA-1204',
    address: 'Shop 14/A, 100 Feet Road, Indiranagar, Bengaluru',
    license: 'KA-B2-094182 / Form 20B/21B',
    pharmacistName: 'Dr. K. Ramesh (B.Pharm)',
    pharmacistReg: 'KSPC-Reg-#KA-7729'
  },
  courier: {
    name: 'Suresh Kumar',
    phone: '+91 99801 44102',
    rating: 4.92,
    vehicleNumber: 'KA-03-EM-8819 (Electric EV)',
    coldChainVerified: true,
    currentDistanceKm: 1.1
  },
  medicine: {
    brandGenericName: 'Atorvastatin Calcium Tablets 20mg (Cipla Generic)',
    composition: 'Atorvastatin IP 20mg Equivalent',
    packSize: 30,
    batchNumber: 'MP-8849-B',
    sealHash: '0x88FA92B487A64C2E991F421A',
    price: 112.50
  },
  financials: {
    itemTotal: 112.50,
    packagingTamperFee: 12.00,
    deliveryFee: 15.00,
    platformConvenience: 5.00,
    genericSavings: 189.50,
    totalPaid: 133.50,
    escrowStatus: 'Held in Escrow'
  }
};

export const QUARANTINE_ITEMS: QuarantineItem[] = [
  {
    id: 'Q-901',
    skuName: 'Paracetamol 650mg Tabs',
    genericComposition: 'Paracetamol IP 650mg',
    hubId: 'HUB-KA-1422',
    hubName: 'Apollo Koramangala 5th Block',
    locality: 'Koramangala, Bengaluru',
    reportedPrice: 14.50,
    systemFloorPrice: 22.00,
    discrepancyPercent: -34.1,
    lastHeartbeatAgo: '2m ago',
    reason: 'Price Drift Violation',
    severity: 'High',
    status: 'Quarantined'
  },
  {
    id: 'Q-902',
    skuName: 'Atorvastatin 20mg Tabs',
    genericComposition: 'Atorvastatin IP 20mg',
    hubId: 'HUB-KA-1102',
    hubName: 'HealthPlus Pharmacy Jayanagar',
    locality: 'Jayanagar, Bengaluru',
    reportedPrice: 85.00,
    systemFloorPrice: 110.00,
    discrepancyPercent: -22.7,
    lastHeartbeatAgo: '14m ago',
    reason: 'Stale Ingestion Sync',
    severity: 'Medium',
    status: 'Under Review'
  },
  {
    id: 'Q-903',
    skuName: 'Pantoprazole 40mg Gastro-Resistant',
    genericComposition: 'Pantoprazole Sodium 40mg',
    hubId: 'HUB-KA-1289',
    hubName: 'MedPlus HSR Layout Sector 2',
    locality: 'HSR Layout, Bengaluru',
    reportedPrice: 48.00,
    systemFloorPrice: 48.00,
    discrepancyPercent: 0.0,
    lastHeartbeatAgo: '41m ago',
    reason: 'SLA Breach Threshold',
    severity: 'Critical',
    status: 'Quarantined'
  },
  {
    id: 'Q-904',
    skuName: 'Amoxicillin 500mg Trihydrate Caps',
    genericComposition: 'Amoxicillin Trihydrate 500mg',
    hubId: 'HUB-KA-1055',
    hubName: 'Wellness Whitefield ITPL',
    locality: 'Whitefield, Bengaluru',
    reportedPrice: 72.00,
    systemFloorPrice: 70.00,
    discrepancyPercent: 2.8,
    lastHeartbeatAgo: '6m ago',
    reason: 'Batch Recall',
    severity: 'Critical',
    status: 'Quarantined'
  },
  {
    id: 'Q-905',
    skuName: 'Metformin Hydrochloride 500mg SR',
    genericComposition: 'Metformin HCl 500mg Sustained Release',
    hubId: 'HUB-KA-1380',
    hubName: 'Relief Chemist Malleshwaram',
    locality: 'Malleshwaram, Bengaluru',
    reportedPrice: 18.00,
    systemFloorPrice: 19.50,
    discrepancyPercent: -7.6,
    lastHeartbeatAgo: '58m ago',
    reason: 'Stale Ingestion Sync',
    severity: 'Low',
    status: 'Under Review'
  },
  {
    id: 'Q-906',
    skuName: 'Azithromycin 500mg Tablets',
    genericComposition: 'Azithromycin Dihydrate 500mg',
    hubId: 'HUB-KA-1204',
    hubName: 'MedPlus Central Indiranagar',
    locality: 'Indiranagar, Bengaluru',
    reportedPrice: 110.00,
    systemFloorPrice: 108.00,
    discrepancyPercent: 1.8,
    lastHeartbeatAgo: '1m ago',
    reason: 'License Expired',
    severity: 'High',
    status: 'Released'
  }
];

export const REASSIGNMENT_TASK: ReassignmentTask = {
  orderId: 'MW-89421-BLR',
  patientName: 'Anika Sharma',
  medicineName: 'Atorvastatin 20mg (30 Tabs)',
  originalHub: 'MedPlus Indiranagar Hub #KA-1204',
  timeRemainingSec: 161,
  totalTimeoutSec: 900,
  timeoutReason: 'No Pharmacist Acceptance (15m SLA)',
  candidateHubs: [
    {
      hubId: 'HUB-KA-1198',
      name: 'Apollo Care 24/7 Indiranagar',
      distanceKm: 2.1,
      stock: 42,
      slaMinutes: 35,
      matchScore: 98.9,
      status: 'Optimal'
    },
    {
      hubId: 'HUB-KA-1340',
      name: 'Wellness Forever Koramangala',
      distanceKm: 3.8,
      stock: 65,
      slaMinutes: 45,
      matchScore: 91.2,
      status: 'Secondary'
    },
    {
      hubId: 'HUB-KA-1290',
      name: 'MedPlus Domlur Flyover Hub',
      distanceKm: 4.4,
      stock: 19,
      slaMinutes: 50,
      matchScore: 87.5,
      status: 'Secondary'
    }
  ]
};

export const DISPUTE_CASE_SAMPLE: DisputeCase = {
  caseId: 'DSP-4091',
  orderId: 'MW-89421-BLR',
  customerName: 'Anika Sharma',
  medicineName: 'Atorvastatin Calcium 20mg (30 Tabs)',
  disputeType: 'Damaged Seal',
  escrowAmount: 133.50,
  customerClaimPhotoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
  dispatchBaselinePhotoUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
  sealBarcodeExpected: 'HOLO-8849-21-KA-1204',
  sealBarcodeReported: 'HOLO-8849-21-KA-1204 (TORN/BROKEN)',
  courierGpsDuration: '2 mins 14 secs at doorstep',
  courierShockSpike: '1.24g shock sensor alert logged at 02:38 PM',
  status: 'Pending Triage'
};

export const TENANT_HUBS_SAMPLE: TenantHub[] = [
  {
    tenantId: 'TNT-KA-1204',
    hubName: 'MedPlus Indiranagar Hub',
    schemaName: 'hub_medplus_blr_1204',
    city: 'Bengaluru',
    locality: 'Indiranagar 100ft Rd',
    dbLatencyMs: 14,
    activeOrders: 28,
    storageMb: 412,
    cdscoLicense: 'KA-B2-094182',
    status: 'Active'
  },
  {
    tenantId: 'TNT-KA-1198',
    hubName: 'Apollo Care 24/7 Indiranagar',
    schemaName: 'hub_apollo_blr_1198',
    city: 'Bengaluru',
    locality: '12th Main Road',
    dbLatencyMs: 11,
    activeOrders: 44,
    storageMb: 618,
    cdscoLicense: 'KA-B1-081290',
    status: 'Active'
  },
  {
    tenantId: 'TNT-KA-1340',
    hubName: 'Wellness Forever Koramangala',
    schemaName: 'hub_wellness_blr_1340',
    city: 'Bengaluru',
    locality: '80 Feet Road',
    dbLatencyMs: 19,
    activeOrders: 19,
    storageMb: 320,
    cdscoLicense: 'KA-B3-044192',
    status: 'Active'
  },
  {
    tenantId: 'TNT-MH-2001',
    hubName: 'Noble Chemists Bandra West',
    schemaName: 'hub_noble_mum_2001',
    city: 'Mumbai',
    locality: 'Hill Road, Bandra',
    dbLatencyMs: 24,
    activeOrders: 35,
    storageMb: 580,
    cdscoLicense: 'MH-MZ2-48192',
    status: 'Active'
  },
  {
    tenantId: 'TNT-DL-3042',
    hubName: 'Fortis Health Central Connaught',
    schemaName: 'hub_fortis_del_3042',
    city: 'New Delhi',
    locality: 'Connaught Place Outer Circle',
    dbLatencyMs: 38,
    activeOrders: 12,
    storageMb: 240,
    cdscoLicense: 'DL-NC-99120',
    status: 'Syncing'
  }
];

export const NOOR_INTERCEPT_SESSION = {
  sessionId: 'ESC-49102',
  patientName: 'Anika Sharma',
  medicineTarget: 'Atorvastatin 20mg',
  userPrompt: 'I missed taking my tablet yesterday night. Should I take 2 tablets together tonight to catch up on the missed dose?',
  guardrailTriggered: 'FR-SUP-02: Clinical Advice Refusal & Statins Overdose Prevention',
  riskLevel: 'HIGH_RISK_DOUBLE_DOSE',
  botSystemResponse: 'Statutory Safety Directive: Never double up on your statin dosage. Taking two 20mg tablets together (40mg unmonitored) carries a risk of acute rhabdomyolysis and hepatic enzyme elevation. Please take your single prescribed 20mg dose tonight at your regular bedtime and contact Dr. Rajesh Iyer for persistent missed dose guidance.',
  recommendedActions: [
    'Insert Doctor Tele-Referral Card',
    'Log Intercept to Clinical Moderation Stream',
    'Escalate to Registered Pharmacist K. Ramesh'
  ]
};
