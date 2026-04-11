import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import SendMoney from './pages/SendMoney.tsx';
import History from './pages/History.tsx';
import KYC from './pages/KYC.tsx';
import Privacy from './pages/Privacy.tsx';
import Admin from './pages/Admin.tsx';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center text-[#00D4FF]">Loading...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-[#0A0E27] text-white font-sans selection:bg-[#00D4FF] selection:text-[#0A0E27]">
        {user && <Navbar user={user} setUser={setUser} />}
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/" />} />
            
            <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
            <Route path="/send" element={user ? <SendMoney /> : <Navigate to="/login" />} />
            <Route path="/history" element={user ? <History /> : <Navigate to="/login" />} />
            <Route path="/kyc" element={user ? <KYC /> : <Navigate to="/login" />} />
            <Route path="/privacy" element={user ? <Privacy /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
