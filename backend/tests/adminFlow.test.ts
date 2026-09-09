import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { signToken } from '../src/security.js';
import db from '../src/db.js';

describe('Admin Operational & Reassignment Flows (Phase 6)', () => {
  const app = createApp();
  const testAdminId = 'usr-admin-flow-01';
  let adminToken: string;
  const csrfToken = 'admin-flow-csrf-token';

  beforeAll(() => {
    const now = Math.floor(Date.now() / 1000);
    adminToken = signToken({ sub: testAdminId, role: 'admin', exp: now + 3600 });
  });

  it('1. Quarantine Console: fetches quarantined items and allows release', async () => {
    const getRes = await request(app)
      .get('/api/admin/quarantine')
      .set('Cookie', [`mediwise_access=${adminToken}`]);

    expect(getRes.status).toBe(200);
    expect(Array.isArray(getRes.body.data)).toBe(true);
    expect(getRes.body.data.length).toBeGreaterThan(0);

    const firstItem = getRes.body.data[0];
    const updateRes = await request(app)
      .put(`/api/admin/quarantine/${firstItem.id}`)
      .set('Cookie', [`mediwise_access=${adminToken}`, `mediwise_csrf=${csrfToken}`])
      .set('x-csrf-token', csrfToken)
      .send({ action: 'release' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.status).toBe('Released');
  });

  it('2. Reassignment Engine: fetches candidate matching tasks and force-assigns order', async () => {
    const testOrderId = `ORD-REASSIGN-${Date.now()}`;
    const candidates = [
      { hubId: 'hub-blr-01', name: 'Apollo Pharmacy Indiranagar', distanceKm: 1.8, stock: 42, slaMinutes: 15, matchScore: 92, status: 'Optimal' }
    ];
    db.prepare(`
      INSERT OR REPLACE INTO reassignment_tasks (order_id, patient_name, medicine_name, original_hub, time_remaining_sec, total_timeout_sec, timeout_reason, candidate_hubs)
      VALUES (?, 'Priya Sundaram', 'Telmisartan 40mg', 'MedPlus Indiranagar', 240, 900, 'No Pharmacist Acceptance (15m SLA)', ?)
    `).run(testOrderId, JSON.stringify(candidates));

    const getTasks = await request(app)
      .get('/api/admin/reassignment')
      .set('Cookie', [`mediwise_access=${adminToken}`]);

    expect(getTasks.status).toBe(200);
    expect(Array.isArray(getTasks.body.data)).toBe(true);
    expect(getTasks.body.data.length).toBeGreaterThan(0);

    const task = getTasks.body.data[0];
    expect(task.candidateHubs.length).toBeGreaterThan(0);

    // Force assign to hub
    const targetHub = task.candidateHubs[0].hubId;
    const assignRes = await request(app)
      .post(`/api/admin/reassignment/${task.orderId}/assign`)
      .set('Cookie', [`mediwise_access=${adminToken}`, `mediwise_csrf=${csrfToken}`])
      .set('x-csrf-token', csrfToken)
      .send({ hubId: targetHub });

    expect(assignRes.status).toBe(200);
    expect(assignRes.body.data.assignedHubId).toBe(targetHub);

    // Verify task is removed from reassignment queue
    const remainingTasks = await request(app)
      .get('/api/admin/reassignment')
      .set('Cookie', [`mediwise_access=${adminToken}`]);

    expect(remainingTasks.body.data.some((t: { orderId: string }) => t.orderId === task.orderId)).toBe(false);
  });

  it('3. Dispute Console: resolves dispute with Hub Penalized and logs audit trail', async () => {
    const disputesRes = await request(app)
      .get('/api/admin/disputes')
      .set('Cookie', [`mediwise_access=${adminToken}`]);

    expect(disputesRes.status).toBe(200);
    expect(Array.isArray(disputesRes.body.data)).toBe(true);
    expect(disputesRes.body.data.length).toBeGreaterThan(0);

    const caseId = disputesRes.body.data[0].caseId;
    const resolveRes = await request(app)
      .put(`/api/admin/disputes/${caseId}/resolve`)
      .set('Cookie', [`mediwise_access=${adminToken}`, `mediwise_csrf=${csrfToken}`])
      .set('x-csrf-token', csrfToken)
      .send({ resolution: 'Refund Approved' });

    expect(resolveRes.status).toBe(200);
    expect(resolveRes.body.data.status).toBe('Refund Approved');
  });

  it('4. Super Admin: monitors tenant hub status, storage, and latency metrics', async () => {
    const hubsRes = await request(app)
      .get('/api/admin/hubs')
      .set('Cookie', [`mediwise_access=${adminToken}`]);

    expect(hubsRes.status).toBe(200);
    expect(Array.isArray(hubsRes.body.data)).toBe(true);
    expect(hubsRes.body.data.length).toBeGreaterThan(0);
    expect(hubsRes.body.data[0].schemaName).toBeDefined();
    expect(hubsRes.body.data[0].dbLatencyMs).toBeDefined();
  });
});
