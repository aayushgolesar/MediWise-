import mongoose, { Schema } from 'mongoose';

export interface ITenantHub {
  _id: string; // tenant_id
  hub_name: string;
  schema_name: string;
  city: string;
  locality: string;
  db_latency_ms: number;
  active_orders: number;
  storage_mb: number;
  cdsco_license: string;
  status: 'Active' | 'Degraded' | 'Syncing' | 'Maintenance';
}

const TenantHubSchema = new Schema<ITenantHub>(
  {
    _id: { type: String, required: true },
    hub_name: { type: String, required: true },
    schema_name: { type: String, required: true, unique: true },
    city: { type: String, required: true },
    locality: { type: String, required: true },
    db_latency_ms: { type: Number, default: 0 },
    active_orders: { type: Number, default: 0 },
    storage_mb: { type: Number, default: 0 },
    cdsco_license: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Degraded', 'Syncing', 'Maintenance'], required: true },
  },
  { _id: false }
);

export const TenantHub = mongoose.model<ITenantHub>('TenantHub', TenantHubSchema);
