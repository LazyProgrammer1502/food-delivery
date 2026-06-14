import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { orderService } from '../../api/services';
import OrderStepper from '../../components/order/OrderStepper';
import { formatDate } from '../../utils/time';
import toast from 'react-hot-toast';

const STATUSES = ['', 'pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'];
const STATUS_LABELS = {
  '':           'All',
  pending:      'Pending',
  confirmed:    'Confirmed',
  preparing:    'Preparing',
  on_the_way:   'On the Way',
  delivered:    'Delivered',
  cancelled:    'Cancelled',
};
const NEXT_STATUS = {
  pending:    'confirmed',
  confirmed:  'preparing',
  preparing:  'on_the_way',
  on_the_way: 'delivered',
};
const NEXT_LABEL = {
  pending:    '✅ Confirm',
  confirmed:  '👨‍🍳 Start Preparing',
  preparing:  '🛵 Out for Delivery',
  on_the_way: '🎉 Mark Delivered',
};

export default function AdminOrders() {
  const [searchParams] = useSearchParams();
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState(searchParams.get('status') || '');
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await orderService.getAll(filter ? { status: filter } : {});
      setOrders(data.orders);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Auto-refresh every 30s for active orders
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await orderService.updateStatus(orderId, status);
      toast.success(`Order marked as ${STATUS_LABELS[status]}`);
      fetchOrders();
    } catch { toast.error('Failed to update'); }
    finally { setUpdating(null); }
  };

  return (
    <div style={{ padding: '24px 16px', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>Orders</h1>
        <button onClick={fetchOrders}
          style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
          🔄 Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 20 }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
              background: filter === s ? '#ea580c' : 'white',
              color: filter === s ? 'white' : '#6b7280',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}>
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 80, background: '#f3f4f6', borderRadius: 16 }} />)}
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ fontSize: 40 }}>📭</p>
          <p style={{ fontWeight: 600, color: '#374151', marginTop: 12 }}>No orders {filter ? `with status "${STATUS_LABELS[filter]}"` : 'yet'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => (
            <div key={order._id} style={{ background: 'white', borderRadius: 18, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
              {/* Order header */}
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{order.orderNumber}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p style={{ fontSize: 13, color: '#374151' }}>
                    <strong>{order.user?.name}</strong> · {order.user?.phone}
                  </p>
                  <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{formatDate(order.createdAt)}</p>
                  <p style={{ fontSize: 13, color: '#374151', marginTop: 4 }}>
                    {order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#ea580c', marginTop: 4 }}>
                    Rs. {order.grandTotal}
                  </p>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
                  {NEXT_STATUS[order.status] && (
                    <button onClick={() => handleUpdateStatus(order._id, NEXT_STATUS[order.status])}
                      disabled={updating === order._id}
                      style={{ background: '#ea580c', color: 'white', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {updating === order._id ? '…' : NEXT_LABEL[order.status]}
                    </button>
                  )}
                  {order.status === 'pending' && (
                    <button onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                      disabled={updating === order._id}
                      style={{ background: 'white', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  )}
                  <button onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                    style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: '7px 14px', fontSize: 12, cursor: 'pointer', color: '#6b7280' }}>
                    {expanded === order._id ? 'Hide details ▲' : 'Show details ▼'}
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {expanded === order._id && (
                <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px 20px', background: '#fafafa' }}>
                  <OrderStepper status={order.status} />

                  <div style={{ display: 'grid', gap: 16, marginTop: 16 }} className="order-details-grid">
                    {/* Delivery info */}
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Delivery</p>
                      <p style={{ fontSize: 14, color: '#111827' }}>📍 {order.deliveryAddress.street}</p>
                      {order.deliveryAddress.city && <p style={{ fontSize: 13, color: '#6b7280' }}>{order.deliveryAddress.city}</p>}
                      <p style={{ fontSize: 13, color: '#374151', marginTop: 4 }}>📞 {order.phone}</p>
                      {order.specialNote && (
                        <div style={{ marginTop: 8, background: '#fff7ed', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: '#9a3412' }}>
                          📝 {order.specialNote}
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Items</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {order.items.map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                            <span style={{ color: '#374151' }}>{item.name} <span style={{ color: '#9ca3af' }}>×{item.quantity}</span></span>
                            <span style={{ fontWeight: 600, color: '#111827' }}>Rs. {item.subtotal}</span>
                          </div>
                        ))}
                        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14 }}>
                          <span>Total</span>
                          <span style={{ color: '#ea580c' }}>Rs. {order.grandTotal}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status history */}
                  {order.statusHistory?.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Timeline</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {order.statusHistory.map((h, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, fontSize: 12, color: '#6b7280' }}>
                            <span style={{ color: '#ea580c', fontWeight: 600, textTransform: 'capitalize' }}>
                              {STATUS_LABELS[h.status] || h.status}
                            </span>
                            <span>{formatDate(h.timestamp)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @media (min-width: 640px) {
          .order-details-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const StatusBadge = ({ status }) => {
  const styles = {
    pending:    { color: '#d97706', bg: '#fffbeb' },
    confirmed:  { color: '#2563eb', bg: '#eff6ff' },
    preparing:  { color: '#7c3aed', bg: '#f5f3ff' },
    on_the_way: { color: '#0891b2', bg: '#ecfeff' },
    delivered:  { color: '#16a34a', bg: '#f0fdf4' },
    cancelled:  { color: '#dc2626', bg: '#fef2f2' },
  };
  const st = styles[status] || styles.pending;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color, textTransform: 'capitalize' }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
};
