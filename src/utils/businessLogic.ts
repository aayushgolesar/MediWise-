import type { Medicine, PrescriptionAudit, ReassignmentTask } from '../types/index.js';

/**
 * 1. Medicine Schedule Validation & Dispensing Rules
 * Regulated under CDSCO Drugs and Cosmetics Act 1940 & Rules 1945.
 */

export interface DispenseCheckResult {
  allowed: boolean;
  requiresRx: boolean;
  requiresRegisterEntry: boolean;
  error?: string;
  scheduleLabel: string;
}

export function validateMedicineDispense(
  schedule: Medicine['schedule'] | string,
  prescription?: Partial<PrescriptionAudit> | null
): DispenseCheckResult {
  const norm = String(schedule || '').toLowerCase();

  // Schedule X: Prohibited for standard digital marketplace clearinghouse
  if (norm.includes('schedule x')) {
    return {
      allowed: false,
      requiresRx: true,
      requiresRegisterEntry: true,
      error: 'Schedule X narcotics and psychotropics are restricted from digital clearinghouse dispensing.',
      scheduleLabel: 'Schedule X (Restricted)',
    };
  }

  // OTC: Over the counter
  if (norm.includes('otc') || norm.includes('over the counter')) {
    return {
      allowed: true,
      requiresRx: false,
      requiresRegisterEntry: false,
      scheduleLabel: 'OTC (Over The Counter)',
    };
  }

  // Schedule H1: Strict Prescription + Register entry required
  if (norm.includes('h1') || norm.includes('schedule h1')) {
    if (!prescription) {
      return {
        allowed: false,
        requiresRx: true,
        requiresRegisterEntry: true,
        error: 'Schedule H1 medicine requires a valid prescription upload and State Council register log.',
        scheduleLabel: 'Schedule H1 (Strict Rx & Register)',
      };
    }

    if (!prescription.doctorRegNo || !prescription.doctorRegNo.trim()) {
      return {
        allowed: false,
        requiresRx: true,
        requiresRegisterEntry: true,
        error: 'Prescription missing statutory Doctor Registration Number.',
        scheduleLabel: 'Schedule H1 (Strict Rx & Register)',
      };
    }

    return {
      allowed: true,
      requiresRx: true,
      requiresRegisterEntry: true,
      scheduleLabel: 'Schedule H1 (Strict Rx & Register)',
    };
  }

  // Schedule H: Prescription Required
  if (norm.includes('schedule h') || norm.includes('prescription required')) {
    if (!prescription) {
      return {
        allowed: false,
        requiresRx: true,
        requiresRegisterEntry: false,
        error: 'Schedule H medicine requires a valid prescription before dispensing.',
        scheduleLabel: 'Schedule H (Prescription Required)',
      };
    }

    return {
      allowed: true,
      requiresRx: true,
      requiresRegisterEntry: false,
      scheduleLabel: 'Schedule H (Prescription Required)',
    };
  }

  return {
    allowed: false,
    requiresRx: true,
    requiresRegisterEntry: false,
    error: `Unrecognized drug schedule classification: ${schedule}`,
    scheduleLabel: 'Unknown',
  };
}

/**
 * 2. Escrow State Machine Transitions
 */
export type EscrowStatus = 'Held in Escrow' | 'Released to Pharmacy' | 'Refunded' | 'Under Dispute';

export interface EscrowTransitionResult {
  valid: boolean;
  from: EscrowStatus;
  to: EscrowStatus;
  error?: string;
}

export function transitionEscrow(
  current: EscrowStatus,
  action: 'DELIVERY_CONFIRMED_OTP' | 'DISPUTE_FILED' | 'ADMIN_REFUND' | 'ADMIN_RELEASE' | 'SLA_AUTO_RELEASE'
): EscrowTransitionResult {
  switch (current) {
    case 'Held in Escrow':
      if (action === 'DELIVERY_CONFIRMED_OTP' || action === 'ADMIN_RELEASE' || action === 'SLA_AUTO_RELEASE') {
        return { valid: true, from: current, to: 'Released to Pharmacy' };
      }
      if (action === 'DISPUTE_FILED') {
        return { valid: true, from: current, to: 'Under Dispute' };
      }
      if (action === 'ADMIN_REFUND') {
        return { valid: true, from: current, to: 'Refunded' };
      }
      break;

    case 'Under Dispute':
      if (action === 'ADMIN_REFUND') {
        return { valid: true, from: current, to: 'Refunded' };
      }
      if (action === 'ADMIN_RELEASE') {
        return { valid: true, from: current, to: 'Released to Pharmacy' };
      }
      if (action === 'SLA_AUTO_RELEASE') {
        return { valid: false, from: current, to: current, error: 'Cannot auto-release escrow funds while under active dispute.' };
      }
      if (action === 'DELIVERY_CONFIRMED_OTP') {
        return { valid: false, from: current, to: current, error: 'Cannot confirm delivery OTP while order is under dispute.' };
      }
      break;

    case 'Released to Pharmacy':
      return { valid: false, from: current, to: current, error: 'Escrow funds already settled and released to pharmacy.' };

    case 'Refunded':
      return { valid: false, from: current, to: current, error: 'Escrow funds have already been refunded to buyer.' };
  }

  return { valid: false, from: current, to: current, error: `Invalid transition action ${action} from ${current}` };
}

