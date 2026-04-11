import { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/shared/EmptyState';
import { StatusBadge } from '../components/shared/StatusBadge';
import { useFraud } from '../hooks/useFraud';
import { DisputeCase } from '../types/fraud';

interface PrefillState {
  transactionId?: string;
  fraudReportId?: string;
}

export const DisputePage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const location = useLocation();
  const navigate = useNavigate();
  const fraud = useFraud();
  const prefilledState = (location.state as PrefillState | null) ?? null;
  const [transactionId, setTransactionId] = useState(prefilledState?.transactionId ?? '');
  const [fraudReportId, setFraudReportId] = useState(prefilledState?.fraudReportId ?? '');
  const [message, setMessage] = useState('');
  const [submittedDispute, setSubmittedDispute] = useState<DisputeCase | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const dispute = await fraud.submitDispute(transactionId, fraudReportId, message);
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'success', message: 'Dispute submitted.' } }));
    if (dispute?._id) {
      const populated = await fraud.fetchDispute(dispute._id);
      setSubmittedDispute(populated);
    }
    setTransactionId('');
    setFraudReportId('');
    setMessage('');
    navigate('.', { replace: true, state: {} });
  };

  return (
    <div className="space-y-6">
      {!isAdmin ? (
        <form onSubmit={onSubmit} className="rounded-2xl border border-slate-700 bg-card-dark p-6">
          <h2 className="text-xl font-semibold text-white">Submit Dispute</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white"
              placeholder="Transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              required
            />
            <input
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white"
              placeholder="Fraud Report ID"
              value={fraudReportId}
              onChange={(e) => setFraudReportId(e.target.value)}
              required
            />
          </div>
          <div className="mt-4">
            <textarea
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white"
              placeholder="Describe why this fraud report is incorrect or provide details for dispute review"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              required
            />
          </div>
          <button className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white" disabled={fraud.loading}>
            {fraud.loading ? 'Submitting...' : 'Submit Dispute'}
          </button>
        </form>
      ) : null}

      {submittedDispute ? (
        <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-200">
          <p className="font-medium">Latest submitted dispute</p>
          <p className="mt-2">Transaction: {submittedDispute.transaction_id?._id || 'N/A'}</p>
          <p>Report: {submittedDispute.fraud_report_id?._id || 'N/A'}</p>
          <p className="mt-2">Your Message: {submittedDispute.user_message || 'No message provided.'}</p>
          <p className="mt-2">Status: {submittedDispute.status}</p>
        </div>
      ) : null}

      {((submittedDispute ? [submittedDispute, ...fraud.disputes.filter((item) => item._id !== submittedDispute._id)] : fraud.disputes).length) === 0 ? (
        <EmptyState title="No dispute cases" subtitle="Your submitted disputes will appear here." />
      ) : (
        <div className="space-y-3">
          {(submittedDispute ? [submittedDispute, ...fraud.disputes.filter((item) => item._id !== submittedDispute._id)] : fraud.disputes).map((item) => (
            <div key={item._id} className="rounded-xl border border-slate-700 bg-card-dark p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-slate-200">Case {item._id}</p>
                <button
                  className="rounded-md border border-slate-600 px-3 py-1 text-xs text-slate-200"
                  onClick={() => void fraud.fetchDispute(item._id)}
                >
                  Refresh Status
                </button>
              </div>
              <div className="mt-2 text-sm text-slate-300">
                <p>Transaction: {item.transaction_id?._id || 'N/A'}</p>
                <p>Report: {item.fraud_report_id?._id || 'N/A'}</p>
                {user?.role === 'admin' ? (
                  <p>
                    Reported by: {item.user_display_name || item.user_id?.name || item.user_id?._id || 'Unknown user'}
                  </p>
                ) : null}
                <StatusBadge status={item.status} />
                <p className="mt-2">Your Message: {item.user_message || 'No message provided.'}</p>
                <p className="mt-2">Admin Notes: {item.admin_notes || 'No notes yet.'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
