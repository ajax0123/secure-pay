import { useState } from 'react';
import { Shield, Lock, Fingerprint, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function KYC() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 2000);
  };

  return (
    <div className="max-w-xl mx-auto">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic">Identity Verification</h1>
        <p className="text-gray-400 font-mono text-sm uppercase">KYC Protocol Level 1</p>
      </header>

      <div className="bg-[#151B3D] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
          <motion.div 
            className="h-full bg-[#00D4FF]" 
            animate={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4 p-4 bg-[#00D4FF]/5 border border-[#00D4FF]/20 rounded-2xl">
              <Shield className="text-[#00D4FF] w-8 h-8 shrink-0" />
              <p className="text-xs text-gray-300 leading-relaxed">
                To comply with global financial regulations and prevent money laundering, we require a one-time identity verification.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold uppercase text-sm tracking-wider">Required Documents</h3>
              <div className="grid grid-cols-2 gap-4">
                <DocCard icon={<Fingerprint />} label="Biometric ID" />
                <DocCard icon={<Camera />} label="Live Selfie" />
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full bg-[#00D4FF] text-[#0A0E27] py-4 rounded-xl font-black uppercase tracking-tighter hover:shadow-[0_0_30px_#00D4FF] transition-all"
            >
              Begin Verification
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8 text-center"
          >
            <div className="w-32 h-32 border-2 border-dashed border-[#00D4FF]/30 rounded-full flex items-center justify-center mx-auto relative">
              <div className="absolute inset-0 border-2 border-[#00D4FF] rounded-full animate-ping opacity-20" />
              <Camera className="text-[#00D4FF] w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase italic">Scanning Biometrics</h3>
              <p className="text-gray-500 font-mono text-xs mt-2">Position your face within the frame</p>
            </div>
            
            <div className="bg-[#0A0E27] p-4 rounded-xl font-mono text-[10px] text-left space-y-1">
              <p className="text-green-500">{'>'} INITIALIZING_SCANNER...</p>
              <p className="text-green-500">{'>'} DETECTING_FACIAL_FEATURES...</p>
              <p className="text-[#00D4FF]">{'>'} ENCRYPTING_DATA_STREAM...</p>
            </div>

            <button 
              onClick={handleVerify}
              disabled={loading}
              className="w-full bg-[#00D4FF] text-[#0A0E27] py-4 rounded-xl font-black uppercase tracking-tighter hover:shadow-[0_0_30px_#00D4FF] transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Capture & Process'}
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="text-green-400 w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tighter uppercase italic">Verification Successful</h3>
              <p className="text-gray-400 text-sm mt-2">Your node is now fully authorized for high-value transactions.</p>
            </div>
            <div className="bg-[#0A0E27] p-4 rounded-xl font-mono text-xs text-left">
              <p className="text-gray-500 uppercase">Hashed ID: <span className="text-[#00D4FF]">SHA256:8f9e...3a2b</span></p>
              <p className="text-gray-500 uppercase mt-1">Status: <span className="text-green-400">VERIFIED</span></p>
            </div>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full border border-[#00D4FF] text-[#00D4FF] py-4 rounded-xl font-black uppercase tracking-tighter hover:bg-[#00D4FF]/10 transition-all"
            >
              Return to Dashboard
            </button>
          </motion.div>
        )}
      </div>

      <div className="mt-8 flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
        <AlertCircle className="text-gray-500 w-5 h-5 shrink-0" />
        <p className="text-[10px] text-gray-500 uppercase font-mono leading-relaxed">
          Privacy Notice: We do not store your raw document data. Only a cryptographic hash of your ID is stored for compliance purposes. All biometric data is processed locally and discarded after verification.
        </p>
      </div>
    </div>
  );
}

function DocCard({ icon, label }: { icon: any, label: string }) {
  return (
    <div className="bg-[#0A0E27] border border-white/5 p-4 rounded-xl flex flex-col items-center gap-2 group hover:border-[#00D4FF]/30 transition-all">
      <div className="text-gray-500 group-hover:text-[#00D4FF] transition-colors">
        {icon}
      </div>
      <span className="text-[10px] font-mono text-gray-400 uppercase">{label}</span>
    </div>
  );
}
