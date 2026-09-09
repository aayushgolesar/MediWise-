import mongoose, { Schema } from 'mongoose';

export interface IDisputeCase {
  _id: string; // case_id
  order_id: string;
  customer_name: string;
  medicine_name: string;
  dispute_type: string;
  escrow_amount: number;
  customer_claim_photo_url: string;
  dispatch_baseline_url: string;
  seal_barcode_expected: string;
  seal_barcode_reported: string;
  courier_gps_duration: string;
  courier_shock_spike: string;
  status: string;
}

const DisputeCaseSchema = new Schema<IDisputeCase>(
  {
    _id: { type: String, required: true },
    order_id: { type: String, required: true },
    customer_name: { type: String, required: true },
    medicine_name: { type: String, required: true },
    dispute_type: { type: String, required: true },
    escrow_amount: { type: Number, required: true },
    customer_claim_photo_url: { type: String, required: true },
    dispatch_baseline_url: { type: String, required: true },
    seal_barcode_expected: { type: String, required: true },
    seal_barcode_reported: { type: String, required: true },
    courier_gps_duration: { type: String, required: true },
    courier_shock_spike: { type: String, required: true },
    status: { type: String, default: 'Pending Triage' },
  },
  { _id: false }
);

export const DisputeCase = mongoose.model<IDisputeCase>('DisputeCase', DisputeCaseSchema);
