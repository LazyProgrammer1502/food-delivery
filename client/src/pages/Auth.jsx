import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [params]   = useSearchParams();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}! 👋`);
      navigate(params.get('redirect') || (user.role === 'admin' ? '/admin' : '/'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setBusy(false); }
  };

  return <AuthForm title="Welcome back 👋" subtitle="Sign in to your account" onSubmit={submit} busy={busy}
    fields={[
      { label: 'Email', type: 'email', key: 'email', placeholder: 'you@example.com' },
      { label: 'Password', type: 'password', key: 'password', placeholder: '••••••••' },
    ]}
    form={form} setForm={setForm}
    footer={<>No account? <Link to="/register" style={{ color: '#ea580c', fontWeight: 600 }}>Register</Link></>}
    btnLabel="Sign in"
  />;
}

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be 6+ characters');
    setBusy(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      toast.success('Account created! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setBusy(false); }
  };

  return <AuthForm title="Create account" subtitle="Start ordering delicious food" onSubmit={submit} busy={busy}
    fields={[
      { label: 'Full name', type: 'text', key: 'name', placeholder: 'Muhammad Faizan' },
      { label: 'Email', type: 'email', key: 'email', placeholder: 'you@example.com' },
      { label: 'Phone (optional)', type: 'tel', key: 'phone', placeholder: '+92-300-1234567' },
      { label: 'Password', type: 'password', key: 'password', placeholder: 'Min. 6 characters' },
    ]}
    form={form} setForm={setForm}
    footer={<>Have an account? <Link to="/login" style={{ color: '#ea580c', fontWeight: 600 }}>Sign in</Link></>}
    btnLabel="Create account"
  />;
}

function AuthForm({ title, subtitle, onSubmit, busy, fields, form, setForm, footer, btnLabel }) {
  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ fontSize: 28, textDecoration: 'none' }}>🍕</Link>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginTop: 8 }}>{title}</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>{subtitle}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f3f4f6', padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {fields.map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} required={f.key !== 'phone'}
                  value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 12, padding: '10px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <button type="submit" disabled={busy}
              style={{ width: '100%', background: '#ea580c', color: 'white', border: 'none', borderRadius: 12, padding: '13px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4 }}>
              {busy ? 'Please wait…' : btnLabel}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280', marginTop: 20 }}>{footer}</p>
        </div>
      </div>
    </div>
  );
}
