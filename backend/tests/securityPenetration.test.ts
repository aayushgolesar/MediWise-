import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { signToken } from '../src/security.js';

describe('Penetration & Security Testing on Auth, RBAC & Payments (Phase 6)', () => {
  const app = createApp();

  const patientToken = signToken({ sub: 'usr-pat-01', role: 'patient', exp: Math.floor(Date.now() / 1000) + 3600 });
  const pharmacistToken = signToken({ sub: 'usr-pharm-01', role: 'pharmacist', exp: Math.floor(Date.now() / 1000) + 3600 });
  const oemToken = signToken({ sub: 'usr-oem-01', role: 'oem', exp: Math.floor(Date.now() / 1000) + 3600 });

  it('1. SQL Injection Protection: protects against malicious payloads in search queries', async () => {
    const maliciousSearches = [
      "' OR 1=1 --",
      "'; DROP TABLE medicines; --",
      "1 UNION SELECT null, null, null, password_hash FROM users --",
    ];

    for (const payload of maliciousSearches) {
      const res = await request(app)
        .get('/api/medicines')
        .query({ search: payload })
        .set('Cookie', [`mediwise_access=${patientToken}`]);

      // Parameterized queries must treat input as literal text without exploding or dropping tables
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });

  it('2. CSRF Double-Submit Protection: blocks mutating POST/PUT without matching CSRF header', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', [`mediwise_access=${patientToken}`, 'mediwise_csrf=legitimate_cookie_val'])
      .set('x-csrf-token', 'attacker_forged_header_val') // mismatch
      .send({ medicineName: 'Atorvastatin' });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('CSRF');
  });

  it('3. Horizontal Privilege Escalation: blocks Patient from partner and admin endpoints', async () => {
    // Attempting to view hub incoming order queue as patient
    const res1 = await request(app)
      .get('/api/partner/orders')
      .set('Cookie', [`mediwise_access=${patientToken}`]);
    expect(res1.status).toBe(403);

    // Attempting to access admin quarantine console as patient
    const res2 = await request(app)
      .get('/api/admin/quarantine')
      .set('Cookie', [`mediwise_access=${patientToken}`]);
    expect(res2.status).toBe(403);

    // Attempting to access super-admin tenant hubs as OEM
    const res3 = await request(app)
      .get('/api/admin/hubs')
      .set('Cookie', [`mediwise_access=${oemToken}`]);
    expect(res3.status).toBe(403);
  });

  it('4. Payment Gateway Signature Tamper Protection: rejects altered HMAC signatures', async () => {
    const res = await request(app)
      .post('/api/payments/verify')
      .set('Cookie', [`mediwise_access=${patientToken}`, 'mediwise_csrf=token123'])
      .set('x-csrf-token', 'token123')
      .send({
        gatewayOrderId: 'order_mw_fake_01',
        gatewayPaymentId: 'pay_tampered_01',
        signature: 'attacker_forged_signature_hash_99999',
        orderId: 'MW-10000-BLR',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('verification failed');
  });

  it('5. Security Headers: verifies core defense headers are present on all responses', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
    expect(res.headers['permissions-policy']).toContain('camera=()');
  });
});
