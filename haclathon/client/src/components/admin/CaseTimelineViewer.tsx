import { AlertTriangle, CheckCircle2, Clock3, FileText, ShieldAlert, XCircle } from 'lucide-react';
import { AuditTimelineEntry, FraudReport } from '../../types/fraud';
import { formatDate } from '../../utils/formatDate';

const iconForEvent = (eventType: string) => {
  if (eventType === 'ACCOUNT_FREEZE') return <ShieldAlert className="h-4 w-4" />;
  if (eventType === 'FRAUD_REPORT') return <AlertTriangle className="h-4 w-4" />;
  if (eventType === 'LOGIN') return <Clock3 className="h-4 w-4" />;
  if (eventType === 'TRANSACTION') return <FileText className="h-4 w-4" />;
  if (eventType === 'PIN_FAIL') return <XCircle className="h-4 w-4" />;
  return <CheckCircle2 className="h-4 w-4" />;
};

export const CaseTimelineViewer = ({
  selected,
  timeline
}: {
  selected: FraudReport | null;
  timeline: AuditTimelineEntry[];
}) => {
  if (!selected) {
    return (
      <section className="rounded-2xl border border-slate-700 bg-card-dark p-6 text-sm text-slate-400">
        Select a fraud case to inspect timeline events.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-700 bg-card-dark p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Case Timeline</h3>
        <p className="text-sm text-slate-400">Fraud report {selected._id}</p>
      </div>

      {timeline.length === 0 ? (
        <div className="rounded-xl border border-slate-700 p-4 text-sm text-slate-400">
          No audit events found in the 24 hour investigation window.
        </div>
      ) : (
        <div className="relative pl-4">
          <div className="absolute left-5 top-0 h-full w-px bg-slate-700" />
          <div className="space-y-4">
            {timeline.map((entry, index) => (
              <div key={`${entry.time}-${index}`} className="relative flex gap-4">
                <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 bg-slate-900 text-slate-200">
                  {iconForEvent(entry.event_type)}
                </div>
                <div className="flex-1 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-100">{entry.event}</p>
                    <span className="text-xs text-slate-400">{formatDate(entry.time)}</span>
                  </div>
                  {entry.metadata?.reason ? <p className="mt-1 text-sm text-slate-300">Reason: {String(entry.metadata.reason)}</p> : null}
                  {entry.metadata?.direction ? <p className="mt-1 text-sm text-slate-300">Direction: {String(entry.metadata.direction)}</p> : null}
                  {entry.metadata?.amount ? <p className="mt-1 text-sm text-slate-300">Amount: ₹{String(entry.metadata.amount)}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
