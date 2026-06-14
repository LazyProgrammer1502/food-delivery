import { useState } from 'react';
import { NavLink, useNavigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/admin',            label: 'Dashboard',  icon: '📊', end: true },
  { to: '/admin/orders',     label: 'Orders',      icon: '📦' },
  { to: '/admin/menu',       label: 'Menu Items',  icon: '🍽️' },
  { to: '/admin/categories', label: 'Categories',  icon: '🏷️' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/'); };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>

      {/* Desktop sidebar */}
      <aside className="admin-sidebar" style={{
        position: 'fixed', top: 0, left: 0, height: '100vh',
        width: 220, background: 'white', borderRight: '1px solid #f3f4f6',
        display: 'flex', flexDirection: 'column', zIndex: 30,
      }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <Link to="/" style={{ fontWeight: 800, fontSize: 15, color: '#ea580c', textDecoration: 'none' }}>
            🍕 Faizan's Kitchen
          </Link>
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Admin Panel</p>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 12, fontSize: 14,
                fontWeight: 500, textDecoration: 'none',
                background: isActive ? '#fff7ed' : 'transparent',
                color: isActive ? '#ea580c' : '#4b5563',
                borderLeft: isActive ? '3px solid #ea580c' : '3px solid transparent',
              })}>
              <span>{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '12px 8px', borderTop: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 4 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#ea580c', flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <p style={{ fontSize: 11, color: '#9ca3af' }}>Admin</p>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{ width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, color: '#ef4444', borderRadius: 10, border: 'none', background: 'none', cursor: 'pointer' }}>
            → Logout
          </button>
        </div>
      </aside>

      {/* Mobile top header */}
      <header className="admin-mobile-header" style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0,
        height: 56, background: 'white', borderBottom: '1px solid #f3f4f6',
        zIndex: 40, alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
      }}>
        <span style={{ fontWeight: 800, color: '#ea580c', fontSize: 15 }}>🍕 Admin</span>
        <button onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile dropdown */}
      <div className="admin-mobile-menu" style={{
        display: 'none', position: 'fixed', top: 56, left: 0, right: 0,
        background: 'white', borderBottom: '1px solid #f3f4f6',
        zIndex: 39, padding: '8px 12px 16px',
        transform: menuOpen ? 'translateY(0)' : 'translateY(-110%)',
        transition: 'transform 0.25s ease',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
      }}>
        {NAV.map(item => (
          <NavLink key={item.to} to={item.to} end={item.end}
            onClick={() => setMenuOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 12px', borderRadius: 12, fontSize: 14,
              fontWeight: 500, textDecoration: 'none', marginBottom: 2,
              background: isActive ? '#fff7ed' : 'transparent',
              color: isActive ? '#ea580c' : '#4b5563',
            })}>
            <span>{item.icon}</span>{item.label}
          </NavLink>
        ))}
        <div style={{ borderTop: '1px solid #f3f4f6', marginTop: 8, paddingTop: 12 }}>
          <button onClick={() => { handleLogout(); setMenuOpen(false); }}
            style={{ fontSize: 14, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px' }}>
            → Logout
          </button>
        </div>
      </div>

      {menuOpen && <div onClick={() => setMenuOpen(false)}
        style={{ display: 'none', position: 'fixed', inset: 0, zIndex: 38, background: 'rgba(0,0,0,0.2)' }}
        className="admin-mobile-backdrop" />}

      {/* Main */}
      <main className="admin-main" style={{ marginLeft: 220, minHeight: '100vh' }}>
        <Outlet />
      </main>

      <style>{`
        .admin-sidebar { display: flex !important; }
        .admin-mobile-header { display: none !important; }
        .admin-mobile-menu { display: none !important; }
        .admin-mobile-backdrop { display: none !important; }
        .admin-main { margin-left: 220px !important; }
        @media (max-width: 768px) {
          .admin-sidebar { display: none !important; }
          .admin-mobile-header { display: flex !important; }
          .admin-mobile-menu { display: block !important; }
          .admin-mobile-backdrop { display: block !important; }
          .admin-main { margin-left: 0 !important; padding-top: 56px; }
        }
      `}</style>
    </div>
  );
}
