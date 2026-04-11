interface StatusBadgeProps {
  status: string;
}

const styleMap: Record<string, string> = {
  completed: 'bg-success/15 text-green-300 border-success/40',
  pending: 'bg-warning/15 text-amber-300 border-warning/40',
  flagged: 'bg-danger/15 text-red-300 border-danger/40',
  reversed: 'bg-slate-700 text-slate-300 border-slate-600',
  investigating: 'bg-warning/15 text-amber-300 border-warning/40',
  open: 'bg-primary/15 text-indigo-300 border-primary/40',
  resolved: 'bg-success/15 text-green-300 border-success/40',
  closed: 'bg-slate-700 text-slate-300 border-slate-600',
  under_review: 'bg-warning/15 text-amber-300 border-warning/40',
  rejected: 'bg-danger/15 text-red-300 border-danger/40'
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const style = styleMap[status] || 'bg-slate-700 text-slate-300 border-slate-600';

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${style}`}>
      {status.replace('_', ' ')}
    </span>
  );
};
