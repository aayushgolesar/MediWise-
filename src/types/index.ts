export type AppRole =
  | 'marketplace'
  | 'checkout'
  | 'tracking'
  | 'partner_portal'
  | 'quarantine_console'
  | 'reassignment_engine'
  | 'dispute_console'
  | 'super_admin'
  | 'oem_portal'
  | 'noor_moderation'
  | 'auth';

export type UserRole = 'patient' | 'pharmacist' | 'admin' | 'oem';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  abhaId?: string;
  pharmacyHubName?: string;
  pharmacistRegNo?: string;
  cdscoLicense?: string;
  avatarUrl?: string;
}

export interface PharmacyOffer {
  id: string;
  pharmacyName: string;
  hubId: string;
  locality: string;
  distanceKm: number;
  slaMinutes: number;
  mrp: number;
  discountedPrice: number;
  discountPercent: number;
  inStock: boolean;
  stockUnits: number;
  batchNumber: string;
  expiryDate: string;
  hologramVerified: boolean;
  licenseNumber: string;
  rating: number;
  reviewCount: number;
  savings: number;
  isRecommended?: boolean;
}

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  relation: string;
  abhaId: string;
  phone: string;
}

export interface PrescriptionAudit {
  rxId: string;
  fileName: string;
  uploadDate: string;
  doctorName: string;
  doctorRegNo: string;
  hospitalClinic: string;
  prescribedFor: string;
  dosage: string;
  durationDays: number;
  frequency: string;
  dispenseLimitQty: number;
  ocrVerified: boolean;
  scheduleCategory: 'Schedule H' | 'Schedule H1' | 'Schedule X' | 'OTC';
}

export interface OrderDetail {
  orderId: string;
  placedTime: string;
  deliveryEta: string;
  deliveryOtp: string;
  status: 'locked_escrow' | 'pharmacist_audit' | 'packaging' | 'dispatched' | 'out_for_delivery' | 'delivered';
  customer: {
    name: string;
    address: string;
    phone: string;
  };
  pharmacy: {
    name: string;
    hubId: string;
    address: string;
    license: string;
    pharmacistName: string;
    pharmacistReg: string;
  };
  courier: {
    name: string;
    phone: string;
    rating: number;
    vehicleNumber: string;
    coldChainVerified: boolean;
    currentDistanceKm: number;
  };
  medicine: {
    brandGenericName: string;
    composition: string;
    packSize: number;
    batchNumber: string;
    sealHash: string;
    price: number;
  };
  financials: {
    itemTotal: number;
    packagingTamperFee: number;
    deliveryFee: number;
    platformConvenience: number;
    genericSavings: number;
    totalPaid: number;
    escrowStatus: 'Held in Escrow' | 'Released to Pharmacy' | 'Refunded';
  };
}

export interface QuarantineItem {
  id: string;
  skuName: string;
  genericComposition: string;
  hubId: string;
  hubName: string;
  locality: string;
  reportedPrice: number;
  systemFloorPrice: number;
  discrepancyPercent: number;
  lastHeartbeatAgo: string;
  reason: 'Price Drift Violation' | 'Stale Ingestion Sync' | 'Batch Recall' | 'SLA Breach Threshold' | 'License Expired';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Quarantined' | 'Under Review' | 'Released';
}

export interface ReassignmentTask {
  orderId: string;
  patientName: string;
  medicineName: string;
  originalHub: string;
  timeRemainingSec: number;
  totalTimeoutSec: number;
  timeoutReason: 'No Pharmacist Acceptance (15m SLA)' | 'Out of Stock on Physical Pick' | 'Cold-chain Breach';
  candidateHubs: {
    hubId: string;
    name: string;
    distanceKm: number;
    stock: number;
    slaMinutes: number;
    matchScore: number;
    status: 'Optimal' | 'Secondary' | 'Excluded';
  }[];
}

export interface DisputeCase {
  caseId: string;
  orderId: string;
  customerName: string;
  medicineName: string;
  disputeType: 'Damaged Seal' | 'Wrong Batch Dispensed' | 'Tampered Blister' | 'Temperature Abuse';
  escrowAmount: number;
  customerClaimPhotoUrl: string;
  dispatchBaselinePhotoUrl: string;
  sealBarcodeExpected: string;
  sealBarcodeReported: string;
  courierGpsDuration: string;
  courierShockSpike: string;
  status: 'Pending Triage' | 'Refund Approved' | 'Dispute Rejected' | 'Hub Penalized';
}

export interface TenantHub {
  tenantId: string;
  hubName: string;
  schemaName: string;
  city: string;
  locality: string;
  dbLatencyMs: number;
  activeOrders: number;
  storageMb: number;
  cdscoLicense: string;
  status: 'Active' | 'Degraded' | 'Syncing' | 'Maintenance';
}
