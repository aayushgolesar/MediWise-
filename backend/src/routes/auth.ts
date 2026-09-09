import express from 'express';
import { randomUUID } from 'crypto';
import type { AuthUser } from '../types/index.js';
import { User } from '../models/User.js';
import { clearSession, hashPassword, issueSession, requireAuth, verifyPassword, type AuthenticatedRequest } from '../security.js';
import { validateAbhaId, validateCdscoLicense, validatePharmacistRegNo } from '../validators.js';
import { logAuditEvent } from '../audit.js';

const router = express.Router();

const toAuthUser = (user: { _id: string; name: string; email: string; phone: string; role: AuthUser['role']; abha_id?: string; pharmacy_hub_name?: string; pharmacist_reg_no?: string; cdsco_license?: string }): AuthUser => ({
  id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role,
  abhaId: user.abha_id, pharmacyHubName: user.pharmacy_hub_name,
  pharmacistRegNo: user.pharmacist_reg_no, cdscoLicense: user.cdsco_license,
});

router.post('/register', async (req, res, next) => {
  try {
    const body = req.body as Partial<AuthUser & { password: string }>;
    const { name, email, phone, password, role } = body;
    if (!name || !email || !phone || !password || !role) return res.status(400).json({ error: 'name, email, phone, password, and role are required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || !['patient', 'pharmacist', 'admin', 'oem'].includes(role)) return res.status(400).json({ error: 'Registration details are invalid.' });
    if (await User.exists({ email })) return res.status(409).json({ error: 'An account with this email already exists' });

    let abhaId = body.abhaId;
    let pharmacistRegNo = body.pharmacistRegNo;
    let cdscoLicense = body.cdscoLicense;
    if (role === 'patient' && abhaId) {
      const check = validateAbhaId(abhaId);
      if (!check.valid) return res.status(400).json({ error: check.error });
      abhaId = check.normalized;
    }
    if (role === 'pharmacist') {
      const registration = validatePharmacistRegNo(pharmacistRegNo ?? '');
      const license = validateCdscoLicense(cdscoLicense ?? '');
      if (!registration.valid || !license.valid) return res.status(400).json({ error: registration.error ?? license.error });
      pharmacistRegNo = registration.normalized;
      cdscoLicense = license.normalized;
    }
    const user = await User.create({ _id: randomUUID(), name, email, phone, password_hash: hashPassword(password), role, abha_id: abhaId, pharmacy_hub_name: body.pharmacyHubName, pharmacist_reg_no: pharmacistRegNo, cdsco_license: cdscoLicense });
    const responseUser = toAuthUser(user);
    await logAuditEvent('USER_REGISTERED', responseUser.id, responseUser.id, { role: responseUser.role });
    issueSession(res, responseUser.id, responseUser.role);
    res.status(201).json({ data: { user: responseUser }, message: 'Registration successful' });
  } catch (error: unknown) { next(error); }
});

router.post('/signin', async (req, res, next) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
    const user = await User.findOne({ email }).lean();
    if (!user || !verifyPassword(password, user.password_hash)) return res.status(401).json({ error: 'Invalid credentials' });
    const responseUser = toAuthUser(user);
    await logAuditEvent('USER_SIGNIN', responseUser.id, responseUser.id, { role: responseUser.role });
    issueSession(res, responseUser.id, responseUser.role);
    res.json({ data: { user: responseUser }, message: 'Sign-in successful' });
  } catch (error: unknown) { next(error); }
});

router.post('/validate-regulatory', (req, res) => {
  const { type, value } = req.body as { type: 'abha' | 'pharmacist_reg' | 'cdsco_license'; value: string };
  const result = type === 'abha' ? validateAbhaId(value) : type === 'pharmacist_reg' ? validatePharmacistRegNo(value) : type === 'cdsco_license' ? validateCdscoLicense(value) : null;
  if (!result) return res.status(400).json({ error: 'Unsupported validation type' });
  res.json({ data: result });
});

router.post('/signout', (_req, res) => { clearSession(res); res.json({ message: 'Signed out successfully' }); });

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await User.findById(req.auth?.sub).lean();
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json({ data: toAuthUser(user) });
  } catch (error: unknown) { next(error); }
});

export default router;
