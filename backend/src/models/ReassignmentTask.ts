import mongoose, { Schema } from 'mongoose';

export interface IReassignmentTask {
  _id: string; // order_id
  patient_name: string;
  medicine_name: string;
  original_hub: string;
  time_remaining_sec: number;
  total_timeout_sec: number;
  timeout_reason: string;
  candidate_hubs: string; // JSON array string
}

const ReassignmentTaskSchema = new Schema<IReassignmentTask>(
  {
    _id: { type: String, required: true },
    patient_name: { type: String, required: true },
    medicine_name: { type: String, required: true },
    original_hub: { type: String, required: true },
    time_remaining_sec: { type: Number, required: true },
    total_timeout_sec: { type: Number, required: true },
    timeout_reason: { type: String, required: true },
    candidate_hubs: { type: String, default: '[]' },
  },
  { _id: false }
);

export const ReassignmentTask = mongoose.model<IReassignmentTask>('ReassignmentTask', ReassignmentTaskSchema);
