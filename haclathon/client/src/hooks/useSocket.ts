import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { AuthTokenPayload } from '../types/user';

let socket: Socket | null = null;

export const useSocket = () => {
  const { token, user, updateUser } = useAuth();

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      return;
    }

    let decoded: AuthTokenPayload;
    try {
      decoded = jwtDecode<AuthTokenPayload>(token);
    } catch {
      return;
    }

    socket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket']
    });

    const socketInstance = socket;

    socketInstance.on('connect', () => {
      socketInstance.emit('join_room', {
        userId: decoded.userId,
        role: decoded.role
      });
    });

    socketInstance.on('fraud_alert', (payload: { transactionId: string; riskScore: number }) => {
      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: {
            type: 'warning',
            message: `Fraud alert: Transaction ${payload.transactionId} risk ${payload.riskScore}`
          }
        })
      );
    });

    socketInstance.on('new_fraud_report', (payload: { transactionId: string; userId: string }) => {
      if (user.role === 'admin') {
        window.dispatchEvent(
          new CustomEvent('app-toast', {
            detail: {
              type: 'danger',
              message: `New fraud report for transaction ${payload.transactionId} (user ${payload.userId})`
            }
          })
        );
      }
    });

    socketInstance.on('account_frozen', (payload: { userId: string; reason: string; riskScore: number }) => {
      if (user?.id === payload.userId) {
        updateUser?.({
          ...user,
          account_frozen: true,
          freeze_reason: payload.reason
        });
      }

      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: {
            type: 'danger',
            message: `Account frozen for ${payload.userId}: ${payload.reason} (risk ${payload.riskScore})`
          }
        })
      );
    });

    return () => {
      socketInstance.off('connect');
      socketInstance.off('fraud_alert');
      socketInstance.off('new_fraud_report');
      socketInstance.off('account_frozen');
      socketInstance.disconnect();
      socket = null;
    };
  }, [token, user, updateUser]);
};
