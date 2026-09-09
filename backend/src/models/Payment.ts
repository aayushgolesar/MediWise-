import mongoose, { Schema } from 'mongoose';

export interface IPayment {
  _id: string;
  gateway_order_id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: 'created' | 'captured' | 'failed' | 'refunded';
  payment_method: string;
  gateway_payment_id?: string;
  signature?: string;
  created_at: string;
  updated_at: string;
}

const PaymentSchema = new Schema<IPayment>(
  {
    _id: { type: String, required: true },
    gateway_order_id: { type: String, required: true, unique: true },
    order_id: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['created', 'captured', 'failed', 'refunded'], required: true },
    payment_method: { type: String, required: true },
    gateway_payment_id: String,
    signature: String,
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
