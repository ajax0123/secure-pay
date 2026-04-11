import { useCallback, useEffect, useState } from 'react';
import {
  deleteSessionApi,
  freezeAccountApi,
  getBalanceApi,
  getSessionsApi,
  getTransactionsApi,
  sendMoneyApi,
  toggleSecurityLockApi,
  verifyPinApi
} from '../api/walletApi';
import { Transaction, TransactionListResponse } from '../types/transaction';
import { SessionItem } from '../types/user';

interface UseWalletState {
  loading: boolean;
  balance: number;
  transactions: Transaction[];
  total: number;
  sessions: SessionItem[];
}

export const useWallet = () => {
  const [state, setState] = useState<UseWalletState>({
    loading: false,
    balance: 0,
    transactions: [],
    total: 0,
    sessions: []
  });

  const fetchBalance = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const data = await getBalanceApi();
      setState((prev) => ({ ...prev, balance: Number(data.balance) }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const fetchTransactions = useCallback(async (page = 1, limit = 10): Promise<TransactionListResponse | null> => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const data = await getTransactionsApi(page, limit);
      setState((prev) => ({ ...prev, transactions: data.transactions, total: data.total }));
      return data;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    const data = await getSessionsApi();
    setState((prev) => ({ ...prev, sessions: data.sessions }));
  }, []);

  const verifyPin = (pin: string) => verifyPinApi(pin);

  const sendMoney = async (payload: {
    receiverEmail: string;
    amount: number;
    note?: string;
    pinToken: string;
  }) => {
    await sendMoneyApi(payload);
    await Promise.all([fetchBalance(), fetchTransactions(1, 10)]);
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'success', message: 'Transfer completed.' } }));
  };

  const toggleSecurityLock = async (enabled: boolean, password?: string) => {
    await toggleSecurityLockApi(enabled, password);
    window.dispatchEvent(
      new CustomEvent('app-toast', {
        detail: {
          type: 'success',
          message: `Security lock ${enabled ? 'enabled' : 'disabled'}.`
        }
      })
    );
  };

  const freezeAccount = async (reason?: string) => {
    await freezeAccountApi(reason);
    window.dispatchEvent(
      new CustomEvent('app-toast', {
        detail: {
          type: 'warning',
          message: 'Account frozen. Contact admin to unfreeze.'
        }
      })
    );
  };

  const downloadReceipt = async (transactionId: string) => {
    try {
      const token = localStorage.getItem('wallet_token');
      if (!token) {
        throw new Error('Missing authentication token.');
      }

      const response = await fetch(`http://localhost:5000/api/wallet/receipt/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download receipt.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${transactionId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: { type: 'error', message: error instanceof Error ? error.message : 'Receipt download failed.' }
        })
      );
    }
  };

  const removeSession = async (id: string) => {
    await deleteSessionApi(id);
    await fetchSessions();
  };

  useEffect(() => {
    void fetchBalance();
    void fetchTransactions(1, 10);
  }, [fetchBalance, fetchTransactions]);

  return {
    ...state,
    fetchBalance,
    fetchTransactions,
    fetchSessions,
    verifyPin,
    sendMoney,
    toggleSecurityLock,
    freezeAccount,
    downloadReceipt,
    removeSession
  };
};
