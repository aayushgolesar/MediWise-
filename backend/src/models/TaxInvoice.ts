import mongoose, { Schema } from 'mongoose';

export interface ITaxInvoice {
  _id: string; // invoice_number
  order_id: string;
  invoice_date: string;
  buyer_name: string;
  buyer_address: string;
  seller_hub: string;
  seller_gstin: string;
  seller_license: string;
  hsn_sac_code: string;
  item_total: number;
  platform_fee: number;
  cgst_rate: number;
  cgst_amount: number;
  sgst_rate: number;
  sgst_amount: number;
  grand_total: number;
  created_at: string;
}

const TaxInvoiceSchema = new Schema<ITaxInvoice>(
  {
    _id: { type: String, required: true },
    order_id: { type: String, required: true, unique: true },
    invoice_date: { type: String, required: true },
    buyer_name: { type: String, required: true },
    buyer_address: { type: String, required: true },
    seller_hub: { type: String, required: true },
    seller_gstin: { type: String, required: true },
    seller_license: { type: String, required: true },
    hsn_sac_code: { type: String, required: true },
    item_total: { type: Number, required: true },
    platform_fee: { type: Number, required: true },
    cgst_rate: { type: Number, default: 9.0 },
    cgst_amount: { type: Number, required: true },
    sgst_rate: { type: Number, default: 9.0 },
    sgst_amount: { type: Number, required: true },
    grand_total: { type: Number, required: true },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

export const TaxInvoice = mongoose.model<ITaxInvoice>('TaxInvoice', TaxInvoiceSchema);
