import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider }  from './context/AuthContext';
import { CartProvider }  from './context/CartContext';
import ProtectedRoute    from './components/ui/ProtectedRoute';
import Navbar            from './components/layout/Navbar';
import CartSidebar       from './components/cart/CartSidebar';

// Public pages
import Home              from './pages/Home';
import { Login, Register } from './pages/Auth';
import Checkout          from './pages/Checkout';
import Orders            from './pages/Orders';
import OrderTracking     from './pages/OrderTracking';

// Admin pages
import AdminLayout       from './components/admin/AdminLayout';
import AdminDashboard    from './pages/admin/AdminDashboard';
import AdminOrders       from './pages/admin/AdminOrders';
import AdminMenu         from './pages/admin/AdminMenu';
import AdminCategories   from './pages/admin/AdminCategories';

// Layout wrapper for public pages
const PublicLayout = ({ children }) => (
  <>
    <CartSidebar />
    <Navbar />
    <div>{children}</div>
  </>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Routes>

            {/* ── Public routes ── */}
            <Route path="/"         element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/login"    element={<PublicLayout><Login /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />

            {/* ── Protected customer routes ── */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout"   element={<PublicLayout><Checkout /></PublicLayout>} />
              <Route path="/orders"     element={<PublicLayout><Orders /></PublicLayout>} />
              <Route path="/orders/:id" element={<PublicLayout><OrderTracking /></PublicLayout>} />
            </Route>

            {/* ── Admin routes — own layout, no public navbar ── */}
            <Route element={<ProtectedRoute adminOnly />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin"            element={<AdminDashboard />} />
                <Route path="/admin/orders"     element={<AdminOrders />} />
                <Route path="/admin/menu"       element={<AdminMenu />} />
                <Route path="/admin/categories" element={<AdminCategories />} />
              </Route>
            </Route>

            {/* Admin login — no protection, no public navbar */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Inline admin login page — redirects to /admin if already logged in
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import toast from 'react-hot-toast';

function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Already logged in as admin
  if (user?.role === 'admin') { navigate('/admin'); return null; }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await login(form.email, form.password);
      if (u.role !== 'admin') {
        toast.error('Admin access required');
        return;
      }
      toast.success('Welcome back!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ fontSize: 36 }}>🍕</span>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginTop: 8 }}>Admin Login</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Faizan's Kitchen — Admin Panel</p>
        </div>
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f3f4f6', padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="admin@food.com"
                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 12, padding: '10px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 12, padding: '10px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={busy}
              style={{ width: '100%', background: '#ea580c', color: 'white', border: 'none', borderRadius: 12, padding: '13px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#9ca3af' }}>
            <Link to="/" style={{ color: '#ea580c', textDecoration: 'none' }}>← Back to menu</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
