import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, AlertTriangle, FileText, Download } from 'lucide-react';
import { motion } from 'motion/react';

export default function History() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/transactions/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(tx => 
    tx.txId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.senderId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.receiverId.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-[#00D4FF]">Accessing Audit Logs...</div>;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Audit Ledger</h1>
          <p className="text-gray-400 font-mono text-sm uppercase">Immutable Transaction History</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white/5 border border-white/10 p-2 rounded-lg hover:bg-white/10 transition-colors">
            <Download className="w-5 h-5" />
          </button>
          <button className="bg-white/5 border border-white/10 p-2 rounded-lg hover:bg-white/10 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input 
          type="text"
          placeholder="Search by TX_ID or Entity Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#151B3D] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:border-[#00D4FF] outline-none transition-all font-mono text-sm"
        />
      </div>

      <div className="bg-[#151B3D] border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0A0E27]/50 border-b border-white/5">
                <th className="p-6 text-[10px] font-mono text-gray-500 uppercase tracking-widest">Transaction ID</th>
                <th className="p-6 text-[10px] font-mono text-gray-500 uppercase tracking-widest">Entity</th>
                <th className="p-6 text-[10px] font-mono text-gray-500 uppercase tracking-widest">Amount</th>
                <th className="p-6 text-[10px] font-mono text-gray-500 uppercase tracking-widest">Status</th>
                <th className="p-6 text-[10px] font-mono text-gray-500 uppercase tracking-widest">Timestamp</th>
                <th className="p-6 text-[10px] font-mono text-gray-500 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredHistory.map((tx, i) => {
                const isSender = tx.senderId._id === user?.id;
                return (
                  <motion.tr 
                    key={tx.txId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-6 font-mono text-xs text-[#00D4FF]">{tx.txId.slice(0, 12)}...</td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center ${isSender ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                          {isSender ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{isSender ? tx.receiverId.name : tx.senderId.name}</p>
                          <p className="text-[10px] text-gray-500 font-mono">{isSender ? 'OUTGOING' : 'INCOMING'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className={`font-black ${isSender ? 'text-white' : 'text-green-400'}`}>
                        {isSender ? '-' : '+'}${tx.amount.$numberDecimal}
                      </p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${tx.isFlagged ? 'bg-yellow-500' : 'bg-green-500'}`} />
                        <span className={`text-[10px] font-mono uppercase ${tx.isFlagged ? 'text-yellow-500' : 'text-green-500'}`}>
                          {tx.isFlagged ? 'Review' : 'Verified'}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-[10px] font-mono text-gray-500 uppercase">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="p-6">
                      <button className="text-gray-500 hover:text-white transition-colors">
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredHistory.length === 0 && (
          <div className="p-20 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-mono uppercase text-sm">No records found in current sector</p>
          </div>
        )}
      </div>
    </div>
  );
}
