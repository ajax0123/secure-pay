import { DisputeCase } from '../../types/fraud';

interface Props {
  disputes: DisputeCase[];
  onSolve?: (dispute: DisputeCase) => void;
}

export const DisputeCasesTable = ({ disputes, onSolve }: Props) => {
  return (
    <section className="overflow-x-auto rounded-2xl border border-slate-700 bg-card-dark">
      <table className="min-w-full text-sm text-slate-300">
        <thead className="text-xs uppercase text-slate-400">
          <tr>
            <th className="px-4 py-3">Case ID</th>
            <th className="px-4 py-3">Transaction</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Report</th>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Message</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {disputes.map((dispute) => (
            <tr key={dispute._id} className="border-t border-slate-800">
              <td className="px-4 py-3 text-xs text-slate-200">{dispute._id}</td>
              <td className="px-4 py-3">{dispute.transaction_id?._id || 'N/A'}</td>
              <td className="px-4 py-3">{dispute.priority || 'normal'}</td>
              <td className="px-4 py-3">{dispute.status}</td>
              <td className="px-4 py-3 text-xs">{dispute.fraud_report_id?._id || 'N/A'}</td>
              <td className="px-4 py-3 text-xs">
                {dispute.user_display_name ||
                  (typeof dispute.user_id === 'string'
                    ? dispute.user_id
                    : dispute.user_id?.name || dispute.user_id?._id || 'User')}
              </td>
              <td className="px-4 py-3 text-xs break-words max-w-xl">{dispute.user_message || 'No message provided'}</td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white transition-colors duration-200 hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => onSolve?.(dispute)}
                >
                  {dispute.status === 'resolved' || dispute.status === 'closed' ? 'View' : 'Solve'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
