import { Transaction } from '../../types/transaction';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { EmptyState } from '../shared/EmptyState';
import { StatusBadge } from '../shared/StatusBadge';

export const RecentTransactions = ({ transactions }: { transactions: Transaction[] }) => {
  if (transactions.length === 0) {
    return <EmptyState title="No transactions yet" subtitle="Your latest transfers will appear here." />;
  }

  return (
    <section className="rounded-2xl border border-slate-700 bg-card-dark p-6">
      <h3 className="mb-3 text-lg font-semibold text-white">Recent Transactions</h3>
      <div className="space-y-3">
        {transactions.slice(0, 5).map((tx) => (
          <div key={tx.id} className="flex items-center justify-between rounded-lg border border-slate-700 p-3">
            <div>
              <p className="text-sm font-medium text-slate-100">{tx.sender.email} {'->'} {tx.receiver.email}</p>
              <p className="text-xs text-slate-400">{formatDate(tx.timestamp)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-100">{formatCurrency(tx.amount)}</p>
              <StatusBadge status={tx.status} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
