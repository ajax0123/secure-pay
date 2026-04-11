export type FraudReportStatus = 'open' | 'investigating' | 'resolved' | 'rejected';
export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'closed';

export interface FraudReport {
  _id: string;
  transaction_id: {
    _id: string;
    amount: number;
    status: string;
    timestamp: string;
  };
  reported_by?: {
    _id?: string;
    name?: string;
    email?: string;
    risk_score?: number;
  } | string;
  reported_by_name?: string;
  reported_by_email?: string;
  reason: string;
  ai_generated: boolean;
  ai_analysis: string;
  risk_score: number;
  status: FraudReportStatus;
  created_at: string;
}

export interface DisputeCase {
  _id: string;
  transaction_id: {
    _id: string;
    amount: number;
    timestamp: string;
  };
  fraud_report_id: {
    _id: string;
    status: FraudReportStatus;
    reason: string;
  };
  user_id?: {
    _id?: string;
    name?: string;
  };
  user_display_name?: string;
  user_message?: string;
  admin_notes: string;
  priority: 'normal' | 'high';
  status: DisputeStatus;
  created_at: string;
}

export interface AuditTimelineEntry {
  time: string;
  event_type: string;
  event: string;
  metadata: Record<string, string | number | boolean | null>;
}

export interface CaseTimelineResponse {
  fraudReportId: string;
  transactionId: string;
  timeline: AuditTimelineEntry[];
}
