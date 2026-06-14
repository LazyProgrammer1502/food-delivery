import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../api/services';
import { formatDate } from '../utils/time';

const STATUS_STYLES = {
  pending:    { color: '#6b7280', bg: '#f3f4f6', label: 'Pending' },
  confirmed:  { color: '#2563eb', bg: '#eff6ff', label: 'Confirmed' },
  preparing:  { color: '#d97706', bg: '#fffbeb', label: 'Preparing' },
  on_the_way: { color: '#7c3aed', bg: '#f5f3ff', label: 'On the Way' },
  delivered:  { color: '#16a34a', bg: '#f0fdf4', label: 'Delivered' },
  cancelled:  { color: '#dc2626', bg: '#fef2f2', label: 'Cancelled' },
};

export default function Orders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getMyOrders()
      .then(({ data }) => setOrders(data.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 16px' }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ background: 'white', borderRadius: 20, border: '1px solid #f3f4f6', padding: 20, marginBottom: 12, animation: 'pulse 1.5s infinite' }}>
          <div style={{ height: 16, background: '#f3f4f6', borderRadius: 8, width: '40%', marginBottom: 10 }} />
          <div style={{ height: 12, background: '#f3f4f6', borderRadius: 8, width: '70%' }} />
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 24 }}>My Orders</h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ fontSize: 48 }}>📦</p>
          <p style={{ fontWeight: 700, color: '#374151', marginTop: 12 }}>No orders yet</p>
          <Link to="/"
            style={{ display: 'inline-block', marginTop: 20, background: '#ea580c', color: 'white', textDecoration: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 700 }}>
            Order Now
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => {
            const st = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
            return (
              <Link key={order._id} to={`/orders/${order._id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f3f4f6', padding: '18px 20px', transition: 'box-shadow 0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{order.orderNumber}</p>
                      <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{formatDate(order.createdAt)}</p>
                      <p style={{ fontSize: 13, color: '#374151', marginTop: 6 }}>
                        {order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                      <p style={{ fontSize: 15, fontWeight: 800, color: '#ea580c', marginTop: 8 }}>Rs. {order.grandTotal}</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
