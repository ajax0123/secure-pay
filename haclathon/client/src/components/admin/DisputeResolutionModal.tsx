import { FormEvent, useEffect, useState } from 'react';
import { closeCaseAdminApi } from '../../api/adminApi';
import { DisputeCase } from '../../types/fraud';

interface Props {
  open: boolean;
  dispute: DisputeCase | null;
  onClose: () => void;
  onResolved: () => Promise<void>;
}

export const DisputeResolutionModal = ({ open, dispute, onClose, onResolved }: Props) => {
  const [adminNotes, setAdminNotes] = useState(dispute?.admin_notes || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (dispute) {
      setAdminNotes(dispute.admin_notes || '');
      setError('');
    }
  }, [dispute]);

  const resetForm = () => {
    setAdminNotes(dispute?.admin_notes || '');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dispute) return;
    setError('');
    setSubmitting(true);

    try {
      await closeCaseAdminApi(dispute._id, adminNotes.trim() || 'Resolved by admin', 'resolved');
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'success', message: 'Dispute marked as resolved.' } }));
      await onResolved();
      handleClose();
    } catch {
      setError('Failed to resolve dispute. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !dispute) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-card-dark p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white">Resolve Dispute</h3>
            <p className="mt-1 text-sm text-slate-400">Case ID: {dispute._id}</p>
          </div>
          <button type="button" className="text-slate-300 hover:text-white" onClick={handleClose}>
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500">Transaction</p>
            <p className="mt-2 break-all">{dispute.transaction_id?._id || 'N/A'}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
            <p className="mt-2">{dispute.status}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-200">
          <p className="text-xs uppercase tracking-wide text-slate-500">User Message</p>
          <p className="mt-2 whitespace-pre-line">{dispute.user_message || 'No message provided.'}</p>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-300">Admin Notes</label>
          <textarea
            className="mt-2 h-32 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500"
            placeholder="Explain how the dispute was solved for the user"
            value={adminNotes}
            onChange={(event) => setAdminNotes(event.target.value)}
            required
          />
        </div>

        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Resolve Case'}
          </button>
        </div>
      </form>
    </div>
  );
};
