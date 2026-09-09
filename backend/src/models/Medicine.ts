import mongoose, { Schema } from 'mongoose';

export interface IMedicine {
  _id: string;
  brand_name: string;
  generic_name: string;
  strength: string;
  dosage_form: string;
  therapeutic_category: string;
  category: string;
  schedule: string;
  mrp_reference: number;
  starting_price: number;
  discount_percent: number;
  cdsco_approved: boolean;
  bioequivalent_verified: boolean;
  bioequivalent_to: string;
  in_stock: boolean;
  stock_count: number;
  hub_count: number;
  indications: string[];
  description: string;
  pack_options: unknown[];
}

const MedicineSchema = new Schema<IMedicine>(
  {
    _id: { type: String, required: true },
    brand_name: { type: String, required: true },
    generic_name: { type: String, required: true },
    strength: { type: String, required: true },
    dosage_form: { type: String, required: true },
    therapeutic_category: { type: String, required: true },
    category: { type: String, required: true },
    schedule: { type: String, required: true },
    mrp_reference: { type: Number, required: true },
    starting_price: { type: Number, required: true },
    discount_percent: { type: Number, required: true },
    cdsco_approved: { type: Boolean, default: true },
    bioequivalent_verified: { type: Boolean, default: true },
    bioequivalent_to: { type: String, default: '' },
    in_stock: { type: Boolean, default: true },
    stock_count: { type: Number, default: 0 },
    hub_count: { type: Number, default: 0 },
    indications: { type: [String], default: [] },
    description: { type: String, default: '' },
    pack_options: { type: [Schema.Types.Mixed], default: [] },
  },
  { _id: false }
);

// Full-text search indexes
MedicineSchema.index({ brand_name: 'text', generic_name: 'text', bioequivalent_to: 'text' });
MedicineSchema.index({ category: 1 });
MedicineSchema.index({ schedule: 1 });

export const Medicine = mongoose.model<IMedicine>('Medicine', MedicineSchema);
