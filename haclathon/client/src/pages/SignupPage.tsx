import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupApi } from '../api/authApi';

export const SignupPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', transactionPin: '' });

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (form.name.trim().length < 2) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'error', message: 'Name must be at least 2 characters.' } }));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'error', message: 'Please enter a valid email address.' } }));
      return;
    }

    if (form.password.length < 8) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'error', message: 'Password must be at least 8 characters.' } }));
      return;
    }

    if (!/^\d{4}$/.test(form.transactionPin)) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'error', message: 'Transaction PIN must be exactly 4 digits.' } }));
      return;
    }

    setLoading(true);
    try {
      await signupApi(form);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'success', message: 'Account created. Please login.' } }));
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-dark px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-slate-700 bg-card-dark p-6">
        <h1 className="text-2xl font-semibold text-white">Create Account</h1>
        <p className="mt-1 text-sm text-slate-400">Get started with ₹10,000 demo balance.</p>
        <div className="mt-4 space-y-3">
          <input className="input" placeholder="Full name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <input className="input" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
          <input className="input" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
          <input className="input" placeholder="4-digit PIN" type="password" maxLength={4} value={form.transactionPin} onChange={(e) => setForm((p) => ({ ...p, transactionPin: e.target.value.replace(/\D/g, '') }))} required />
        </div>
        <button className="mt-5 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white" disabled={loading}>
          {loading ? 'Creating...' : 'Sign up'}
        </button>
        <p className="mt-4 text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-primary">Login</Link>
        </p>
      </form>
    </div>
  );
};
