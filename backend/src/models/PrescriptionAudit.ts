import mongoose, { Schema } from 'mongoose';

export interface IPrescriptionAudit {
  _id: string; // rx_id
  order_id?: string;
  file_name: string;
  upload_date: string;
  doctor_name: string;
  doctor_reg_no: string;
  hospital_clinic: string;
  prescribed_for: string;
  drug_name: string;
  dosage: string;
  duration_days: number;
  frequency: string;
  dispense_limit: number;
  ocr_verified: boolean;
  needs_pharmacist_review: boolean;
  confidence_json: string;
  schedule_category: string;
}

const PrescriptionAuditSchema = new Schema<IPrescriptionAudit>(
  {
    _id: { type: String, required: true },
    order_id: String,
    file_name: { type: String, required: true },
    upload_date: { type: String, required: true },
    doctor_name: { type: String, required: true },
    doctor_reg_no: { type: String, required: true },
    hospital_clinic: { type: String, required: true },
    prescribed_for: { type: String, required: true },
    drug_name: { type: String, default: '' },
    dosage: { type: String, required: true },
    duration_days: { type: Number, required: true },
    frequency: { type: String, required: true },
    dispense_limit: { type: Number, required: true },
    ocr_verified: { type: Boolean, default: false },
    needs_pharmacist_review: { type: Boolean, default: false },
    confidence_json: { type: String, default: '{}' },
    schedule_category: { type: String, required: true },
  },
  { _id: false }
);

export const PrescriptionAudit = mongoose.model<IPrescriptionAudit>('PrescriptionAudit', PrescriptionAuditSchema);
