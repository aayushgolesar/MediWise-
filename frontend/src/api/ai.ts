import { apiClient } from './client.js';
import type { PrescriptionAudit } from '../types/index.js';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface NoorResponse {
  response: string;
  guardrailFired: boolean;
}

export const askNoor = async (message: string, history?: ChatMessage[]): Promise<NoorResponse> => {
  const res = await apiClient.post<NoorResponse>('/ai/chat', { message, history });
  return res.data;
};

export interface ModerationLogEntry {
  id: string;
  session_id: string;
  patient_name: string;
  user_prompt: string;
  bot_response: string;
  guardrail_fired: number;
  risk_level: string;
  created_at: string;
  reviewed: number;
}

export const getModerationQueue = async (): Promise<ModerationLogEntry[]> => {
  const res = await apiClient.get<ModerationLogEntry[]>('/ai/moderation');
  return res.data;
};

export const markModerationReviewed = async (
  id: string,
  action: 'approve' | 'redact' = 'approve',
): Promise<{ id: string; reviewed: boolean; status?: string; bot_response?: string }> => {
  const res = await apiClient.put<{ id: string; reviewed: boolean; status?: string; bot_response?: string }>(
    `/ai/moderation/${id}`,
    { action },
  );
  return res.data;
};

export const parsePrescription = async (
  imageBase64: string,
  fileName: string,
  mimeType: string,
): Promise<PrescriptionAudit> => {
  const res = await apiClient.post<PrescriptionAudit>('/rx/parse', {
    imageBase64,
    fileName,
    mimeType,
  });
  return res.data;
};
