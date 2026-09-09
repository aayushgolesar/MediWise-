import mongoose, { Schema } from 'mongoose';

export interface IQuarantineItem {
  _id: string;
  sku_name: string;
  generic_composition: string;
  hub_id: string;
  hub_name: string;
  locality: string;
  reported_price: number;
  system_floor_price: number;
  discrepancy_percent: number;
  last_heartbeat_ago: string;
  reason: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Quarantined' | 'Under Review' | 'Released';
}

const QuarantineItemSchema = new Schema<IQuarantineItem>(
  {
    _id: { type: String, required: true },
    sku_name: { type: String, required: true },
    generic_composition: { type: String, required: true },
    hub_id: { type: String, required: true },
    hub_name: { type: String, required: true },
    locality: { type: String, required: true },
    reported_price: { type: Number, required: true },
    system_floor_price: { type: Number, required: true },
    discrepancy_percent: { type: Number, required: true },
    last_heartbeat_ago: { type: String, required: true },
    reason: { type: String, required: true },
    severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], required: true },
    status: { type: String, enum: ['Quarantined', 'Under Review', 'Released'], required: true },
  },
  { _id: false }
);

export const QuarantineItem = mongoose.model<IQuarantineItem>('QuarantineItem', QuarantineItemSchema);
