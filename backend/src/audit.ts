import { randomUUID } from 'crypto';
import { AuditLog } from './models/AuditLog.js';

export type AuditEventType =
  | 'USER_REGISTERED' | 'USER_SIGNIN' | 'PRESCRIPTION_VERIFIED' | 'PRESCRIPTION_OCR_PARSED'
  | 'NOOR_RESPONSE_MODERATED' | 'ORDER_PLACED_ESCROW_LOCKED' | 'SCHEDULE_H_DISPENSED'
  | 'ESCROW_RELEASED' | 'ESCROW_REFUNDED' | 'DISPUTE_FILED' | 'DISPUTE_RESOLVED' | 'ORDER_REASSIGNED';

export interface AuditRecord {
  id: string;
  eventType: AuditEventType;
  entityId: string;
  actorId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

const toAuditRecord = (row: { _id: string; event_type: string; entity_id: string; actor_id?: string | null; metadata: string; created_at: string }): AuditRecord => ({
  id: row._id,
  eventType: row.event_type as AuditEventType,
  entityId: row.entity_id,
  actorId: row.actor_id ?? null,
  metadata: JSON.parse(row.metadata || '{}') as Record<string, unknown>,
  createdAt: row.created_at,
});

export const logAuditEvent = async (eventType: AuditEventType, entityId: string, actorId: string | null = null, metadata: Record<string, unknown> = {}): Promise<AuditRecord> => {
  const row = await AuditLog.create({
    _id: `aud-${randomUUID().slice(0, 12)}`,
    event_type: eventType,
    entity_id: entityId,
    actor_id: actorId,
    metadata: JSON.stringify(metadata),
    created_at: new Date().toISOString(),
  });
  return toAuditRecord(row);
};

export const getAuditLogs = async (limit = 50, entityId?: string): Promise<AuditRecord[]> => {
  const filter = entityId ? { entity_id: entityId } : {};
  const rows = await AuditLog.find(filter).sort({ created_at: -1 }).limit(limit).lean();
  return rows.map(toAuditRecord);
};
