import { apiClient } from './client.js';
import type { Medicine, PharmacyOffer } from '../types/index.js';

export interface MedicinesFilter {
  category?: string;
  schedule?: string;
  search?: string;
}

export const getMedicines = async (filters?: MedicinesFilter): Promise<Medicine[]> => {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.schedule) params.set('schedule', filters.schedule);
  if (filters?.search) params.set('search', filters.search);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await apiClient.get<Medicine[]>(`/medicines${query}`);
  return res.data;
};

export const getMedicineById = async (id: string): Promise<Medicine> => {
  const res = await apiClient.get<Medicine>(`/medicines/${id}`);
  return res.data;
};

export const getMedicineOffers = async (medicineId: string): Promise<PharmacyOffer[]> => {
  const res = await apiClient.get<PharmacyOffer[]>(`/medicines/${medicineId}/offers`);
  return res.data;
};
