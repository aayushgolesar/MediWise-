import { apiClient } from './client.js';
import type { QuarantineItem, DisputeCase, TenantHub } from '../types/index.js';

// ─── Quarantine ───────────────────────────────────────────────────────────────

export const getQuarantineItems = async (): Promise<QuarantineItem[]> => {
  const res = await apiClient.get<QuarantineItem[]>('/admin/quarantine');
  return res.data;
};

export const updateQuarantineItem = async (id: string, action: 'release' | 'escalate'): Promise<{ id: string; status: string }> => {
  const res = await apiClient.put<{ id: string; status: string }>(`/admin/quarantine/${id}`, { action });
  return res.data;
};

// ─── Reassignment ─────────────────────────────────────────────────────────────

export interface ReassignmentTaskData {
  orderId: string;
  patientName: string;
  medicineName: string;
  originalHub: string;
  timeRemainingSec: number;
  totalTimeoutSec: number;
  timeoutReason: string;
  candidateHubs: Array<{
    hubId: string;
    name: string;
    distanceKm: number;
    stock: number;
    slaMinutes: number;
    matchScore: number;
    status: 'Optimal' | 'Secondary' | 'Excluded';
  }>;
}

export const getReassignmentTasks = async (): Promise<ReassignmentTaskData[]> => {
  const res = await apiClient.get<ReassignmentTaskData[]>('/admin/reassignment');
  return res.data;
};

export const assignOrderToHub = async (orderId: string, hubId: string): Promise<{ orderId: string; assignedHubId: string }> => {
  const res = await apiClient.post<{ orderId: string; assignedHubId: string }>(`/admin/reassignment/${orderId}/assign`, { hubId });
  return res.data;
};

// ─── Disputes ─────────────────────────────────────────────────────────────────

export const getDisputeCases = async (): Promise<DisputeCase[]> => {
  const res = await apiClient.get<DisputeCase[]>('/admin/disputes');
  return res.data;
};

export const resolveDispute = async (
  caseId: string,
  resolution: 'Refund Approved' | 'Dispute Rejected' | 'Hub Penalized'
): Promise<{ caseId: string; status: string }> => {
  const res = await apiClient.put<{ caseId: string; status: string }>(`/admin/disputes/${caseId}/resolve`, { resolution });
  return res.data;
};

// ─── Hubs (Super Admin) ───────────────────────────────────────────────────────

export const getTenantHubs = async (): Promise<TenantHub[]> => {
  const res = await apiClient.get<TenantHub[]>('/admin/hubs');
  return res.data;
};
