import { FraudReport } from '../../types/fraud';
import { StatusBadge } from '../shared/StatusBadge';

interface Props {
  reports: FraudReport[];
  onSelect: (report: FraudReport) => void;
}

export const FraudReportsTable = ({ reports, onSelect }: Props) => {
  return (
    <section className="overflow-x-auto rounded-2xl border border-slate-700 bg-card-dark">
      <table className="min-w-full text-sm text-slate-300">
        <thead className="text-xs uppercase text-slate-400">
          <tr>
            <th className="px-4 py-3">Transaction</th>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">Reason</th>
            <th className="px-4 py-3">Risk</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report._id} className="border-t border-slate-800">
              <td className="px-4 py-3 text-xs">{report.transaction_id?._id}</td>
              <td className="px-4 py-3 text-xs">
                {report.reported_by_name ||
                  (typeof report.reported_by === 'string'
                    ? report.reported_by
                    : report.reported_by?.name || report.reported_by?._id || 'Unknown user')}
              </td>
              <td className="px-4 py-3">{report.ai_generated ? 'AI' : 'User'}</td>
              <td className="px-4 py-3">{report.reason}</td>
              <td className="px-4 py-3">{report.risk_score}</td>
              <td className="px-4 py-3"><StatusBadge status={report.status} /></td>
              <td className="px-4 py-3">
                <button className="rounded-md bg-primary px-3 py-1 text-xs text-white" onClick={() => onSelect(report)}>
                  View Case
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
