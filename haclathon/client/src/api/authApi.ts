import api from './axios';
import { User } from '../types/user';

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
  sessionId: string;
}

export const signupApi = (payload: {
  name: string;
  email: string;
  password: string;
  transactionPin: string;
}) => api.post('/api/auth/signup', payload);

export const loginApi = async (payload: { email: string; password: string }): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>('/api/auth/login', payload);
  return data;
};

export const kycApi = (payload: { identityNumber: string }) => api.post('/api/auth/kyc', payload);
export const logoutApi = (payload?: { sessionId?: string }) => api.post('/api/auth/logout', payload || {});