/**
 * 3. Quarantine Trigger Evaluation
 * Evaluates whether inventory should be auto-quarantined.
 */
export interface QuarantineEvaluationInput {
  reportedPrice: number;
  systemFloorPrice: number;
  lastHeartbeatMinutesAgo: number;
  activeBatchRecall: boolean;
  cdscoLicenseExpired: boolean;
  slaBreachRatePercent: number;
}

export interface QuarantineEvaluationResult {
  quarantine: boolean;
  reasons: string[];
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'None';
  discrepancyPercent: number;
}

export function evaluateQuarantineTriggers(input: QuarantineEvaluationInput): QuarantineEvaluationResult {
  const reasons: string[] = [];
  let severity: QuarantineEvaluationResult['severity'] = 'None';

  // 1. Price Drift Calculation
  const priceDiff = Math.abs(input.reportedPrice - input.systemFloorPrice);
  const discrepancyPercent = input.systemFloorPrice > 0 
    ? Number(((priceDiff / input.systemFloorPrice) * 100).toFixed(2))
    : 0;

  if (discrepancyPercent > 5) {
    reasons.push(`Price Drift Violation: ${discrepancyPercent}% deviation exceeds 5% threshold`);
    severity = discrepancyPercent > 20 ? 'Critical' : 'High';
  }

  // 2. Active Batch Recall
  if (input.activeBatchRecall) {
    reasons.push('Batch Recall: Active CDSCO or OEM batch recall notice in effect');
    severity = 'Critical';
  }

  // 3. Stale Heartbeat (> 60 minutes)
  if (input.lastHeartbeatMinutesAgo > 60) {
    reasons.push(`Stale Ingestion Sync: Last heartbeat was ${input.lastHeartbeatMinutesAgo}m ago (> 60m SLA)`);
    if (severity !== 'Critical') severity = 'Medium';
  }

  // 4. CDSCO License Expired
  if (input.cdscoLicenseExpired) {
    reasons.push('License Expired: Hub CDSCO Form 20B/21B retail license has expired');
    severity = 'Critical';
  }

  // 5. Hub SLA Breach Rate > 15%
  if (input.slaBreachRatePercent > 15) {
    reasons.push(`SLA Breach Threshold: Hub SLA breach rate of ${input.slaBreachRatePercent}% exceeds 15% allowance`);
    if (severity !== 'Critical' && severity !== 'High') severity = 'Medium';
  }

  return {
    quarantine: reasons.length > 0,
    reasons,
    severity,
    discrepancyPercent,
  };
}

/**
 * 4. Reassignment Candidate Scoring Algorithm
 * Scores candidate pharmacy hubs by:
 * - Distance (closer = higher score, max 40 pts)
 * - Stock Availability (>= orderQty gives 35 pts)
 * - SLA turnaround speed (shorter = higher score, max 25 pts)
 */
export interface CandidateHubInput {
  hubId: string;
  name: string;
  distanceKm: number;
  stock: number;
  slaMinutes: number;
}

export interface ScoredCandidateHub {
  hubId: string;
  name: string;
  distanceKm: number;
  stock: number;
  slaMinutes: number;
  matchScore: number;
  status: 'Optimal' | 'Secondary' | 'Excluded';
}

export function scoreReassignmentCandidates(
  candidates: CandidateHubInput[],
  orderQty = 1,
  maxDistanceKm = 15
): ScoredCandidateHub[] {
  return candidates
    .map((c) => {
      // If out of stock or beyond max service distance, exclude
      if (c.stock < orderQty || c.distanceKm > maxDistanceKm) {
        return {
          ...c,
          matchScore: 0,
          status: 'Excluded' as const,
        };
      }

      // Distance score (0 to 40 pts)
      const distanceScore = Math.max(0, Math.round(40 * (1 - c.distanceKm / maxDistanceKm)));

      // Stock score (0 to 35 pts)
      const stockRatio = Math.min(1, c.stock / (orderQty * 5));
      const stockScore = Math.round(25 + 10 * stockRatio);

      // SLA turnaround score (0 to 25 pts: 15 min SLA gives 25 pts, 60 min SLA gives 5 pts)
      const slaScore = Math.max(0, Math.round(25 * (1 - Math.min(c.slaMinutes, 60) / 60)));

      const matchScore = Math.min(100, Math.max(0, distanceScore + stockScore + slaScore));
      const status = matchScore >= 80 ? ('Optimal' as const) : ('Secondary' as const);

      return {
        ...c,
        matchScore,
        status,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
