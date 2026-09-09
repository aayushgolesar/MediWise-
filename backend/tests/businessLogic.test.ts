import { describe, it, expect } from 'vitest';
import {
  validateMedicineDispense,
  transitionEscrow,
  evaluateQuarantineTriggers,
  scoreReassignmentCandidates,
} from '../src/utils/businessLogic.js';

describe('Core Healthcare & Clearinghouse Business Logic (Phase 6)', () => {
  describe('CDSCO Drug Schedule Enforcement', () => {
    it('allows OTC purchase without prescription', () => {
      const result = validateMedicineDispense('OTC (Over The Counter)');
      expect(result.allowed).toBe(true);
      expect(result.requiresRx).toBe(false);
      expect(result.requiresRegisterEntry).toBe(false);
    });

    it('blocks Schedule H medicines when prescription is absent', () => {
      const result = validateMedicineDispense('Schedule H (Prescription Required)', null);
      expect(result.allowed).toBe(false);
      expect(result.requiresRx).toBe(true);
      expect(result.error).toContain('Schedule H medicine requires a valid prescription');
    });

    it('approves Schedule H medicines when valid prescription is present', () => {
      const rx = {
        rxId: 'rx-101',
        doctorName: 'Dr. Vivek Sharma',
        doctorRegNo: 'KMC-49210-MD',
        dosage: '10mg once daily',
        durationDays: 30,
      };
      const result = validateMedicineDispense('Schedule H (Prescription Required)', rx);
      expect(result.allowed).toBe(true);
      expect(result.requiresRx).toBe(true);
      expect(result.requiresRegisterEntry).toBe(false);
    });

    it('blocks Schedule H1 medicines if Doctor Registration Number is missing', () => {
      const invalidRx = {
        rxId: 'rx-102',
        doctorName: 'Dr. Unknown',
        doctorRegNo: '', // Missing mandatory council reg no
      };
      const result = validateMedicineDispense('Schedule H1 (Strict Rx & Register)', invalidRx);
      expect(result.allowed).toBe(false);
      expect(result.requiresRegisterEntry).toBe(true);
      expect(result.error).toContain('missing statutory Doctor Registration Number');
    });

    it('approves Schedule H1 medicines with complete doctor registration and flags register entry', () => {
      const validRx = {
        rxId: 'rx-103',
        doctorName: 'Dr. Anita Roy',
        doctorRegNo: 'MMC-78192-A',
        drugName: 'Amoxicillin + Clavulanic Acid',
      };
      const result = validateMedicineDispense('Schedule H1 (Strict Rx & Register)', validRx);
      expect(result.allowed).toBe(true);
      expect(result.requiresRx).toBe(true);
      expect(result.requiresRegisterEntry).toBe(true);
    });

    it('strictly forbids digital dispensing of Schedule X psychotropic substances', () => {
      const result = validateMedicineDispense('Schedule X');
      expect(result.allowed).toBe(false);
      expect(result.error).toContain('Schedule X narcotics and psychotropics are restricted');
    });
  });

  describe('Escrow State Machine Transitions', () => {
    it('transitions "Held in Escrow" to "Released to Pharmacy" upon customer OTP delivery confirmation', () => {
      const transition = transitionEscrow('Held in Escrow', 'DELIVERY_CONFIRMED_OTP');
      expect(transition.valid).toBe(true);
      expect(transition.to).toBe('Released to Pharmacy');
    });

    it('transitions "Held in Escrow" to "Under Dispute" upon dispute filing', () => {
      const transition = transitionEscrow('Held in Escrow', 'DISPUTE_FILED');
      expect(transition.valid).toBe(true);
      expect(transition.to).toBe('Under Dispute');
    });

    it('permits Admin Refund when order is under dispute', () => {
      const transition = transitionEscrow('Under Dispute', 'ADMIN_REFUND');
      expect(transition.valid).toBe(true);
      expect(transition.to).toBe('Refunded');
    });

    it('permits Admin Release to pharmacy when dispute is resolved in hub favor', () => {
      const transition = transitionEscrow('Under Dispute', 'ADMIN_RELEASE');
      expect(transition.valid).toBe(true);
      expect(transition.to).toBe('Released to Pharmacy');
    });

    it('prevents automatic SLA release when order is under active dispute', () => {
      const transition = transitionEscrow('Under Dispute', 'SLA_AUTO_RELEASE');
      expect(transition.valid).toBe(false);
      expect(transition.error).toContain('Cannot auto-release escrow funds while under active dispute');
    });

    it('disallows further mutations once escrow is settled or refunded', () => {
      expect(transitionEscrow('Released to Pharmacy', 'ADMIN_REFUND').valid).toBe(false);
      expect(transitionEscrow('Refunded', 'ADMIN_RELEASE').valid).toBe(false);
    });
  });

  describe('Quarantine Trigger Evaluation', () => {
    it('flags inventory with price drift exceeding 5% threshold', () => {
      const evalResult = evaluateQuarantineTriggers({
        reportedPrice: 130,
        systemFloorPrice: 100, // 30% drift
        lastHeartbeatMinutesAgo: 10,
        activeBatchRecall: false,
        cdscoLicenseExpired: false,
        slaBreachRatePercent: 2,
      });

      expect(evalResult.quarantine).toBe(true);
      expect(evalResult.discrepancyPercent).toBe(30);
      expect(evalResult.severity).toBe('Critical');
      expect(evalResult.reasons[0]).toContain('Price Drift Violation');
    });

    it('triggers critical quarantine immediately upon active batch recall notice', () => {
      const evalResult = evaluateQuarantineTriggers({
        reportedPrice: 100,
        systemFloorPrice: 100,
        lastHeartbeatMinutesAgo: 5,
        activeBatchRecall: true,
        cdscoLicenseExpired: false,
        slaBreachRatePercent: 0,
      });

      expect(evalResult.quarantine).toBe(true);
      expect(evalResult.severity).toBe('Critical');
      expect(evalResult.reasons).toContain('Batch Recall: Active CDSCO or OEM batch recall notice in effect');
    });

    it('flags inventory when last heartbeat ingestion sync is stale (> 60m)', () => {
      const evalResult = evaluateQuarantineTriggers({
        reportedPrice: 100,
        systemFloorPrice: 100,
        lastHeartbeatMinutesAgo: 95,
        activeBatchRecall: false,
        cdscoLicenseExpired: false,
        slaBreachRatePercent: 0,
      });

      expect(evalResult.quarantine).toBe(true);
      expect(evalResult.reasons[0]).toContain('Stale Ingestion Sync');
    });

    it('passes healthy hub inventory without quarantine', () => {
      const evalResult = evaluateQuarantineTriggers({
        reportedPrice: 98,
        systemFloorPrice: 100, // 2% drift <= 5%
        lastHeartbeatMinutesAgo: 12,
        activeBatchRecall: false,
        cdscoLicenseExpired: false,
        slaBreachRatePercent: 4,
      });

      expect(evalResult.quarantine).toBe(false);
      expect(evalResult.reasons.length).toBe(0);
      expect(evalResult.severity).toBe('None');
    });

    it('triggers critical quarantine when hub CDSCO license is expired', () => {
      const evalResult = evaluateQuarantineTriggers({
        reportedPrice: 100,
        systemFloorPrice: 100,
        lastHeartbeatMinutesAgo: 10,
        activeBatchRecall: false,
        cdscoLicenseExpired: true,
        slaBreachRatePercent: 0,
      });

      expect(evalResult.quarantine).toBe(true);
      expect(evalResult.severity).toBe('Critical');
      expect(evalResult.reasons[0]).toContain('License Expired');
    });

    it('triggers quarantine when hub SLA breach rate exceeds 15% allowance', () => {
      const evalResult = evaluateQuarantineTriggers({
        reportedPrice: 100,
        systemFloorPrice: 100,
        lastHeartbeatMinutesAgo: 10,
        activeBatchRecall: false,
        cdscoLicenseExpired: false,
        slaBreachRatePercent: 22,
      });

      expect(evalResult.quarantine).toBe(true);
      expect(evalResult.severity).toBe('Medium');
      expect(evalResult.reasons[0]).toContain('SLA Breach Threshold');
    });

    it('rejects unknown drug schedule strings', () => {
      const result = validateMedicineDispense('Non-existent schedule format');
      expect(result.allowed).toBe(false);
      expect(result.error).toContain('Unrecognized drug schedule');
    });

    it('handles admin refund and delivery OTP edge cases during escrow', () => {
      const refundFromHeld = transitionEscrow('Held in Escrow', 'ADMIN_REFUND');
      expect(refundFromHeld.valid).toBe(true);
      expect(refundFromHeld.to).toBe('Refunded');

      const otpUnderDispute = transitionEscrow('Under Dispute', 'DELIVERY_CONFIRMED_OTP');
      expect(otpUnderDispute.valid).toBe(false);
      expect(otpUnderDispute.error).toContain('Cannot confirm delivery OTP while order is under dispute');
    });
  });

  describe('Partner SLA Reassignment Scoring Algorithm', () => {
    const candidateHubs = [
      { hubId: 'hub-1', name: 'Apollo Indiranagar', distanceKm: 1.8, stock: 42, slaMinutes: 15 },
      { hubId: 'hub-2', name: 'MedPlus Domlur', distanceKm: 4.2, stock: 18, slaMinutes: 30 },
      { hubId: 'hub-3', name: 'Fortis Health Central', distanceKm: 18.5, stock: 90, slaMinutes: 20 }, // >15km
      { hubId: 'hub-4', name: 'Generic Meds Koramangala', distanceKm: 2.1, stock: 0, slaMinutes: 15 }, // OOS
    ];

    it('ranks nearest in-stock candidate with fastest SLA as Optimal top match', () => {
      const scored = scoreReassignmentCandidates(candidateHubs, 2, 15);
      expect(scored[0].hubId).toBe('hub-1');
      expect(scored[0].status).toBe('Optimal');
      expect(scored[0].matchScore).toBeGreaterThanOrEqual(80);
    });

    it('excludes candidate hubs that are out of stock or outside maximum radius', () => {
      const scored = scoreReassignmentCandidates(candidateHubs, 2, 15);
      const outOfStock = scored.find(c => c.hubId === 'hub-4');
      const tooFar = scored.find(c => c.hubId === 'hub-3');

      expect(outOfStock?.status).toBe('Excluded');
      expect(outOfStock?.matchScore).toBe(0);

      expect(tooFar?.status).toBe('Excluded');
      expect(tooFar?.matchScore).toBe(0);
    });
  });
});
