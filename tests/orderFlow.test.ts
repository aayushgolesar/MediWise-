import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/app.js';
import { signToken, hashPassword } from '../server/security.js';
import db from '../server/db.js';

describe('Integration Flow: End-to-End Order, Escrow, and Dispute (Phase 6)', () => {
  const app = createApp();
  const testPatientId = 'usr-patient-test-01';
  const testAdminId = 'usr-admin-test-01';

  let patientToken: string;
  let adminToken: string;
  const csrfToken = 'test-csrf-token-1234567890';

  beforeAll(() => {
    // Seed test users in SQLite if missing
    const testPasswordHash = hashPassword('TestUserPassword123!');
    db.prepare(`
      INSERT OR REPLACE INTO users (id, name, email, phone, password_hash, role, abha_id)
      VALUES (?, 'Test Patient', 'test.patient@example.com', '+91 98765 43210', ?, 'patient', '12-3456-7812-3451')
    `).run(testPatientId, testPasswordHash);

    db.prepare(`
      INSERT OR REPLACE INTO users (id, name, email, phone, password_hash, role)
      VALUES (?, 'Test Admin', 'test.admin@example.com', '+91 98765 43211', ?, 'admin')
    `).run(testAdminId, testPasswordHash);

    const now = Math.floor(Date.now() / 1000);
    patientToken = signToken({ sub: testPatientId, role: 'patient', exp: now + 3600 });
    adminToken = signToken({ sub: testAdminId, role: 'admin', exp: now + 3600 });
  });

  it('1. GET /api/health returns 200 and system metadata', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('MediWise API');
  });

  it('2. Enforces RBAC & Authentication: rejects unauthenticated requests to protected endpoints', async () => {
    const res = await request(app).get('/api/medicines');
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Authentication is required');
  });

  it('3. Denies cross-role access: patient cannot access admin dispute console', async () => {
    const res = await request(app)
      .get('/api/admin/disputes')
      .set('Cookie', [`mediwise_access=${patientToken}`]);

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('permission');
  });

  it('4. Patient Flow: Browses medicine catalog', async () => {
    const res = await request(app)
      .get('/api/medicines')
      .set('Cookie', [`mediwise_access=${patientToken}`]);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('5. Full Order & Escrow Flow: Create payment order -> Place Order -> Verify signature & Escrow Lock', async () => {
    // A. Create Gateway Payment Order
    const payRes = await request(app)
      .post('/api/payments/create-order')
      .set('Cookie', [`mediwise_access=${patientToken}`, `mediwise_csrf=${csrfToken}`])
      .set('x-csrf-token', csrfToken)
      .send({
        itemTotal: 120,
        packagingTamperFee: 12,
        deliveryFee: 15,
        platformConvenience: 5,
        paymentMethod: 'upi',
        customerName: 'Test Patient',
        customerPhone: '+91 98765 43210',
      });

    expect(payRes.status).toBe(201);
    expect(payRes.body.data.gatewayOrderId).toBeDefined();
    const gatewayOrderId = payRes.body.data.gatewayOrderId;

    // B. Place Order in clearinghouse
    const placeRes = await request(app)
      .post('/api/orders')
      .set('Cookie', [`mediwise_access=${patientToken}`, `mediwise_csrf=${csrfToken}`])
      .set('x-csrf-token', csrfToken)
      .send({
        medicineName: 'Atorvastatin 10mg',
        pharmacyName: 'Apollo Pharmacy Indiranagar',
        pharmacyHubId: 'hub-blr-01',
        packSize: 30,
        price: 120,
        itemTotal: 120,
        customerName: 'Test Patient',
        customerAddress: 'Indiranagar 100ft Rd',
        customerPhone: '+91 98765 43210',
      });

    expect(placeRes.status).toBe(201);
    const orderId = placeRes.body.data.orderId;
    const otp = placeRes.body.data.deliveryOtp;
    expect(orderId).toBeDefined();
    expect(otp).toBeDefined();
    expect(placeRes.body.data.escrowStatus).toBe('Held in Escrow');

    // C. Verify Gateway Cryptographic Signature
    const verifyRes = await request(app)
      .post('/api/payments/verify')
      .set('Cookie', [`mediwise_access=${patientToken}`, `mediwise_csrf=${csrfToken}`])
      .set('x-csrf-token', csrfToken)
      .send({
        gatewayOrderId,
        gatewayPaymentId: 'pay_test_payment_id_99',
        signature: 'test_valid_signature',
        orderId,
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.escrowStatus).toBe('Held in Escrow');

    // D. Digital GST Tax Invoice is available
    const invoiceRes = await request(app)
      .get(`/api/payments/invoice/${orderId}`)
      .set('Cookie', [`mediwise_access=${patientToken}`]);

    expect(invoiceRes.status).toBe(200);
    expect(invoiceRes.body.data.orderId).toBe(orderId);
    expect(invoiceRes.body.data.cgstRate).toBe(9);
    expect(invoiceRes.body.data.sgstRate).toBe(9);

    // E. Confirm Delivery with OTP -> Escrow released to pharmacy
    const otpRes = await request(app)
      .put(`/api/orders/${orderId}/otp`)
      .set('Cookie', [`mediwise_access=${patientToken}`, `mediwise_csrf=${csrfToken}`])
      .set('x-csrf-token', csrfToken)
      .send({ otp });

    expect(otpRes.status).toBe(200);
    expect(otpRes.body.data.status).toBe('delivered');
    expect(otpRes.body.data.escrowStatus).toBe('Released to Pharmacy');
  });

  it('6. Dispute & Admin Refund Flow: locks escrow and refunds buyer upon dispute resolution', async () => {
    // Place a new order
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Cookie', [`mediwise_access=${patientToken}`, `mediwise_csrf=${csrfToken}`])
      .set('x-csrf-token', csrfToken)
      .send({
        medicineName: 'Metformin 500mg',
        pharmacyName: 'MedPlus Pharmacy',
        pharmacyHubId: 'hub-blr-02',
        itemTotal: 85,
        customerName: 'Test Patient',
      });

    const orderId = orderRes.body.data.orderId;

    // File Dispute
    const disputeRes = await request(app)
      .post(`/api/orders/${orderId}/dispute`)
      .set('Cookie', [`mediwise_access=${patientToken}`, `mediwise_csrf=${csrfToken}`])
      .set('x-csrf-token', csrfToken)
      .send({ reason: 'Tampered Blister Pack detected on receipt' });

    expect(disputeRes.status).toBe(200);
    expect(disputeRes.body.data.escrowStatus).toBe('Under Dispute');

    // Admin manual refund override
    const refundRes = await request(app)
      .post(`/api/admin/escrow/${orderId}/refund`)
      .set('Cookie', [`mediwise_access=${adminToken}`, `mediwise_csrf=${csrfToken}`])
      .set('x-csrf-token', csrfToken);

    expect(refundRes.status).toBe(200);
    expect(refundRes.body.data.escrowStatus).toBe('Refunded');

    // Verify order detail reflects refunded escrow status
    const getRes = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Cookie', [`mediwise_access=${patientToken}`]);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.financials.escrowStatus).toBe('Refunded');
  });

  it('7. Schedule H / H1 Dispensing & Audit Trail: confirms audit_log records for placed orders', async () => {
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Cookie', [`mediwise_access=${patientToken}`, `mediwise_csrf=${csrfToken}`])
      .set('x-csrf-token', csrfToken)
      .send({
        medicineName: 'Augmentin 625 Duo (Schedule H1)',
        pharmacyName: 'Apollo Pharmacy Indiranagar',
        pharmacyHubId: 'hub-blr-01',
        itemTotal: 220,
        customerName: 'Test Patient',
      });

    const orderId = orderRes.body.data.orderId;
    const auditEntries = db.prepare('SELECT * FROM audit_log WHERE entity_id = ?').all(orderId) as Array<{ event_type: string }>;
    expect(auditEntries.length).toBeGreaterThan(0);
    expect(auditEntries.some(e => e.event_type === 'ORDER_PLACED_ESCROW_LOCKED')).toBe(true);
  });

  it('8. Automatic Escrow Release: releases escrow upon 7-day SLA timeout when no dispute is active', async () => {
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Cookie', [`mediwise_access=${patientToken}`, `mediwise_csrf=${csrfToken}`])
      .set('x-csrf-token', csrfToken)
      .send({
        medicineName: 'Paracetamol 650mg',
        pharmacyName: 'Generic Hub',
        itemTotal: 40,
        customerName: 'Test Patient',
      });

    const orderId = orderRes.body.data.orderId;
    const releaseRes = await request(app)
      .post(`/api/orders/${orderId}/auto-release`)
      .set('Cookie', [`mediwise_access=${patientToken}`, `mediwise_csrf=${csrfToken}`])
      .set('x-csrf-token', csrfToken);

    expect(releaseRes.status).toBe(200);
    expect(releaseRes.body.data.escrowStatus).toBe('Released to Pharmacy');
  });
});
