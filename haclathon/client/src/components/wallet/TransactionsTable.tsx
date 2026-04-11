import { Transaction } from '../../types/transaction';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { StatusBadge } from '../shared/StatusBadge';

interface Props {
  transactions: Transaction[];
  onReport: (transaction: Transaction) => void;
  onReceipt: (transactionId: string) => void;
}

export const TransactionsTable = ({ transactions, onReport, onReceipt }: Props) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-card-dark">
      <table className="min-w-full text-left text-sm text-slate-300">
        <thead className="border-b border-slate-700 text-xs uppercase text-slate-400">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">From / To</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b border-slate-800">
              <td className="px-4 py-3">{formatDate(tx.timestamp)}</td>
              <td className="px-4 py-3">
                <p>{tx.sender.email}</p>
                <p className="text-xs text-slate-500">to {tx.receiver.email}</p>
              </td>
              <td className="px-4 py-3">{formatCurrency(tx.amount)}</td>
              <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button className="rounded-md bg-danger px-2 py-1 text-xs text-white" onClick={() => onReport(tx)}>
                    Report Fraud
                  </button>
                  <button className="rounded-md bg-success px-2 py-1 text-xs text-white" onClick={() => onReceipt(tx.id)}>
                    Receipt
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
