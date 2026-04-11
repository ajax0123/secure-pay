import { useState } from 'react';
import { Shield, Eye, EyeOff, Download, Trash2, ShieldCheck, Lock } from 'lucide-react';
import { motion } from 'motion/react';

export default function Privacy() {
  const [analytics, setAnalytics] = useState(true);
  const [visibility, setVisibility] = useState(true);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic">Privacy Control</h1>
        <p className="text-gray-400 font-mono text-sm uppercase">Manage Your Digital Footprint</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#151B3D] border border-white/5 p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00D4FF]/10 rounded-xl flex items-center justify-center">
                <ShieldCheck className="text-[#00D4FF] w-6 h-6" />
              </div>
              <h3 className="font-bold uppercase tracking-wider">Data Tracking</h3>
            </div>
            <Toggle active={analytics} onToggle={() => setAnalytics(!analytics)} />
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Anonymous analytics help us improve the network security and performance. No personal data is ever collected.
          </p>
        </div>

        <div className="bg-[#151B3D] border border-white/5 p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00D4FF]/10 rounded-xl flex items-center justify-center">
                {visibility ? <Eye className="text-[#00D4FF] w-6 h-6" /> : <EyeOff className="text-red-400 w-6 h-6" />}
              </div>
              <h3 className="font-bold uppercase tracking-wider">Public Profile</h3>
            </div>
            <Toggle active={visibility} onToggle={() => setVisibility(!visibility)} />
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            When enabled, other users can find your node by email to initiate secure transfers.
          </p>
        </div>
      </div>

      <div className="bg-[#151B3D] border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-8 border-b border-white/5">
          <h3 className="font-bold uppercase tracking-wider mb-2">Data Portability</h3>
          <p className="text-xs text-gray-400">Download a complete archive of your transaction history and account metadata in JSON format.</p>
        </div>
        <div className="p-6 bg-[#0A0E27]/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border border-white/10 rounded-xl flex items-center justify-center text-gray-500">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold">Account_Data_Archive.zip</p>
              <p className="text-[10px] font-mono text-gray-500 uppercase">Size: 1.2 MB • Format: JSON/AES-256</p>
            </div>
          </div>
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all">
            Request Download
          </button>
        </div>
      </div>

      <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-3 text-red-400">
          <Trash2 className="w-6 h-6" />
          <h3 className="font-bold uppercase tracking-wider">Danger Zone</h3>
        </div>
        <p className="text-xs text-red-400/70 leading-relaxed">
          Deleting your account is permanent. All wallet balances will be forfeited and transaction history will be anonymized for regulatory compliance.
        </p>
        <button className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs hover:bg-red-600 transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          Terminate Identity
        </button>
      </div>

      <footer className="text-center">
        <div className="inline-flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase">
          <Lock className="w-3 h-3" />
          Zero-Knowledge Proof Architecture Active
        </div>
      </footer>
    </div>
  );
}

function Toggle({ active, onToggle }: { active: boolean, onToggle: () => void }) {
  return (
    <button 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative transition-colors ${active ? 'bg-[#00D4FF]' : 'bg-gray-700'}`}
    >
      <motion.div 
        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
        animate={{ x: active ? 24 : 0 }}
      />
    </button>
  );
}
