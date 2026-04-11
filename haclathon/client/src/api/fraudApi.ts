import api from './axios';
import { FraudReport, DisputeCase } from '../types/fraud';

export const reportFraudApi = async (payload: { transactionId: string; reason: string }) => {
  const { data } = await api.post<{ message: string; report: FraudReport }>('/api/fraud/report', payload);
  return data;
};

export const getFraudLogsApi = async (): Promise<{ reports: FraudReport[] }> => {
  const { data } = await api.get<{ reports: FraudReport[] }>('/api/fraud/logs');
  return data;
};

export const createDisputeApi = async (payload: { transactionId: string; fraudReportId: string; message: string }) => {
  const { data } = await api.post<{ message: string; dispute: DisputeCase }>('/api/dispute/create', payload);
  return data;
};

export const getDisputeStatusApi = async (id: string): Promise<{ dispute: DisputeCase }> => {
  const { data } = await api.get<{ dispute: DisputeCase }>(`/api/dispute/status/${id}`);
  return data;
};

export const getUserDisputesApi = async (): Promise<{ disputes: DisputeCase[] }> => {
  const { data } = await api.get<{ disputes: DisputeCase[] }>('/api/dispute/my');
  return data;
};
