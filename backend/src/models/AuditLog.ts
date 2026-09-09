import mongoose, { Schema } from 'mongoose';

export interface IAuditLog {
  _id: string;
  event_type: string;
  entity_id: string;
  actor_id?: string | null;
  metadata: string; // JSON string
  created_at: string;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    _id: { type: String, required: true },
    event_type: { type: String, required: true, index: true },
    entity_id: { type: String, required: true, index: true },
    actor_id: { type: String, default: null },
    metadata: { type: String, default: '{}' },
    created_at: { type: String, required: true },
  },
  { _id: false }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
