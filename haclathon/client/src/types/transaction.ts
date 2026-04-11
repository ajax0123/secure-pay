export type TransactionStatus = 'pending' | 'completed' | 'flagged' | 'reversed';

export interface TxParty {
  _id: string;
  name: string;
  email: string;
}

export interface Transaction {
  id: string;
  amount: number;
  status: TransactionStatus;
  risk_score: number;
  timestamp: string;
  sender: TxParty;
  receiver: TxParty;
  payload?: {
    reference?: string;
    note?: string;
    initiated_at?: string;
  };
}

export interface TransactionListResponse {
  page: number;
  limit: number;
  total: number;
  transactions: Transaction[];
}
