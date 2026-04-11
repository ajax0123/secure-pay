import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send, Mail, DollarSign, MessageSquare, ShieldAlert, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SendMoney() {
  const [receiverEmail, setReceiverEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [success, setSuccess] = useState<any>(null);
  const navigate = useNavigate();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/transactions/send', 
        { receiverEmail, amount: Number(amount), note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(res.data.data);
      setTimeout(() => navigate('/history'), 3000);
    } catch (err: any) {
      setError(err.response?.data || { error: 'Transaction failed' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#151B3D] border border-[#00D4FF]/30 p-12 rounded-3xl text-center space-y-6 max-w-md w-full"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="text-green-400 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white">Transfer Complete</h2>
          <div className="bg-[#0A0E27] p-4 rounded-xl font-mono text-xs space-y-2">
            <div className="flex justify-between text-gray-500"><span>TX_ID:</span> <span className="text-[#00D4FF]">{success.txId}</span></div>
            <div className="flex justify-between text-gray-500"><span>AMOUNT:</span> <span className="text-white">${success.amount.$numberDecimal} USD</span></div>
            <div className="flex justify-between text-gray-500"><span>STATUS:</span> <span className="text-green-400">VERIFIED</span></div>
          </div>
          <p className="text-gray-400 text-sm">Redirecting to history...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic">Secure Transfer</h1>
        <p className="text-gray-400 font-mono text-sm uppercase">P2P Encrypted Transaction Tunnel</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={handleSend} className="bg-[#151B3D] border border-white/5 p-8 rounded-3xl space-y-6 shadow-2xl">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase">
                  <ShieldAlert className="w-4 h-4" />
                  Security Protocol Violation
                </div>
                <p className="text-red-300 text-sm">{error.error}</p>
                {error.flags && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {error.flags.map((f: string) => (
                      <span key={f} className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px] font-mono">{f}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest ml-1">Recipient Node (Email)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="email" 
                  required
                  value={receiverEmail}
                  onChange={(e) => setReceiverEmail(e.target.value)}
                  className="w-full bg-[#0A0E27] border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] outline-none transition-all font-mono text-sm"
                  placeholder="receiver@securepay.net"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest ml-1">Transfer Amount (USD)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="number" 
                  required
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#0A0E27] border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] outline-none transition-all font-mono text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest ml-1">Encrypted Metadata (Note)</label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-[#0A0E27] border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] outline-none transition-all font-mono text-sm min-h-[100px]"
                  placeholder="Optional transaction details..."
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#00D4FF] text-[#0A0E27] py-4 rounded-xl font-black uppercase tracking-tighter flex items-center justify-center gap-2 hover:shadow-[0_0_30px_#00D4FF] transition-all disabled:opacity-50"
            >
              {loading ? 'Analyzing Risk...' : 'Execute Transfer'}
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-[#151B3D] border border-white/5 p-6 rounded-2xl">
            <h3 className="font-bold uppercase text-sm tracking-wider mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#00D4FF]" />
              AI Risk Engine
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Every transaction is analyzed by our Isolation Forest ML model in real-time.
            </p>
            <ul className="space-y-2 text-[10px] font-mono text-gray-500 uppercase">
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#00D4FF] rounded-full" /> Velocity Checks</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#00D4FF] rounded-full" /> Amount Deviation</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#00D4FF] rounded-full" /> Recipient Profiling</li>
            </ul>
          </div>

          <div className="bg-yellow-500/5 border border-yellow-500/20 p-6 rounded-2xl">
            <h3 className="font-bold uppercase text-sm tracking-wider mb-2 text-yellow-500">Notice</h3>
            <p className="text-[10px] text-yellow-500/70 leading-relaxed uppercase font-mono">
              Transactions over $20,000 to new recipients will be flagged for manual review by the Diamond Team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
