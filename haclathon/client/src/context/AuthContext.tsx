/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthTokenPayload, User } from '../types/user';
import { loginApi, logoutApi } from '../api/authApi';

interface AuthContextValue {
  token: string | null;
  user: User | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: (sessionId?: string) => Promise<void>;
  updateUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const hydrateUser = (): { token: string | null; user: User | null; sessionId: string | null } => {
  const token = localStorage.getItem('wallet_token');
  const savedUser = localStorage.getItem('wallet_user');

  if (!token) {
    return { token: null, user: null, sessionId: null };
  }

  try {
    const decoded = jwtDecode<AuthTokenPayload>(token);
    const parsed = savedUser ? (JSON.parse(savedUser) as User) : null;

    const user: User = {
      id: decoded.userId,
      role: decoded.role,
      name: parsed?.name || decoded.name || 'Wallet User',
      email: parsed?.email || '',
      account_frozen: parsed?.account_frozen || false,      freeze_reason: parsed?.freeze_reason,      security_lock_enabled: parsed?.security_lock_enabled || false,
      risk_score: parsed?.risk_score || 42,
      kyc_verified: parsed?.kyc_verified
    };

    return { token, user, sessionId: decoded.sessionId || null };
  } catch {
    localStorage.removeItem('wallet_token');
    localStorage.removeItem('wallet_user');
    return { token: null, user: null, sessionId: null };
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const initial = hydrateUser();
  const [token, setToken] = useState<string | null>(initial.token);
  const [user, setUser] = useState<User | null>(initial.user);
  const [sessionId, setSessionId] = useState<string | null>(initial.sessionId);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await loginApi({ email, password });
      localStorage.setItem('wallet_token', response.token);
      localStorage.setItem('wallet_user', JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
      setSessionId(response.sessionId);
      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: { type: 'success', message: 'Login successful.' }
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (newUser: User | null) => {
    if (!newUser) {
      localStorage.removeItem('wallet_user');
      setUser(null);
      return;
    }

    setUser(newUser);
    localStorage.setItem('wallet_user', JSON.stringify(newUser));
  };

  const logout = async (id?: string) => {
    try {
      await logoutApi(id ? { sessionId: id } : undefined);
    } catch {
      // Ignore logout API failure; local cleanup still required.
    }

    localStorage.removeItem('wallet_token');
    localStorage.removeItem('wallet_user');
    setToken(null);
    setUser(null);
    setSessionId(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      sessionId,
      isAuthenticated: Boolean(token),
      loading,
      login,
      logout,
      updateUser
    }),
    [token, user, sessionId, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
