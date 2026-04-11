export interface User {
  id: string;
  _id?: string;
  name: string;
  decrypted_name?: string;
  email: string;
  decrypted_email?: string;
  role: 'user' | 'admin';
  account_frozen: boolean;
  freeze_reason?: string;
  security_lock_enabled: boolean;
  risk_score: number;
  kyc_verified?: boolean;
}

export interface SessionItem {
  _id: string;
  user_id: string;
  device: string;
  browser: string;
  ip_address: string;
  location: string;
  login_time: string;
  last_active: string;
  is_active: boolean;
}

export interface AuthTokenPayload {
  userId: string;
  role: 'user' | 'admin';
  sessionId?: string;
  name?: string;
  iat: number;
  exp: number;
}
