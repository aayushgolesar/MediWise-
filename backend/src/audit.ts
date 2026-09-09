import db from './db.js';
import { randomUUID } from 'crypto';

export type AuditEventType =
  | 'USER_REGISTERED'
  | 'USER_SIGNIN'
  | 'PRESCRIPTION_VERIFIED'
  | 'PRESCRIPTION_OCR_PARSED'
  | 'NOOR_RESPONSE_MODERATED'
  | 'ORDER_PLACED_ESCROW_LOCKED'
  | 'SCHEDULE_H_DISPENSED'
  | 'ESCROW_RELEASED'
  | 'ESCROW_REFUNDED'
  | 'DISPUTE_FILED'
  | 'DISPUTE_RESOLVED'
  | 'ORDER_REASSIGNED';

export interface AuditRecord {
  id: string;
  eventType: AuditEventType;
  entityId: string;
  actorId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

/**
 * Appends an immutable record to the audit_log table.
 * Mandated for CDSCO Schedule H/H1 dispensing audits and DISHA compliance.
 */
export function logAuditEvent(
  eventType: AuditEventType,
  entityId: string,
  actorId: string | null = null,
  metadata: Record<string, unknown> = {}
): AuditRecord {
  const id = `aud-${randomUUID().slice(0, 12)}`;
  const now = new Date().toISOString();
  const metadataJson = JSON.stringify(metadata);

  try {
    const stmt = db.prepare(`
      INSERT INTO audit_log (id, event_type, entity_id, actor_id, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, eventType, entityId, actorId, metadataJson, now);
  } catch (error) {
    console.error(`[AUDIT ERROR] Failed to record audit event ${eventType} for entity ${entityId}:`, error);
  }

  return {
    id,
    eventType,
    entityId,
    actorId,
    metadata,
    createdAt: now,
  };
}

/**
 * Retrieves audit log records, ordered from most recent.
 */
export function getAuditLogs(limit = 50, entityId?: string): AuditRecord[] {
  try {
    let rows: Record<string, unknown>[];
    if (entityId) {
      rows = db.prepare('SELECT * FROM audit_log WHERE entity_id = ? ORDER BY created_at DESC LIMIT ?').all(entityId, limit) as Record<string, unknown>[];
    } else {
      rows = db.prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ?').all(limit) as Record<string, unknown>[];
    }

    return rows.map((r) => ({
      id: r.id as string,
      eventType: r.event_type as AuditEventType,
      entityId: r.entity_id as string,
      actorId: (r.actor_id as string) ?? null,
      metadata: JSON.parse((r.metadata as string) || '{}'),
      createdAt: r.created_at as string,
    }));
  } catch (error) {
    console.error('[AUDIT ERROR] Failed to query audit_log:', error);
    return [];
  }
}
