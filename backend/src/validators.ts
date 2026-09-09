/**
 * Regulatory validation routines for Indian digital health compliance:
 * 1. ABHA ID (Ayushman Bharat Health Account) — 14-digit format or @abdm handle
 * 2. State Pharmacy Council Registration Number
 * 3. CDSCO Retail / Wholesale Drug Sales License (Form 20B / Form 21B)
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  normalized?: string;
}

/**
 * Standard Luhn Mod-10 Checksum Algorithm.
 * Used for verifying check-digits on Indian National ID numbers and ABHA 14-digit numeric IDs.
 */
export function verifyLuhn(digitsOnly: string): boolean {
  if (!/^\d+$/.test(digitsOnly)) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digitsOnly.length - 1; i >= 0; i--) {
    let digit = parseInt(digitsOnly.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/**
 * Validates Ayushman Bharat Health Account (ABHA) IDs.
 * Accepts:
 * - 14-digit numeric string with or without hyphens: "91-4821-9920-1123" or "91482199201123"
 * - ABHA Address handle: "username@abdm" or "user.name@sbx"
 */
export function validateAbhaId(abha: string): ValidationResult {
  if (!abha || typeof abha !== 'string') {
    return { valid: false, error: 'ABHA ID is required.' };
  }

  const trimmed = abha.trim();

  // Pattern 1: ABHA Address handle (e.g. anika@abdm, anika.sharma@abdm)
  if (trimmed.includes('@')) {
    const handleRegex = /^[a-zA-Z0-9._-]{4,32}@(abdm|sbx|ndhm)$/i;
    if (handleRegex.test(trimmed)) {
      return { valid: true, normalized: trimmed.toLowerCase() };
    }
    return {
      valid: false,
      error: 'Invalid ABHA address handle. Must be 4-32 characters ending with @abdm, @sbx, or @ndhm.',
    };
  }

  // Pattern 2: 14-digit ABHA Number (e.g. 91-4821-9920-1123 or 91482199201123)
  const cleanDigits = trimmed.replace(/[-\s]/g, '');
  if (!/^\d{14}$/.test(cleanDigits)) {
    return {
      valid: false,
      error: 'ABHA Number must be exactly 14 digits (e.g. 91-4821-9920-1123) or a valid @abdm address.',
    };
  }

  // Verify Luhn Checksum
  if (!verifyLuhn(cleanDigits)) {
    return {
      valid: false,
      error: 'ABHA 14-digit checksum failed. Please ensure the number is accurate.',
    };
  }

  const formatted = `${cleanDigits.slice(0, 2)}-${cleanDigits.slice(2, 6)}-${cleanDigits.slice(6, 10)}-${cleanDigits.slice(10, 14)}`;
  return { valid: true, normalized: formatted };
}

/**
 * Validates Indian State Pharmacy Council registration numbers.
 * Common formats:
 * - "KSPC-48192-A" (State prefix, 4-6 digit registration, category letter)
 * - "MH-54321" or "TSPC-120934-R" or "DL-PH-3921"
 */
export function validatePharmacistRegNo(regNo: string): ValidationResult {
  if (!regNo || typeof regNo !== 'string') {
    return { valid: false, error: 'Pharmacist Registration Number is required.' };
  }

  const clean = regNo.trim().toUpperCase();
  // Accepts standard state council prefixes (e.g., KSPC, MH, DL-PH, TSPC) followed by digits and optional sub-category
  const regPattern = /^[A-Z]{2,5}(?:-[A-Z]{1,4})?[-\s/]?\d{4,7}(?:[-\s/]?[A-Z0-9]{1,3})?$/;

  if (!regPattern.test(clean)) {
    return {
      valid: false,
      error: 'Invalid State Pharmacy Council format. Expected format like KSPC-48192-A or MH-54321.',
    };
  }

  return { valid: true, normalized: clean };
}

/**
 * Validates CDSCO Form 20B (Retail) and Form 21B (Wholesale) drug licenses.
 * Examples:
 * - "KA-BLR-20B-10928"
 * - "MH-MUM-21B-44019"
 * - "DL-NZ-20B-78190"
 */
export function validateCdscoLicense(license: string): ValidationResult {
  if (!license || typeof license !== 'string') {
    return { valid: false, error: 'CDSCO License is required.' };
  }

  const clean = license.trim().toUpperCase();
  // State code (2-3 chars), optional district code, Form (20B, 21B, 20, 21), followed by sequence number
  const cdscoPattern = /^[A-Z]{2,3}(?:-[A-Z0-9]{2,4})?-(?:20B|21B|20|21)-\d{4,8}$/;

  if (!cdscoPattern.test(clean)) {
    return {
      valid: false,
      error: 'Invalid CDSCO license format. Expected format like KA-BLR-20B-10928 or DL-21B-44019.',
    };
  }

  return { valid: true, normalized: clean };
}
