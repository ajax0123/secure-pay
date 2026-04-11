import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Send, History, Shield, Lock, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar({ user, setUser }: { user: any, setUser: any }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="border-b border-[#00D4FF]/20 bg-[#0A0E27]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-[#00D4FF] rounded flex items-center justify-center group-hover:shadow-[0_0_15px_#00D4FF] transition-all">
            <Shield className="text-[#0A0E27] w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tighter text-[#00D4FF]">SECURE<span className="text-white">PAY</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/" icon={<Wallet className="w-4 h-4" />} label="Dashboard" />
          <NavLink to="/send" icon={<Send className="w-4 h-4" />} label="Send" />
          <NavLink to="/history" icon={<History className="w-4 h-4" />} label="History" />
          <NavLink to="/kyc" icon={<Lock className="w-4 h-4" />} label="KYC" />
          <NavLink to="/privacy" icon={<Shield className="w-4 h-4" />} label="Privacy" />
          {user.role === 'admin' && (
            <NavLink to="/admin" icon={<Shield className="w-4 h-4 text-red-400" />} label="Admin" />
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20">
            <UserIcon className="w-4 h-4 text-[#00D4FF]" />
            <span className="text-sm font-medium">{user.name}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, icon, label }: { to: string, icon: any, label: string }) {
  return (
    <Link 
      to={to} 
      className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-[#00D4FF] transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
