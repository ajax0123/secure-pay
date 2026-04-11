export const Loader = ({ label = 'Loading...' }: { label?: string }) => {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-slate-300">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-primary" />
      <span className="text-sm">{label}</span>
    </div>
  );
};
