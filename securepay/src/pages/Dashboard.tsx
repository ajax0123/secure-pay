import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { Wallet, ArrowUpRight, ArrowDownLeft, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function Dashboard({ user }: { user: any }) {
  const [balance, setBalance] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [balanceRes, historyRes] = await Promise.all([
          axios.get('/api/wallet/balance', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/transactions/history', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setBalance(balanceRes.data.data);
        setHistory(historyRes.data.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-[#00D4FF]">Scanning network...</div>;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">System Overview</h1>
          <p className="text-gray-400 font-mono text-sm">SECURE_NODE_ID: {user.id.slice(-8).toUpperCase()}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#00D4FF] bg-[#00D4FF]/5 px-3 py-1 border border-[#00D4FF]/20 rounded">
          <div className="w-2 h-2 bg-[#00D4FF] rounded-full animate-pulse" />
          ENCRYPTION_ACTIVE: AES-256-CBC
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-gradient-to-br from-[#00D4FF]/10 to-transparent border border-[#00D4FF]/20 p-8 rounded-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <p className="text-[#00D4FF] font-mono text-sm mb-2 uppercase tracking-widest">Available Credits</p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black tracking-tighter">${balance?.balance?.$numberDecimal || '0.00'}</span>
              <span className="text-[#00D4FF] font-bold">USD</span>
            </div>
            <div className="mt-8 flex gap-4">
              <button className="bg-[#00D4FF] text-[#0A0E27] px-6 py-2 rounded font-bold uppercase text-sm hover:shadow-[0_0_20px_#00D4FF] transition-all">
                Add Funds
              </button>
              <button className="border border-[#00D4FF] text-[#00D4FF] px-6 py-2 rounded font-bold uppercase text-sm hover:bg-[#00D4FF]/10 transition-all">
                Withdraw
              </button>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          <div className="bg-[#151B3D] border border-white/5 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold uppercase text-sm tracking-wider">Security Status</h3>
              <ShieldCheck className="text-green-400 w-5 h-5" />
            </div>
            <div className="space-y-3">
              <SecurityItem label="KYC Verification" status={user.kycStatus === 'verified' ? 'PASS' : 'PENDING'} active={user.kycStatus === 'verified'} />
              <SecurityItem label="2FA Authentication" status="ACTIVE" active={true} />
              <SecurityItem label="Fraud Protection" status="SHIELD_ON" active={true} />
            </div>
          </div>

          <div className="bg-[#151B3D] border border-white/5 p-6 rounded-2xl">
            <h3 className="font-bold uppercase text-sm tracking-wider mb-4">Privacy Level</h3>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-[#00D4FF] w-3/4 shadow-[0_0_10px_#00D4FF]" />
            </div>
            <p className="text-[10px] font-mono text-gray-500 mt-2 uppercase">Data Exposure: Minimal (75% Protected)</p>
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black tracking-tighter uppercase italic">Recent Activity</h2>
          <button className="text-xs font-mono text-[#00D4FF] hover:underline uppercase">View All Logs</button>
        </div>
        <div className="space-y-3">
          {history.map((tx, i) => (
            <motion.div 
              key={tx.txId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#151B3D]/50 border border-white/5 p-4 rounded-xl flex items-center justify-between hover:border-[#00D4FF]/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.senderId._id === user.id ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                  {tx.senderId._id === user.id ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-sm">
                    {tx.senderId._id === user.id ? `Sent to ${tx.receiverId.name}` : `Received from ${tx.senderId.name}`}
                  </p>
                  <p className="text-[10px] font-mono text-gray-500 uppercase">{new Date(tx.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-black ${tx.senderId._id === user.id ? 'text-white' : 'text-green-400'}`}>
                  {tx.senderId._id === user.id ? '-' : '+'}${tx.amount.$numberDecimal}
                </p>
                {tx.isFlagged && (
                  <div className="flex items-center gap-1 text-[8px] font-mono text-yellow-500 uppercase justify-end">
                    <AlertTriangle className="w-2 h-2" />
                    Review Required
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SecurityItem({ label, status, active }: { label: string, status: string, active: boolean }) {
  return (
    <div className="flex items-center justify-between text-[10px] font-mono">
      <span className="text-gray-500 uppercase">{label}</span>
      <span className={active ? 'text-[#00D4FF]' : 'text-yellow-500'}>[{status}]</span>
    </div>
  );
}
