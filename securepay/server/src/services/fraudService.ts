import axios from 'axios';

const FRAUD_SERVICE_URL = process.env.FRAUD_SERVICE_URL || 'http://localhost:5000';

export interface FraudCheckRequest {
  transaction_amount: number;
  hour_of_day: number;
  day_of_week: number;
  sender_avg_transaction: number;
  amount_deviation: number;
  transactions_last_hour: number;
  is_new_recipient: boolean;
  is_round_number: boolean;
}

export interface FraudCheckResponse {
  risk_score: number;
  recommendation: 'ALLOW' | 'REVIEW' | 'BLOCK';
  flags: string[];
}

export const checkFraud = async (data: FraudCheckRequest): Promise<FraudCheckResponse> => {
  try {
    const response = await axios.post(`${FRAUD_SERVICE_URL}/predict`, data);
    return response.data;
  } catch (error) {
    console.error('Fraud service error:', error);
    // Fallback logic if service is down
    if (data.transaction_amount > 100000) {
      return { risk_score: 0.9, recommendation: 'BLOCK', flags: ['large_amount_fallback'] };
    }
    return { risk_score: 0.1, recommendation: 'ALLOW', flags: [] };
  }
};
