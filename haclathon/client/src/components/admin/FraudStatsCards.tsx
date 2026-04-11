interface Props {
  totalReports: number;
  openCases: number;
  frozenAccounts: number;
  avgRisk: number;
}

export const FraudStatsCards = ({ totalReports, openCases, frozenAccounts, avgRisk }: Props) => {
  const cards = [
    { label: 'Total Reports', value: totalReports, color: 'text-primary' },
    { label: 'Open Cases', value: openCases, color: 'text-warning' },
    { label: 'Frozen Accounts', value: frozenAccounts, color: 'text-danger' },
    { label: 'Avg Risk', value: avgRisk.toFixed(1), color: 'text-success' }
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-slate-700 bg-card-dark p-5">
          <p className="text-xs text-slate-400">{card.label}</p>
          <p className={`mt-2 text-2xl font-semibold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </section>
  );
};
