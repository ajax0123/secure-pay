import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';

export const RiskScoreGauge = ({ score }: { score: number }) => {
  const data = [{ value: score }];

  return (
    <section className="rounded-2xl border border-slate-700 bg-card-dark p-6">
      <h3 className="text-lg font-semibold text-white">Risk Score</h3>
      <div className="h-48">
        <ResponsiveContainer>
          <RadialBarChart
            data={data}
            innerRadius="70%"
            outerRadius="100%"
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar dataKey="value" cornerRadius={10} fill="#f59e0b" />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <p className="-mt-6 text-center text-2xl font-bold text-warning">{score}/100</p>
    </section>
  );
};
