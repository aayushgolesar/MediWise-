import { apiClient } from './client.js';
import type { AuthUser } from '../types/index.js';

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: AuthUser['role'];
  abhaId?: string;
  pharmacyHubName?: string;
  pharmacistRegNo?: string;
  cdscoLicense?: string;
}

export interface AuthResult {
  user: AuthUser;
}

export const register = async (payload: RegisterPayload): Promise<AuthResult> => {
  const res = await apiClient.post<AuthResult>('/auth/register', payload);
  return res.data;
};

export const signIn = async (email: string, password: string): Promise<AuthResult> => {
  const res = await apiClient.post<AuthResult>('/auth/signin', { email, password });
  return res.data;
};

export const signOut = async (): Promise<void> => {
  await apiClient.post<void>('/auth/signout', {});
};

export const getMe = async (): Promise<AuthUser> => {
  const res = await apiClient.get<AuthUser>('/auth/me');
  return res.data;
};

export interface RegulatoryValidationResponse {
  valid: boolean;
  error?: string;
  normalized?: string;
}

export const validateRegulatory = async (
  type: 'abha' | 'pharmacist_reg' | 'cdsco_license',
  value: string
): Promise<RegulatoryValidationResponse> => {
  const res = await apiClient.post<RegulatoryValidationResponse>('/auth/validate-regulatory', { type, value }, { silent: true });
  return res.data;
};

