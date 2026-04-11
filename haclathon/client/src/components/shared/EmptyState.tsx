import { ReactNode } from 'react';

export const EmptyState = ({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) => {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-8 text-center">
      <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
};
