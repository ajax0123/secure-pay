import { useState } from 'react';
import { WalletBalanceCard } from '../components/wallet/WalletBalanceCard';
import { QuickActions } from '../components/wallet/QuickActions';
import { RecentTransactions } from '../components/wallet/RecentTransactions';
import { RiskScoreGauge } from '../components/wallet/RiskScoreGauge';
import { SecurityStatus } from '../components/wallet/SecurityStatus';
import { SendMoneyModal } from '../components/wallet/SendMoneyModal';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../context/AuthContext';

export const DashboardPage = () => {
  const { user, updateUser } = useAuth();
  const wallet = useWallet();
  const [showSend, setShowSend] = useState(false);

  const onToggleLock = async () => {
    if (user?.security_lock_enabled) {
      const password = window.prompt('Enter password to disable security lock:');
      await wallet.toggleSecurityLock(false, password || undefined);
    } else {
      await wallet.toggleSecurityLock(true);
    }
  };

  const onFreezeRequest = async () => {
    if (user?.account_frozen) {
      return;
    }

    const reason = window.prompt(
      'Enter reason for freezing your account. Admin will review this before unfreezing.',
      'User requested freeze: please complete necessary actions before unfreezing.'
    );

    const freezeReason = reason?.trim() || 'User requested freeze. Please complete necessary actions before unfreezing.';
    await wallet.freezeAccount(freezeReason);

    if (user) {
      updateUser({
        ...user,
        account_frozen: true,
        freeze_reason: freezeReason
      });
    }
  };

  const onSendRequest = () => {
    if (user?.account_frozen) {
      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: {
            type: 'danger',
            message: 'Your account is frozen. Sending money is blocked.'
          }
        })
      );
      return;
    }

    setShowSend(true);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <WalletBalanceCard
          balance={wallet.balance}
          isFrozen={Boolean(user?.account_frozen)}
          lockEnabled={Boolean(user?.security_lock_enabled)}
          onToggleLock={() => void onToggleLock()}
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            disabled={Boolean(user?.account_frozen)}
            onClick={() => void onFreezeRequest()}
          >
            Freeze Account
          </button>
          {user?.account_frozen ? (
            <p className="text-sm text-danger">Your account is frozen. Contact admin to unfreeze.</p>
          ) : null}
        </div>
      </div>

      <QuickActions
        onSend={onSendRequest}
        disabled={Boolean(user?.account_frozen)}
        onDownload={() => {
          const latest = wallet.transactions[0];
          if (!latest) {
            window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'info', message: 'No receipt available yet.' } }));
            return;
          }
          void wallet.downloadReceipt(latest.id);
        }}
      />

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <RecentTransactions transactions={wallet.transactions} />
        <div className="space-y-6">
          <RiskScoreGauge score={user?.risk_score || 42} />
          <SecurityStatus
            lockEnabled={Boolean(user?.security_lock_enabled)}
            sessions={wallet.sessions.length}
            kycVerified={Boolean(user?.kyc_verified)}
            freezeReason={user?.freeze_reason}
          />
        </div>
      </div>

      <SendMoneyModal
        open={showSend && !user?.account_frozen}
        onClose={() => setShowSend(false)}
        riskScore={user?.risk_score || 42}
        loading={wallet.loading}
        onSubmit={async ({ receiverEmail, amount, note, pin }) => {
          const pinVerify = await wallet.verifyPin(pin);
          await wallet.sendMoney({
            receiverEmail,
            amount,
            note,
            pinToken: pinVerify.pinToken
          });
        }}
      />
    </div>
  );
};
