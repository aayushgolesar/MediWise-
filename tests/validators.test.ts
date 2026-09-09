import { describe, it, expect } from 'vitest';
import {
  validateAbhaId,
  validatePharmacistRegNo,
  validateCdscoLicense,
  verifyLuhn,
} from '../server/validators.js';

describe('Regulatory Validators (Phase 6 Unit Coverage)', () => {
  describe('Luhn Mod-10 Checksum Algorithm', () => {
    it('correctly verifies valid Luhn numbers', () => {
      expect(verifyLuhn('79927398713')).toBe(true);
      expect(verifyLuhn('49927398716')).toBe(true);
      expect(verifyLuhn('12345678123451')).toBe(true);
    });

    it('rejects invalid Luhn checksum numbers', () => {
      expect(verifyLuhn('79927398710')).toBe(false);
      expect(verifyLuhn('12345678901234')).toBe(false);
      expect(verifyLuhn('abc1234')).toBe(false);
    });
  });

  describe('ABHA ID Validator (validateAbhaId)', () => {
    it('validates correct 14-digit ABHA numbers with Luhn check', () => {
      // 12345678123451 has valid Luhn
      const res = validateAbhaId('12-3456-7812-3451');
      expect(res.valid).toBe(true);
      expect(res.normalized).toBe('12-3456-7812-3451');
    });

    it('validates 14-digit unhyphenated ABHA numbers and normalizes them', () => {
      const res = validateAbhaId('12345678123451');
      expect(res.valid).toBe(true);
      expect(res.normalized).toBe('12-3456-7812-3451');
    });

    it('validates ABDM handle addresses ending in @abdm, @sbx, or @ndhm', () => {
      const res1 = validateAbhaId('anika.sharma@abdm');
      expect(res1.valid).toBe(true);
      expect(res1.normalized).toBe('anika.sharma@abdm');

      const res2 = validateAbhaId('rahul_verma@sbx');
      expect(res2.valid).toBe(true);
      expect(res2.normalized).toBe('rahul_verma@sbx');

      const res3 = validateAbhaId('priya-patel@ndhm');
      expect(res3.valid).toBe(true);
      expect(res3.normalized).toBe('priya-patel@ndhm');
    });

    it('rejects malformed ABHA numbers and handles', () => {
      expect(validateAbhaId('').valid).toBe(false);
      expect(validateAbhaId('12345').valid).toBe(false);
      expect(validateAbhaId('invalid@gmail.com').valid).toBe(false);
      // Fails Luhn check
      expect(validateAbhaId('99-9999-9999-9999').valid).toBe(false);
    });
  });

  describe('Pharmacist Registration Number Validator (validatePharmacistRegNo)', () => {
    it('accepts valid State Pharmacy Council formats', () => {
      const samples = [
        'KSPC-48192-A',
        'MH-54321',
        'TSPC-120934-R',
        'DL-PH-3921',
        'TNSPC-99120',
      ];
      for (const sample of samples) {
        const result = validatePharmacistRegNo(sample);
        expect(result.valid).toBe(true);
        expect(result.normalized).toBe(sample.toUpperCase());
      }
    });

    it('rejects invalid or blank council registration numbers', () => {
      expect(validatePharmacistRegNo('').valid).toBe(false);
      expect(validatePharmacistRegNo('12345').valid).toBe(false);
      expect(validatePharmacistRegNo('INVALID COUNCIL CODE 123').valid).toBe(false);
    });
  });

  describe('CDSCO License Number Validator (validateCdscoLicense)', () => {
    it('accepts valid CDSCO Form 20B and 21B drug licenses', () => {
      const validLicenses = [
        'KA-BLR-20B-10928',
        'MH-MUM-21B-44019',
        'DL-NZ-20B-78190',
        'TS-HYD-21B-129481',
      ];
      for (const lic of validLicenses) {
        const result = validateCdscoLicense(lic);
        expect(result.valid).toBe(true);
        expect(result.normalized).toBe(lic.toUpperCase());
      }
    });

    it('rejects non-compliant license strings', () => {
      expect(validateCdscoLicense('').valid).toBe(false);
      expect(validateCdscoLicense('RANDOM-LICENSE-1234').valid).toBe(false);
      expect(validateCdscoLicense('KA-BLR-99X-12345').valid).toBe(false);
    });
  });
});
