import mongoose, { Schema } from 'mongoose';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  role: 'patient' | 'pharmacist' | 'admin' | 'oem';
  abha_id?: string;
  pharmacy_hub_name?: string;
  pharmacist_reg_no?: string;
  cdsco_license?: string;
  avatar_url?: string;
  created_at: string;
}

const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ['patient', 'pharmacist', 'admin', 'oem'], required: true },
    abha_id: String,
    pharmacy_hub_name: String,
    pharmacist_reg_no: String,
    cdsco_license: String,
    avatar_url: String,
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

export const User = mongoose.model<IUser>('User', UserSchema);
