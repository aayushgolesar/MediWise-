import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/app.js';
import { signToken, hashPassword } from '../server/security.js';
import db from '../server/db.js';

describe('Auth & Partner Operational Routes (Phase 6 Unit & Integration)', () => {
  const app = createApp();
  const testPharmacistId = 'usr-pharm-test-01';
  let pharmacistToken: string;
  const csrfToken = 'test-csrf-auth-token-44';

  beforeAll(() => {
    const pwdHash = hashPassword('MedPlusSecurePass2026!');
    db.prepare(`
      INSERT OR REPLACE INTO users
        (id, name, email, phone, password_hash, role, pharmacy_hub_name, pharmacist_reg_no, cdsco_license)
      VALUES (?, 'Test Pharmacist', 'test.pharm@medplus.example', '+91 98841 00000', ?, 'pharmacist', 'MedPlus Indiranagar', 'KSPC-48192-A', 'KA-BLR-20B-10928')
    `).run(testPharmacistId, pwdHash);

    const now = Math.floor(Date.now() / 1000);
    pharmacistToken = signToken({ sub: testPharmacistId, role: 'pharmacist', exp: now + 3600 });
  });

  describe('Authentication Routes (/api/auth)', () => {
    it('rejects registration with missing mandatory fields', async () => {
      const res = await request(app).post('/api/auth/register').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('required');
    });

    it('rejects patient registration with malformed ABHA ID', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+91 98841 12345',
        password: 'Password123!',
        role: 'patient',
        abhaId: 'invalid-abha-number',
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('ABHA');
    });

    it('rejects pharmacist registration with invalid CDSCO license', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+91 98841 12346',
        password: 'Password123!',
        role: 'pharmacist',
        pharmacistRegNo: 'KSPC-12345-A',
        cdscoLicense: 'INVALID-CDSCO-LICENSE',
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('CDSCO');
    });

    it('authenticates valid credentials and issues session cookies', async () => {
      const res = await request(app).post('/api/auth/signin').send({
        email: 'test.pharm@medplus.example',
        password: 'MedPlusSecurePass2026!',
      });
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('test.pharm@medplus.example');
      expect(res.body.data.user.role).toBe('pharmacist');
      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies.some((c: string) => c.includes('mediwise_access'))).toBe(true);
    });

    it('rejects signin with incorrect password', async () => {
      const res = await request(app).post('/api/auth/signin').send({
        email: 'test.pharm@medplus.example',
        password: 'WrongPassword!',
      });
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Invalid');
    });
  });

  describe('Pharmacist Partner Operations (/api/partner)', () => {
    it('retrieves incoming non-delivered orders for hub review', async () => {
      const res = await request(app)
        .get('/api/partner/orders')
        .set('Cookie', [`mediwise_access=${pharmacistToken}`]);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('retrieves inventory proxy with schedule categories', async () => {
      const res = await request(app)
        .get('/api/partner/inventory')
        .set('Cookie', [`mediwise_access=${pharmacistToken}`]);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('pharmacist accepts order and advances state to pharmacist_audit', async () => {
      // Create a test order to accept
      const testOrderId = `MW-ACCEPT-${Date.now()}`;
      db.prepare(`
        INSERT INTO orders (order_id, placed_time, delivery_eta, delivery_otp, status,
          customer_name, customer_address, customer_phone, pharmacy_name, pharmacy_hub_id,
          pharmacy_address, pharmacy_license, pharmacist_name, pharmacist_reg, courier_name,
          courier_phone, courier_rating, vehicle_number, medicine_name, composition, pack_size,
          batch_number, seal_hash, price, item_total, packaging_tamper_fee, delivery_fee,
          platform_convenience, generic_savings, total_paid, escrow_status)
        VALUES (?, '10:00 AM', '45m', '1234', 'locked_escrow', 'Patient', 'Addr', 'Phone', 'MedPlus', 'hub-blr-01',
          'Addr', 'Lic', 'Pharm', 'Reg', 'Cour', 'Phone', 5, 'KA-01', 'Med', 'Comp', 10, 'B1', '0x1', 100, 100, 12, 15, 5, 0, 132, 'Held in Escrow')
      `).run(testOrderId);

      const res = await request(app)
        .put(`/api/partner/orders/${testOrderId}/accept`)
        .set('Cookie', [`mediwise_access=${pharmacistToken}`, `mediwise_csrf=${csrfToken}`])
        .set('x-csrf-token', csrfToken);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('pharmacist_audit');

      const updated = db.prepare('SELECT status FROM orders WHERE order_id = ?').get(testOrderId) as { status: string };
      expect(updated.status).toBe('pharmacist_audit');
    });
  });
});
