import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Users, Activity, Lock, Unlock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Admin() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/admin/fraud-logs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLogs(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-red-500">Command Center</h1>
          <p className="text-gray-400 font-mono text-sm uppercase">Administrative Oversight & Fraud Resolution</p>
        </div>
        <div className="flex gap-4">
          <StatCard icon={<Users className="w-4 h-4" />} label="Total Nodes" value="1,284" />
          <StatCard icon={<Activity className="w-4 h-4" />} label="Active TX/min" value="42" />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-6">
          <section className="bg-[#151B3D] border border-red-500/20 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-red-500/5 flex items-center justify-between">
              <h2 className="font-bold uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                Flagged Transactions
              </h2>
              <span className="bg-red-500 text-white text-[10px] font-mono px-2 py-0.5 rounded-full">3 PENDING</span>
            </div>
            
            <div className="divide-y divide-white/5">
              {/* Mocked Fraud Logs for Demo */}
              <FraudItem 
                id="TX_8F9E2B" 
                user="Alice Smith" 
                amount="25,000.00" 
                risk="0.82" 
                flags={['new_recipient', 'high_value']} 
                time="2 mins ago"
              />
              <FraudItem 
                id="TX_3A2B1C" 
                user="Bob Johnson" 
                amount="120,000.00" 
                risk="0.98" 
                flags={['large_amount', 'unusual_hour']} 
                time="15 mins ago"
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-[#151B3D] border border-white/5 p-6 rounded-2xl">
            <h3 className="font-bold uppercase text-sm tracking-wider mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <ActionButton icon={<Lock className="w-4 h-4" />} label="Lock Global Transfers" color="bg-red-500" />
              <ActionButton icon={<Unlock className="w-4 h-4" />} label="Emergency Unlock" color="bg-green-500" />
              <ActionButton icon={<Activity className="w-4 h-4" />} label="Generate Report" color="bg-[#00D4FF]" />
            </div>
          </div>

          <div className="bg-[#151B3D] border border-white/5 p-6 rounded-2xl">
            <h3 className="font-bold uppercase text-sm tracking-wider mb-4">System Health</h3>
            <div className="space-y-4">
              <HealthBar label="Database" percentage={98} />
              <HealthBar label="Fraud Engine" percentage={100} />
              <HealthBar label="Auth Service" percentage={95} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-[#151B3D] border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
      <div className="text-[#00D4FF]">{icon}</div>
      <div>
        <p className="text-[8px] font-mono text-gray-500 uppercase">{label}</p>
        <p className="text-sm font-black tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

function FraudItem({ id, user, amount, risk, flags, time }: any) {
  return (
    <div className="p-6 hover:bg-white/5 transition-colors flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#00D4FF]">{id}</span>
            <span className="text-xs font-bold">{user}</span>
          </div>
          <div className="flex gap-2 mt-1">
            {flags.map((f: string) => (
              <span key={f} className="text-[8px] font-mono bg-white/5 text-gray-400 px-1.5 py-0.5 rounded uppercase">{f}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="text-right flex items-center gap-8">
        <div>
          <p className="text-sm font-black">${amount}</p>
          <p className="text-[10px] font-mono text-gray-500 uppercase">{time}</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-black text-red-500">{risk}</p>
          <p className="text-[8px] font-mono text-gray-500 uppercase">Risk Score</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-all"><CheckCircle className="w-4 h-4" /></button>
          <button className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"><XCircle className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, color }: any) {
  return (
    <button className={`w-full ${color}/10 border border-${color}/20 text-white py-2 px-4 rounded-lg text-[10px] font-bold uppercase flex items-center gap-2 hover:brightness-125 transition-all`}>
      {icon}
      {label}
    </button>
  );
}

function HealthBar({ label, percentage }: any) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[8px] font-mono uppercase">
        <span className="text-gray-500">{label}</span>
        <span className="text-[#00D4FF]">{percentage}%</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-[#00D4FF]" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
