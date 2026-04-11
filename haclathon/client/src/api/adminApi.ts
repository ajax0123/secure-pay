import api from './axios';
import { CaseTimelineResponse, DisputeCase, FraudReport } from '../types/fraud';
import { User } from '../types/user';

export const getFraudReportsAdminApi = async (): Promise<{ reports: FraudReport[] }> => {
  const { data } = await api.get<{ reports: FraudReport[] }>('/api/admin/fraud-reports');
  return data;
};

export const freezeAccountAdminApi = (userId: string, reason?: string) =>
  api.post('/api/admin/freeze-account', { userId, reason });

export const unfreezeAccountAdminApi = (userId: string) => api.post('/api/admin/unfreeze-account', { userId });

export const closeCaseAdminApi = (disputeCaseId: string, adminNotes: string, status: 'resolved' | 'closed' | 'under_review') =>
  api.post('/api/admin/close-case', { disputeCaseId, adminNotes, status });

export const getAdminDisputesApi = async (): Promise<{ disputes: DisputeCase[] }> => {
  const { data } = await api.get<{ disputes: DisputeCase[] }>('/api/dispute/my');
  return data;
};

export const getUsersAdminApi = async (): Promise<{ users: User[] }> => {
  const { data } = await api.get<{ users: User[] }>('/api/admin/users');
  return data;
};

export const getCaseTimelineAdminApi = async (fraudReportId: string): Promise<CaseTimelineResponse> => {
  const { data } = await api.get<CaseTimelineResponse>(`/api/admin/case-timeline/${fraudReportId}`);
  return data;
};
