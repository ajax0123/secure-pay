import { Menu, Moon, ShieldAlert, Sun, Users, Wallet, X } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/fraud-report', label: 'Fraud Report' },
  { to: '/sessions', label: 'Sessions' },
  { to: '/dispute', label: 'Disputes' }
];

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleNavItems = user?.role === 'admin'
    ? navItems.filter((item) => item.to !== '/dashboard' && item.to !== '/transactions')
    : navItems;

  const onLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-app-dark dark:text-slate-100">
      <div className="mx-auto flex max-w-[1400px]">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-300 bg-white p-5 transition-transform dark:border-slate-700 dark:bg-card-dark md:static md:translate-x-0 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Wallet className="h-6 w-6" />
              <span className="text-lg font-semibold">Wallet Secure</span>
            </div>
            <button className="md:hidden" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-2">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm ${
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {user?.role === 'admin' ? (
              <>
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                      isActive
                        ? 'bg-danger/15 text-danger'
                        : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <ShieldAlert className="h-4 w-4" />
                  Admin
                </NavLink>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                      isActive
                        ? 'bg-danger/15 text-danger'
                        : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <Users className="h-4 w-4" />
                  Manage Users
                </NavLink>
              </>
            ) : null}
          </nav>

          <div className="mt-8 rounded-xl border border-slate-700 bg-slate-800/80 p-4 text-sm text-slate-200">
            <p className="font-medium">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <button
              className="mt-4 w-full rounded-md bg-danger px-3 py-2 text-xs font-semibold text-white"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="w-full px-4 py-4 md:px-8 md:py-8">
          <header className="mb-6 flex items-center justify-between">
            <button className="md:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold md:text-2xl">Secure Digital Wallet</h1>
            <button
              className="rounded-lg border border-slate-600 px-3 py-2 text-sm"
              onClick={toggleTheme}
            >
              {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
};
