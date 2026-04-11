import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login({ setUser }: { setUser: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data));
      setUser(res.data.data);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded-2xl mb-4">
            <Shield className="text-[#00D4FF] w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">Secure Access</h1>
          <p className="text-gray-500 font-mono text-xs mt-2 uppercase">Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#151B3D] border border-white/5 p-8 rounded-3xl shadow-2xl space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded text-xs font-mono uppercase">
              Error: {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest ml-1">Terminal ID (Email)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0A0E27] border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] outline-none transition-all font-mono text-sm"
                placeholder="user@securepay.net"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest ml-1">Access Key (Password)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0A0E27] border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] outline-none transition-all font-mono text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#00D4FF] text-[#0A0E27] py-4 rounded-xl font-black uppercase tracking-tighter flex items-center justify-center gap-2 hover:shadow-[0_0_30px_#00D4FF] transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Initialize Session'}
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="text-center pt-4">
            <p className="text-xs text-gray-500 font-mono uppercase">
              New Node? <Link to="/register" className="text-[#00D4FF] hover:underline">Register Identity</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
