import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../api/services';
import OrderStepper from '../components/order/OrderStepper';
import { formatDate } from '../utils/time';

export default function OrderTracking() {
  const { id }   = useParams();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(() => {
    orderService.getOne(id)
      .then(({ data }) => setOrder(data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchOrder();
    // Poll every 30 seconds if order is active
    const interval = setInterval(() => {
      if (order && !['delivered', 'cancelled'].includes(order.status)) fetchOrder();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchOrder, order?.status]); // eslint-disable-line

  if (loading) return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 16px' }}>
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f3f4f6', padding: 28, animation: 'pulse 1.5s infinite' }}>
        <div style={{ height: 24, background: '#f3f4f6', borderRadius: 8, width: '40%', marginBottom: 24 }} />
        <div style={{ height: 80, background: '#f3f4f6', borderRadius: 12 }} />
      </div>
    </div>
  );

  if (!order) return (
    <div style={{ textAlign: 'center', padding: '80px 16px' }}>
      <p style={{ fontSize: 48 }}>❌</p>
      <p style={{ fontWeight: 700, marginTop: 12 }}>Order not found</p>
      <Link to="/orders" style={{ color: '#ea580c', marginTop: 16, display: 'block' }}>View all orders</Link>
    </div>
  );

  const STATUS_LABELS = {
    pending:    { label: 'Order Placed',  color: '#6b7280', bg: '#f3f4f6' },
    confirmed:  { label: 'Confirmed',     color: '#2563eb', bg: '#eff6ff' },
    preparing:  { label: 'Preparing',     color: '#d97706', bg: '#fffbeb' },
    on_the_way: { label: 'On the Way',    color: '#7c3aed', bg: '#f5f3ff' },
    delivered:  { label: 'Delivered',     color: '#16a34a', bg: '#f0fdf4' },
    cancelled:  { label: 'Cancelled',     color: '#dc2626', bg: '#fef2f2' },
  };
  const st = STATUS_LABELS[order.status] || STATUS_LABELS.pending;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>Order #{order.orderNumber}</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Placed on {formatDate(order.createdAt)}</p>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, padding: '6px 16px', borderRadius: 20, background: st.bg, color: st.color }}>
          {st.label}
        </span>
      </div>

      {/* Status stepper */}
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f3f4f6', padding: '24px 20px', marginBottom: 16 }}>
        <OrderStepper status={order.status} />
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 12 }}>
            ⏱ Estimated delivery: <strong>30-45 minutes</strong> · Updates every 30s
          </p>
        )}
      </div>

      {/* Delivery address */}
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f3f4f6', padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>📍 Delivery Address</h3>
        <p style={{ fontSize: 14, color: '#374151' }}>{order.deliveryAddress.street}</p>
        {order.deliveryAddress.city && <p style={{ fontSize: 14, color: '#6b7280' }}>{order.deliveryAddress.city}</p>}
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>📞 {order.phone}</p>
        {order.specialNote && (
          <div style={{ marginTop: 10, background: '#fff7ed', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#9a3412' }}>
            📝 {order.specialNote}
          </div>
        )}
      </div>

      {/* Items */}
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f3f4f6', padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>🍽️ Order Items</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {item.image && <img src={item.image} alt={item.name} style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />}
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{item.name}</p>
                <p style={{ fontSize: 12, color: '#6b7280' }}>Rs. {item.price} × {item.quantity}</p>
              </div>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Rs. {item.subtotal}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #f3f4f6', marginTop: 16, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
            <span>Subtotal</span><span>Rs. {order.totalPrice}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
            <span>Delivery fee</span><span>Rs. {order.deliveryFee}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#ea580c' }}>
            <span>Total</span><span>Rs. {order.grandTotal}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/orders"
          style={{ padding: '12px 24px', borderRadius: 12, border: '1px solid #e5e7eb', background: 'white', color: '#374151', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
          ← All Orders
        </Link>
        <Link to="/"
          style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: '#ea580c', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
          Order Again
        </Link>
      </div>
    </div>
  );
}
