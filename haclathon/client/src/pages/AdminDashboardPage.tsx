import { useEffect, useMemo, useState } from 'react';
import {
  getAdminDisputesApi,
  getCaseTimelineAdminApi,
  getFraudReportsAdminApi,
  getUsersAdminApi
} from '../api/adminApi';
import { CaseTimelineViewer } from '../components/admin/CaseTimelineViewer';
import { DisputeCasesTable } from '../components/admin/DisputeCasesTable';
import { DisputeResolutionModal } from '../components/admin/DisputeResolutionModal';
import { FraudReportsTable } from '../components/admin/FraudReportsTable';
import { FraudStatsCards } from '../components/admin/FraudStatsCards';
import { FraudTrendChart, TrendPoint } from '../components/admin/FraudTrendChart';
import { RiskBucket, RiskHeatmapChart } from '../components/admin/RiskHeatmapChart';
import { EmptyState } from '../components/shared/EmptyState';
import { AuditTimelineEntry, DisputeCase, FraudReport } from '../types/fraud';
import { User } from '../types/user';

const makeTrend = (reports: FraudReport[]): TrendPoint[] => {
  const map = new Map<string, number>();
  reports.forEach((report) => {
    const day = new Date(report.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    map.set(day, (map.get(day) || 0) + 1);
  });

  return Array.from(map.entries()).map(([day, count]) => ({ day, reports: count }));
};

const makeHeatmap = (reports: FraudReport[]): RiskBucket[] => {
  const buckets: Record<string, number> = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
  reports.forEach((report) => {
    if (report.risk_score <= 20) buckets['0-20'] += 1;
    else if (report.risk_score <= 40) buckets['21-40'] += 1;
    else if (report.risk_score <= 60) buckets['41-60'] += 1;
    else if (report.risk_score <= 80) buckets['61-80'] += 1;
    else buckets['81-100'] += 1;
  });

  return Object.entries(buckets).map(([bucket, count]) => ({ bucket, count }));
};

export const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<FraudReport[]>([]);
  const [disputes, setDisputes] = useState<DisputeCase[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<FraudReport | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<DisputeCase | null>(null);
  const [timeline, setTimeline] = useState<AuditTimelineEntry[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reportsRes, disputesRes, usersRes] = await Promise.all([
        getFraudReportsAdminApi(),
        getAdminDisputesApi(),
        getUsersAdminApi()
      ]);
      setReports(reportsRes.reports);
      setDisputes(disputesRes.disputes);
      setUsers(usersRes.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  useEffect(() => {
    if (!selected) {
      setTimeline([]);
      return;
    }

    const loadTimeline = async () => {
      const data = await getCaseTimelineAdminApi(selected._id);
      setTimeline(data.timeline);
    };

    void loadTimeline();
  }, [selected]);

  const totalReports = reports.length;
  const openCases = reports.filter((r) => r.status === 'open' || r.status === 'investigating').length;
  const frozenAccounts = users.filter((u) => u.account_frozen).length;
  const avgRisk = reports.length ? reports.reduce((sum, r) => sum + r.risk_score, 0) / reports.length : 0;
  const sortedDisputes = useMemo(
    () => [...disputes].sort((a, b) => (a.priority === b.priority ? 0 : a.priority === 'high' ? -1 : 1)),
    [disputes]
  );

  const trendData = useMemo(() => makeTrend(reports), [reports]);
  const heatmapData = useMemo(() => makeHeatmap(reports), [reports]);

  if (loading) {
    return <div className="text-sm text-slate-300">Loading admin analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <FraudStatsCards totalReports={totalReports} openCases={openCases} frozenAccounts={frozenAccounts} avgRisk={avgRisk} />

      {sortedDisputes.length === 0 ? (
        <EmptyState title="No active dispute cases" subtitle="User-entered disputes will be surfaced here for priority review." />
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-white">Priority Dispute Cases</h2>
          <DisputeCasesTable disputes={sortedDisputes} onSolve={setSelectedDispute} />
        </div>
      )}

      {reports.length === 0 ? <EmptyState title="No AI fraud reports" subtitle="AI-generated fraud cases will appear here once detected." /> : null}

      <DisputeResolutionModal
        open={Boolean(selectedDispute)}
        dispute={selectedDispute}
        onClose={() => setSelectedDispute(null)}
        onResolved={fetchData}
      />

      {reports.length > 0 ? <FraudReportsTable reports={reports} onSelect={setSelected} /> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <FraudTrendChart data={trendData} />
        <RiskHeatmapChart data={heatmapData} />
      </div>

      <CaseTimelineViewer selected={selected} timeline={timeline} />
    </div>
  );
};
