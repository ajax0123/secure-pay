import api from './axios';
import { TransactionListResponse } from '../types/transaction';
import { SessionItem } from '../types/user';

export interface BalanceResponse {
  balance: string;
  currency: 'INR';
}

export const getBalanceApi = async (): Promise<BalanceResponse> => {
  const { data } = await api.get<BalanceResponse>('/api/wallet/balance');
  return data;
};

export const verifyPinApi = async (pin: string): Promise<{ pinToken: string; expiresIn: string }> => {
  const { data } = await api.post<{ pinToken: string; expiresIn: string }>('/api/wallet/verify-pin', { pin });
  return data;
};

export const sendMoneyApi = (payload: {
  receiverEmail: string;
  amount: number;
  note?: string;
  pinToken: string;
}) => api.post('/api/wallet/send', payload);

export const getTransactionsApi = async (page = 1, limit = 10): Promise<TransactionListResponse> => {
  const { data } = await api.get<TransactionListResponse>(`/api/wallet/transactions?page=${page}&limit=${limit}`);
  return data;
};

export const getReceiptApi = async (transactionId: string): Promise<Blob> => {
  const { data } = await api.get(`/api/wallet/receipt/${transactionId}`, {
    responseType: 'blob'
  });
  return data as Blob;
};

export const toggleSecurityLockApi = (enabled: boolean, password?: string) =>
  api.post('/api/wallet/security-lock', { enabled, password });

export const freezeAccountApi = (reason?: string) =>
  api.post('/api/wallet/freeze-account', { reason });

export const getSessionsApi = async (): Promise<{ sessions: SessionItem[] }> => {
  const { data } = await api.get<{ sessions: SessionItem[] }>('/api/wallet/sessions');
  return data;
};

export const deleteSessionApi = (id: string) => api.delete(`/api/wallet/sessions/${id}`);
