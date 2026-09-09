import { apiClient } from './client.js';
import type { OrderDetail, PatientProfile, PrescriptionAudit } from '../types/index.js';

export interface PlaceOrderPayload {
  medicineId: string;
  medicineName: string;
  pharmacyHubId: string;
  pharmacyName: string;
  packSize: number;
  price: number;
  itemTotal: number;
  genericSavings: number;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  deliveryEta?: string;
}

export interface PlaceOrderResult {
  orderId: string;
  deliveryOtp: string;
  escrowStatus: string;
  status: string;
}

export const placeOrder = async (payload: PlaceOrderPayload): Promise<PlaceOrderResult> => {
  const res = await apiClient.post<PlaceOrderResult>('/orders', payload);
  return res.data;
};

export const getOrder = async (orderId: string): Promise<OrderDetail> => {
  const res = await apiClient.get<OrderDetail>(`/orders/${orderId}`);
  return res.data;
};

export const confirmDeliveryOtp = async (orderId: string, otp: string): Promise<{ status: string; escrowStatus: string }> => {
  const res = await apiClient.put<{ status: string; escrowStatus: string }>(`/orders/${orderId}/otp`, { otp });
  return res.data;
};

export const getPatientProfiles = async (): Promise<PatientProfile[]> => {
  const res = await apiClient.get<PatientProfile[]>('/orders/patients');
  return res.data;
};

export const getPrescriptionAudit = async (): Promise<PrescriptionAudit | null> => {
  const res = await apiClient.get<PrescriptionAudit | null>('/orders/prescription');
  return res.data;
};
