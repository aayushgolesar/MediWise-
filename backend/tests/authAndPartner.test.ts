import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { signToken, hashPassword } from '../src/security.js';
import { User } from '../src/models/User.js';
import { Order } from '../src/models/Order.js';

describe('Auth & Partner Operational Routes (Phase 6 Unit & Integration)', () => {
  const app = createApp();
  const testPharmacistId = 'usr-pharm-test-01';
  let pharmacistToken: string;
  const csrfToken = 'test-csrf-auth-token-44';

  beforeAll(async () => {
    const pwdHash = hashPassword('MedPlusSecurePass2026!');
    await User.create({
      _id: testPharmacistId,
      name: 'Test Pharmacist',
      email: 'test.pharm@medplus.example',
      phone: '+91 98841 00000',
      password_hash: pwdHash,
      role: 'pharmacist',
      pharmacy_hub_name: 'MedPlus Indiranagar',
      pharmacist_reg_no: 'KSPC-48192-A',
      cdsco_license: 'KA-BLR-20B-10928',
      created_at: new Date().toISOString(),
    });

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
      await Order.create({
        _id: testOrderId,
        placed_time: '10:00 AM',
        delivery_eta: '45m',
        delivery_otp: '1234',
        status: 'locked_escrow',
        customer_name: 'Patient',
        customer_address: 'Addr',
        customer_phone: 'Phone',
        pharmacy_name: 'MedPlus',
        pharmacy_hub_id: 'hub-blr-01',
        pharmacy_address: 'Addr',
        pharmacy_license: 'Lic',
        pharmacist_name: 'Pharm',
        pharmacist_reg: 'Reg',
        courier_name: 'Cour',
        courier_phone: 'Phone',
        courier_rating: 5,
        vehicle_number: 'KA-01',
        cold_chain_verified: false,
        current_distance_km: 0,
        medicine_name: 'Med',
        composition: 'Comp',
        pack_size: 10,
        batch_number: 'B1',
        seal_hash: '0x1',
        price: 100,
        item_total: 100,
        packaging_tamper_fee: 12,
        delivery_fee: 15,
        platform_convenience: 5,
        generic_savings: 0,
        total_paid: 132,
        escrow_status: 'Held in Escrow',
      });

      const res = await request(app)
        .put(`/api/partner/orders/${testOrderId}/accept`)
        .set('Cookie', [`mediwise_access=${pharmacistToken}`, `mediwise_csrf=${csrfToken}`])
        .set('x-csrf-token', csrfToken);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('pharmacist_audit');

      const updated = await Order.findById(testOrderId);
      expect(updated?.status).toBe('pharmacist_audit');
    });
  });
});
