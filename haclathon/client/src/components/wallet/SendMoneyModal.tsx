import { FormEvent, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { receiverEmail: string; amount: number; note?: string; pin: string }) => Promise<void>;
  riskScore: number;
  loading: boolean;
}

export const SendMoneyModal = ({ open, onClose, onSubmit, riskScore, loading }: Props) => {
  const [step, setStep] = useState(1);
  const [receiverEmail, setReceiverEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canProceed = useMemo(() => {
    if (step === 1) {
      return receiverEmail.includes('@') && Number(amount) > 0;
    }
    if (step === 2) {
      return /^\d{4,6}$/.test(pin);
    }
    return true;
  }, [step, receiverEmail, amount, pin]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const normalizedReceiverEmail = receiverEmail.trim();

    try {
      await onSubmit({ receiverEmail: normalizedReceiverEmail, amount: Number(amount), note, pin });
      setStep(1);
      setReceiverEmail('');
      setAmount('');
      setNote('');
      setPin('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form onSubmit={submit} className="w-full max-w-lg rounded-2xl border border-slate-700 bg-card-dark p-6">
        <h3 className="text-xl font-semibold text-white">Send Money</h3>

        {step === 1 ? (
          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white"
              placeholder="Receiver email"
              value={receiverEmail}
              onChange={(e) => setReceiverEmail(e.target.value)}
            />
            <input
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white"
              placeholder="Amount"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <textarea
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white"
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm tracking-[0.35em] text-white"
              placeholder="Enter PIN"
              type="password"
              value={pin}
              maxLength={6}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            />
            <p className="text-xs text-slate-400">Enter your 4-6 digit transaction PIN.</p>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-4 space-y-2 rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-200">
            <p><strong>Receiver:</strong> {receiverEmail}</p>
            <p><strong>Amount:</strong> ₹{amount}</p>
            {riskScore > 50 ? (
              <div className="mt-2 flex items-start gap-2 rounded-md border border-warning/50 bg-warning/10 p-2 text-warning">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <p>Risk warning: This transfer has elevated fraud risk score ({riskScore}).</p>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 flex justify-between">
          <button
            type="button"
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200"
            onClick={() => {
              if (step === 1) onClose();
              else setStep((prev) => prev - 1);
            }}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              type="button"
              disabled={!canProceed}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              onClick={() => setStep((prev) => prev + 1)}
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || submitting}
              className="rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading || submitting ? 'Processing...' : 'Confirm Transfer'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
