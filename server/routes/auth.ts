import express from 'express';
import db from '../db.js';
import type { AuthUser } from '../../src/types/index.js';
import { randomUUID } from 'crypto';
import { clearSession, hashPassword, issueSession, requireAuth, verifyPassword, type AuthenticatedRequest } from '../security.js';
import { validateAbhaId, validateCdscoLicense, validatePharmacistRegNo } from '../validators.js';
import { logAuditEvent } from '../audit.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Creates a password-hashed account with regulatory validation and audit trail.
 */
router.post('/register', (req, res) => {
  const body = req.body as Partial<AuthUser & { password: string }>;
  const { name, email, phone, password, role, abhaId, pharmacyHubName, pharmacistRegNo, cdscoLicense } = body;

  if (!name || !email || !phone || !password || !role) {
    res.status(400).json({ error: 'name, email, phone, password, and role are required' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || !['patient', 'pharmacist', 'admin', 'oem'].includes(role)) {
    res.status(400).json({ error: 'Registration details are invalid. Password must be at least 8 characters.' });
    return;
  }

  let validatedAbha = abhaId;
  let validatedRegNo = pharmacistRegNo;
  let validatedCdsco = cdscoLicense;

  // Regulatory Validation: Patient ABHA ID
  if (role === 'patient' && abhaId && abhaId.trim()) {
    const abhaCheck = validateAbhaId(abhaId);
    if (!abhaCheck.valid) {
      res.status(400).json({ error: abhaCheck.error });
      return;
    }
    validatedAbha = abhaCheck.normalized;
  }

  // Regulatory Validation: Pharmacist Council Registration & CDSCO License
  if (role === 'pharmacist') {
    if (!pharmacistRegNo || !pharmacistRegNo.trim()) {
      res.status(400).json({ error: 'State Pharmacy Council Registration Number is required for pharmacists.' });
      return;
    }
    const regCheck = validatePharmacistRegNo(pharmacistRegNo);
    if (!regCheck.valid) {
      res.status(400).json({ error: regCheck.error });
      return;
    }
    validatedRegNo = regCheck.normalized;

    if (!cdscoLicense || !cdscoLicense.trim()) {
      res.status(400).json({ error: 'CDSCO Form 20B/21B License Number is required for pharmacy hubs.' });
      return;
    }
    const cdscoCheck = validateCdscoLicense(cdscoLicense);
    if (!cdscoCheck.valid) {
      res.status(400).json({ error: cdscoCheck.error });
      return;
    }
    validatedCdsco = cdscoCheck.normalized;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const id = randomUUID();
  db.prepare(`
    INSERT INTO users (id, name, email, phone, password_hash, role, abha_id, pharmacy_hub_name, pharmacist_reg_no, cdsco_license)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, email, phone, hashPassword(password), role, validatedAbha ?? null, pharmacyHubName ?? null, validatedRegNo ?? null, validatedCdsco ?? null);

  const user: AuthUser = {
    id,
    name,
    email,
    phone,
    role: role as AuthUser['role'],
    abhaId: validatedAbha,
    pharmacyHubName,
    pharmacistRegNo: validatedRegNo,
    cdscoLicense: validatedCdsco,
  };

  // Immutable audit log event
  logAuditEvent('USER_REGISTERED', id, id, {
    role,
    email,
    abhaId: validatedAbha ?? null,
    pharmacistRegNo: validatedRegNo ?? null,
    cdscoLicense: validatedCdsco ?? null,
  });

  issueSession(res, id, user.role);
  res.status(201).json({ data: { user }, message: 'Registration successful' });
});

/**
 * POST /api/auth/signin
 */
router.post('/signin', (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as Record<string, unknown> | undefined;
  if (!row) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  if (!verifyPassword(password, row.password_hash as string)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const user: AuthUser = {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: row.phone as string,
    role: row.role as AuthUser['role'],
    abhaId: row.abha_id as string | undefined,
    pharmacyHubName: row.pharmacy_hub_name as string | undefined,
    pharmacistRegNo: row.pharmacist_reg_no as string | undefined,
    cdscoLicense: row.cdsco_license as string | undefined,
  };

  logAuditEvent('USER_SIGNIN', user.id, user.id, { role: user.role, email: user.email });

  issueSession(res, user.id, user.role);
  res.json({ data: { user }, message: 'Sign-in successful' });
});

/**
 * POST /api/auth/validate-regulatory
 * Endpoint for live frontend validation of ABHA, Pharmacist Reg No, or CDSCO License.
 */
router.post('/validate-regulatory', (req, res) => {
  const { type, value } = req.body as { type: 'abha' | 'pharmacist_reg' | 'cdsco_license'; value: string };

  if (type === 'abha') {
    const result = validateAbhaId(value);
    res.json({ data: result });
    return;
  }
  if (type === 'pharmacist_reg') {
    const result = validatePharmacistRegNo(value);
    res.json({ data: result });
    return;
  }
  if (type === 'cdsco_license') {
    const result = validateCdscoLicense(value);
    res.json({ data: result });
    return;
  }

  res.status(400).json({ error: 'Unsupported validation type' });
});

/**
 * POST /api/auth/signout
 */
router.post('/signout', (_req, res) => {
  clearSession(res);
  res.json({ message: 'Signed out successfully' });
});

/**
 * GET /api/auth/me
 */
router.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.auth?.sub) as Record<string, unknown> | undefined;
  if (!row) {
    res.status(401).json({ error: 'User not found' });
    return;
  }
  const user: AuthUser = {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: row.phone as string,
    role: row.role as AuthUser['role'],
    abhaId: row.abha_id as string | undefined,
    pharmacyHubName: row.pharmacy_hub_name as string | undefined,
    pharmacistRegNo: row.pharmacist_reg_no as string | undefined,
    cdscoLicense: row.cdsco_license as string | undefined,
  };
  res.json({ data: user });
});

export default router;
