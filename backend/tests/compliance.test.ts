import { describe, it, expect } from 'vitest';
import { logAuditEvent, getAuditLogs } from '../src/audit.js';
import db from '../src/db.js';

describe('Regulatory & Compliance Verification (CDSCO & DISHA)', () => {
  it('1. Mandates immutable audit logging for Schedule H/H1 and Escrow operations', () => {
    const testEntityId = `order-compliance-${Date.now()}`;
    const testActorId = 'usr-pharmacist-compliance-01';

    // Log dispensing and escrow events
    const log1 = logAuditEvent('SCHEDULE_H_DISPENSED', testEntityId, testActorId, {
      medicineName: 'Amoxicillin 500mg',
      doctorRegNo: 'KMC-99412',
      schedule: 'Schedule H1',
      unitsDispensed: 10,
    });

    const log2 = logAuditEvent('ESCROW_RELEASED', testEntityId, testActorId, {
      releasedAmount: 145.5,
      destinationHubId: 'hub-blr-01',
    });

    expect(log1.id).toBeDefined();
    expect(log2.id).toBeDefined();

    // Query logs
    const records = getAuditLogs(10, testEntityId);
    expect(records.length).toBe(2);

    const dispensed = records.find(r => r.eventType === 'SCHEDULE_H_DISPENSED');
    expect(dispensed).toBeDefined();
    expect(dispensed?.metadata.schedule).toBe('Schedule H1');
    expect(dispensed?.metadata.doctorRegNo).toBe('KMC-99412');
  });

  it('2. DISHA Data Privacy: Verifies passwords are never stored in plaintext', () => {
    const users = db.prepare('SELECT id, email, password_hash FROM users').all() as Array<{
      id: string;
      email: string;
      password_hash: string;
    }>;

    expect(users.length).toBeGreaterThan(0);
    for (const user of users) {
      // Must not be empty or plain text password
      expect(user.password_hash).toBeDefined();
      expect(user.password_hash.length).toBeGreaterThanOrEqual(50);
      expect(user.password_hash).toMatch(/^scrypt\$/);
    }
  });

  it('3. DISHA Data Privacy: Ensures audit log metadata excludes plain credentials', () => {
    const allAuditLogs = getAuditLogs(50);
    for (const record of allAuditLogs) {
      const metaStr = JSON.stringify(record.metadata).toLowerCase();
      expect(metaStr).not.toContain('password');
      expect(metaStr).not.toContain('pin');
    }
  });
});
