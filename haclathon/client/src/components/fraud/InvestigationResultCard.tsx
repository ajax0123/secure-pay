import { FraudReport } from '../../types/fraud';

export const InvestigationResultCard = ({ report }: { report: FraudReport | null }) => {
  if (!report) return null;

  return (
    <section className="rounded-xl border border-slate-700 bg-card-dark p-5">
      <h3 className="text-lg font-semibold text-white">Investigation Result</h3>
      <p className="mt-3 text-sm text-slate-300">{report.ai_analysis || 'Investigation update pending.'}</p>
      <p className="mt-2 text-xs text-slate-400">Risk Score: {report.risk_score}</p>
    </section>
  );
};
