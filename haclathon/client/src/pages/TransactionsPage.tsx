import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/shared/EmptyState';
import { Loader } from '../components/shared/Loader';
import { TransactionsTable } from '../components/wallet/TransactionsTable';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../context/AuthContext';
import { reportFraudApi } from '../api/fraudApi';
import { useFraud } from '../hooks/useFraud';
import { Transaction } from '../types/transaction';

type FilterType = 'all' | 'sent' | 'received' | 'flagged';

export const TransactionsPage = () => {
  const wallet = useWallet();
  const { fetchTransactions } = wallet;
  const fraud = useFraud();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    void fetchTransactions(page, limit);
  }, [fetchTransactions, page, limit]);

  const filtered = useMemo(() => {
    const list = wallet.transactions;
    if (filter === 'all') return list;
    if (filter === 'flagged') return list.filter((tx) => tx.status === 'flagged');
    if (filter === 'sent') return list.filter((tx) => tx.sender._id === user?.id);
    return list.filter((tx) => tx.receiver._id === user?.id);
  }, [wallet.transactions, filter, user?.id]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(['all', 'sent', 'received', 'flagged'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-2 text-xs capitalize ${filter === f ? 'bg-primary text-white' : 'bg-slate-800 text-slate-300'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {wallet.loading ? <Loader label="Loading transactions..." /> : null}

      {!wallet.loading && filtered.length === 0 ? (
        <EmptyState title="No transactions" subtitle="Try another filter or make your first transfer." />
      ) : null}

      {!wallet.loading && filtered.length > 0 ? (
        <TransactionsTable
          transactions={filtered}
          onReport={async (tx: Transaction) => {
            let matchedReport = fraud.reports.find(
              (report) => report.transaction_id?._id === tx.id
            );

            if (!matchedReport) {
              const reportResponse = await reportFraudApi({
                transactionId: tx.id,
                reason: 'User-initiated fraud report for disputed transaction.'
              });
              matchedReport = reportResponse.report;
            }

            navigate('/dispute', {
              state: {
                transactionId: tx.id,
                fraudReportId: matchedReport._id
              }
            });
          }}
          onReceipt={(transactionId) => void wallet.downloadReceipt(transactionId)}
        />
      ) : null}

      <div className="flex items-center justify-between text-sm text-slate-300">
        <button className="rounded-lg border border-slate-700 px-3 py-2 disabled:opacity-40" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </button>
        <span>Page {page}</span>
        <button
          className="rounded-lg border border-slate-700 px-3 py-2 disabled:opacity-40"
          disabled={page * limit >= wallet.total}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};
