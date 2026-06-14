import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout }         = useAuth();
  const { totalItems, setIsOpen } = useCart();
  const [menuOpen, setMenuOpen]  = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/'); };

  return (
    <nav style={{ background: 'white', borderBottom: '1px solid #f3f4f6', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

        {/* Logo */}
        <Link to="/" style={{ fontWeight: 800, fontSize: 20, color: '#ea580c', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          🍕 Faizan's Kitchen
        </Link>

        {/* Desktop nav */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/" style={{ fontSize: 14, color: '#4b5563', textDecoration: 'none', padding: '6px 12px', borderRadius: 10 }}>Menu</Link>
          {user ? (
            <>
              <Link to="/orders" style={{ fontSize: 14, color: '#4b5563', textDecoration: 'none', padding: '6px 12px', borderRadius: 10 }}>My Orders</Link>
              {user.role === 'admin' && (
                <Link to="/admin" style={{ fontSize: 14, color: '#7c3aed', textDecoration: 'none', padding: '6px 12px', borderRadius: 10, fontWeight: 600 }}>Admin</Link>
              )}
              <button onClick={handleLogout}
                style={{ fontSize: 14, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: 10 }}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" style={{ fontSize: 14, color: '#4b5563', textDecoration: 'none', padding: '6px 12px', borderRadius: 10 }}>Login</Link>
          )}
        </div>

        {/* Cart + mobile menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setIsOpen(true)}
            style={{ position: 'relative', background: '#fff7ed', border: 'none', borderRadius: 12, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 18 }}>🛒</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#ea580c' }}>Cart</span>
            {totalItems > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, background: '#ea580c', color: 'white', borderRadius: '50%', width: 20, height: 20, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: 4 }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-menu" style={{ background: 'white', borderTop: '1px solid #f3f4f6', padding: '8px 16px 16px' }}>
          <Link to="/" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '12px 0', fontSize: 15, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #f9fafb' }}>🍽️ Menu</Link>
          {user ? (
            <>
              <Link to="/orders" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '12px 0', fontSize: 15, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #f9fafb' }}>📦 My Orders</Link>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '12px 0', fontSize: 15, color: '#7c3aed', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid #f9fafb' }}>⚙️ Admin</Link>
              )}
              <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                style={{ display: 'block', padding: '12px 0', fontSize: 15, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                → Logout
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '12px 0', fontSize: 15, color: '#374151', textDecoration: 'none' }}>👤 Login</Link>
          )}
        </div>
      )}

      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-menu-btn { display: none !important; }
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
