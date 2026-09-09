import { apiClient, ApiResponse } from './client.js';

export interface CreatePaymentOrderPayload {
  orderId?: string;
  itemTotal: number;
  packagingTamperFee: number;
  deliveryFee: number;
  platformConvenience: number;
  paymentMethod: 'upi' | 'card' | 'cod';
  customerName: string;
  customerPhone: string;
}

export interface PaymentOrderResponse {
  paymentId: string;
  gatewayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  breakdown: {
    itemTotal: number;
    packagingTamperFee: number;
    deliveryFee: number;
    platformConvenience: number;
    cgst: number;
    sgst: number;
    totalAmount: number;
  };
}

export interface VerifyPaymentPayload {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  signature: string;
  orderId: string;
}

export interface VerifyPaymentResponse {
  status: string;
  escrowStatus: string;
  orderId: string;
  gatewayPaymentId: string;
}

export interface TaxInvoice {
  invoiceNumber: string;
  orderId: string;
  invoiceDate: string;
  buyerName: string;
  buyerAddress: string;
  sellerHub: string;
  sellerGstin: string;
  sellerLicense: string;
  hsnSacCode: string;
  itemTotal: number;
  platformFee: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  grandTotal: number;
}

/**
 * Creates a gateway order and calculates GST breakdown
 */
export const createPaymentOrder = async (payload: CreatePaymentOrderPayload): Promise<PaymentOrderResponse> => {
  const res = await apiClient.post<PaymentOrderResponse>('/payments/create-order', payload);
  return res.data;
};

/**
 * Verifies gateway cryptographic signature and locks payment in escrow
 */
export const verifyPayment = async (payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> => {
  const res = await apiClient.post<VerifyPaymentResponse>('/payments/verify', payload);
  return res.data;
};

/**
 * Fetches digital GST tax invoice for an order
 */
export const getTaxInvoice = async (orderId: string): Promise<TaxInvoice> => {
  const res = await apiClient.get<TaxInvoice>(`/payments/invoice/${orderId}`);
  return res.data;
};

/**
 * Flags an order as under dispute and locks escrow release
 */
export const fileOrderDispute = async (orderId: string, reason: string): Promise<{ orderId: string; escrowStatus: string }> => {
  const res = await apiClient.post<{ orderId: string; escrowStatus: string }>(`/orders/${orderId}/dispute`, { reason });
  return res.data;
};
