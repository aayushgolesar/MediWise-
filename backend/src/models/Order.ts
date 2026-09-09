import mongoose, { Schema } from 'mongoose';

export interface IOrder {
  _id: string;
  placed_time: string;
  delivery_eta: string;
  delivery_otp: string;
  status: string;
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  pharmacy_name: string;
  pharmacy_hub_id: string;
  pharmacy_address: string;
  pharmacy_license: string;
  pharmacist_name: string;
  pharmacist_reg: string;
  courier_name: string;
  courier_phone: string;
  courier_rating: number;
  vehicle_number: string;
  cold_chain_verified: boolean;
  current_distance_km: number;
  medicine_name: string;
  composition: string;
  pack_size: number;
  batch_number: string;
  seal_hash: string;
  price: number;
  item_total: number;
  packaging_tamper_fee: number;
  delivery_fee: number;
  platform_convenience: number;
  generic_savings: number;
  total_paid: number;
  escrow_status: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    _id: { type: String, required: true },
    placed_time: { type: String, required: true },
    delivery_eta: { type: String, required: true },
    delivery_otp: { type: String, required: true },
    status: { type: String, required: true, index: true },
    customer_name: { type: String, required: true },
    customer_address: { type: String, required: true },
    customer_phone: { type: String, required: true },
    pharmacy_name: { type: String, required: true },
    pharmacy_hub_id: { type: String, required: true },
    pharmacy_address: { type: String, default: '' },
    pharmacy_license: { type: String, default: '' },
    pharmacist_name: { type: String, default: '' },
    pharmacist_reg: { type: String, default: '' },
    courier_name: { type: String, default: '' },
    courier_phone: { type: String, default: '' },
    courier_rating: { type: Number, default: 0 },
    vehicle_number: { type: String, default: '' },
    cold_chain_verified: { type: Boolean, default: false },
    current_distance_km: { type: Number, default: 0 },
    medicine_name: { type: String, required: true },
    composition: { type: String, default: '' },
    pack_size: { type: Number, required: true },
    batch_number: { type: String, default: '' },
    seal_hash: { type: String, default: '' },
    price: { type: Number, required: true },
    item_total: { type: Number, required: true },
    packaging_tamper_fee: { type: Number, default: 12 },
    delivery_fee: { type: Number, default: 15 },
    platform_convenience: { type: Number, default: 5 },
    generic_savings: { type: Number, default: 0 },
    total_paid: { type: Number, required: true },
    escrow_status: { type: String, default: 'Held in Escrow' },
  },
  { _id: false }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
