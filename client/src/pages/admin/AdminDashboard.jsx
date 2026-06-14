import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../api/services';
import { formatDate } from '../../utils/time';

const STATUS_STYLES = {
  pending:    { color: '#d97706', bg: '#fffbeb', label: 'Pending' },
  confirmed:  { color: '#2563eb', bg: '#eff6ff', label: 'Confirmed' },
  preparing:  { color: '#7c3aed', bg: '#f5f3ff', label: 'Preparing' },
  on_the_way: { color: '#0891b2', bg: '#ecfeff', label: 'On the Way' },
  delivered:  { color: '#16a34a', bg: '#f0fdf4', label: 'Delivered' },
  cancelled:  { color: '#dc2626', bg: '#fef2f2', label: 'Cancelled' },
};

export default function AdminDashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getStats()
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: 24 }}>
      <div style={{ height: 28, background: '#f3f4f6', borderRadius: 8, width: 160, marginBottom: 24 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: 100, background: '#f3f4f6', borderRadius: 16 }} />)}
      </div>
      <div style={{ height: 300, background: '#f3f4f6', borderRadius: 16 }} />
    </div>
  );

  const { stats, recentOrders } = data || {};

  return (
    <div style={{ padding: '24px 16px', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Welcome back! Here's today's overview.</p>
        </div>
        <Link to="/admin/orders"
          style={{ background: '#ea580c', color: 'white', padding: '8px 18px', borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          View Orders →
        </Link>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }} className="stats-grid">
        <StatCard icon="📦" label="Today's orders"  value={stats?.todayOrders}               color="#ea580c" />
        <StatCard icon="⏳" label="Pending"          value={stats?.pendingOrders}              color="#d97706" link="/admin/orders?status=pending" />
        <StatCard icon="🔥" label="Active orders"    value={stats?.activeOrders}               color="#7c3aed" link="/admin/orders?status=preparing" />
        <StatCard icon="💰" label="Today's revenue"  value={`Rs. ${stats?.todayRevenue || 0}`} color="#16a34a" />
      </div>

      {/* All time stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }} className="stats-grid">
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '16px 20px', gridColumn: 'span 1' }}>
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Total orders</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>{stats?.totalOrders}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '16px 20px' }}>
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Total revenue</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: '#16a34a' }}>Rs. {stats?.totalRevenue?.toLocaleString()}</p>
        </div>
      </div>

      {/* Recent orders */}
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f3f4f6', padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Recent orders</h2>
          <Link to="/admin/orders" style={{ fontSize: 12, color: '#ea580c', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recentOrders?.map(order => {
            const st = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
            return (
              <Link key={order._id} to={`/admin/orders`}
                style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', padding: '10px 12px', borderRadius: 12, background: '#fafafa' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{order.orderNumber}</p>
                  <p style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{order.user?.name} · {formatDate(order.createdAt)}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color, flexShrink: 0 }}>
                  {st.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (min-width: 600px) { .stats-grid { grid-template-columns: repeat(4, 1fr) !important; } }
      `}</style>
    </div>
  );
}

const StatCard = ({ icon, label, value, color, link }) => {
  const content = (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '16px 20px', boxSizing: 'border-box' }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <p style={{ fontSize: 24, fontWeight: 800, color: color || '#111827', margin: '6px 0 2px' }}>{value ?? '—'}</p>
      <p style={{ fontSize: 12, color: '#6b7280' }}>{label}</p>
    </div>
  );
  return link ? <Link to={link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
};
