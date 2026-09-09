import mongoose, { Schema } from 'mongoose';

export interface IPharmacyOffer {
  _id: string;
  medicine_id: string;
  pharmacy_name: string;
  hub_id: string;
  locality: string;
  distance_km: number;
  sla_minutes: number;
  mrp: number;
  discounted_price: number;
  discount_percent: number;
  in_stock: boolean;
  stock_units: number;
  batch_number: string;
  expiry_date: string;
  hologram_verified: boolean;
  license_number: string;
  rating: number;
  review_count: number;
  savings: number;
  is_recommended: boolean;
}

const PharmacyOfferSchema = new Schema<IPharmacyOffer>(
  {
    _id: { type: String, required: true },
    medicine_id: { type: String, required: true, index: true },
    pharmacy_name: { type: String, required: true },
    hub_id: { type: String, required: true },
    locality: { type: String, required: true },
    distance_km: { type: Number, required: true },
    sla_minutes: { type: Number, required: true },
    mrp: { type: Number, required: true },
    discounted_price: { type: Number, required: true },
    discount_percent: { type: Number, required: true },
    in_stock: { type: Boolean, default: true },
    stock_units: { type: Number, default: 0 },
    batch_number: { type: String, required: true },
    expiry_date: { type: String, required: true },
    hologram_verified: { type: Boolean, default: true },
    license_number: { type: String, required: true },
    rating: { type: Number, default: 0 },
    review_count: { type: Number, default: 0 },
    savings: { type: Number, default: 0 },
    is_recommended: { type: Boolean, default: false },
  },
  { _id: false }
);

export const PharmacyOffer = mongoose.model<IPharmacyOffer>('PharmacyOffer', PharmacyOfferSchema);
