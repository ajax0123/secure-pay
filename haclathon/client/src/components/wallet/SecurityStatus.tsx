export const SecurityStatus = ({
  lockEnabled,
  sessions,
  kycVerified,
  freezeReason
}: {
  lockEnabled: boolean;
  sessions: number;
  kycVerified: boolean;
  freezeReason?: string;
}) => {
  return (
    <section className="rounded-2xl border border-slate-700 bg-card-dark p-6">
      <h3 className="text-lg font-semibold text-white">Security Status</h3>
      <div className="mt-4 space-y-2 text-sm">
        <p className="text-slate-300">Security Lock: <strong>{lockEnabled ? 'Enabled' : 'Disabled'}</strong></p>
        <p className="text-slate-300">Active Sessions: <strong>{sessions}</strong></p>
        <p className="text-slate-300">KYC: <strong>{kycVerified ? 'Verified' : 'Pending'}</strong></p>
        {freezeReason ? (
          <p className="text-slate-300">Freeze Reason: <strong>{freezeReason}</strong></p>
        ) : null}
      </div>
    </section>
  );
};
