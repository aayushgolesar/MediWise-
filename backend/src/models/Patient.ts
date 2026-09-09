import mongoose, { Schema } from 'mongoose';

export interface IPatient {
  _id: string;
  user_id?: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  relation: string;
  abha_id: string;
  phone: string;
}

const PatientSchema = new Schema<IPatient>(
  {
    _id: { type: String, required: true },
    user_id: String,
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    relation: { type: String, required: true },
    abha_id: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

export const Patient = mongoose.model<IPatient>('Patient', PatientSchema);
