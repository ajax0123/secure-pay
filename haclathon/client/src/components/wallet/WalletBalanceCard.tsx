import { Lock, Unlock } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

interface Props {
  balance: number;
  isFrozen: boolean;
  lockEnabled: boolean;
  onToggleLock: () => void;
}

export const WalletBalanceCard = ({ balance, isFrozen, lockEnabled, onToggleLock }: Props) => {
  return (
    <section className="rounded-2xl border border-slate-700 bg-card-dark p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">Available Balance</p>
          <h2 className="mt-2 text-3xl font-bold text-white">{formatCurrency(balance)}</h2>
        </div>
        <button
          className="rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-100"
          onClick={onToggleLock}
        >
          {lockEnabled ? (
            <span className="inline-flex items-center gap-2"><Unlock className="h-4 w-4" />Unlock</span>
          ) : (
            <span className="inline-flex items-center gap-2"><Lock className="h-4 w-4" />Lock</span>
          )}
        </button>
      </div>
      {isFrozen ? (
        <div className="mt-4 inline-flex rounded-full border border-danger/50 bg-danger/10 px-3 py-1 text-xs text-red-300">
          Account Frozen
        </div>
      ) : null}
    </section>
  );
};
