import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../api/services';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { items, subtotal, grandTotal, DELIVERY_FEE, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form,    setForm]    = useState({
    street: user?.address || '',
    city:   'Abbottabad',
    phone:  user?.phone   || '',
    note:   '',
  });
  const [placing, setPlacing] = useState(false);

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 16px' }}>
        <p style={{ fontSize: 48 }}>🛒</p>
        <p style={{ fontWeight: 700, fontSize: 18, marginTop: 12 }}>Your cart is empty</p>
        <button onClick={() => navigate('/')}
          style={{ marginTop: 20, background: '#ea580c', color: 'white', border: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 700, cursor: 'pointer' }}>
          Browse Menu
        </button>
      </div>
    );
  }

  const handlePlace = async (e) => {
    e.preventDefault();
    if (!form.street.trim()) return toast.error('Enter your delivery address');
    if (!form.phone.trim())  return toast.error('Enter your phone number');

    setPlacing(true);
    try {
      const payload = {
        items: items.map(i => ({ menuItem: i._id, quantity: i.quantity })),
        deliveryAddress: { street: form.street.trim(), city: form.city.trim() },
        phone:       form.phone.trim(),
        specialNote: form.note.trim(),
      };
      const { data } = await orderService.place(payload);
      clearCart();
      toast.success('Order placed! 🎉');
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setPlacing(false); }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 24 }}>Checkout</h1>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* Delivery form */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f3f4f6', padding: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Delivery Details</h2>
            <form onSubmit={handlePlace} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Street address *</label>
                <input className="input" placeholder="House no., street, area"
                  value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>City</label>
                <input className="input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Phone number *</label>
                <input className="input" type="tel" placeholder="+92-300-1234567"
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Special instructions (optional)</label>
                <textarea className="input" rows={3} style={{ resize: 'none' }} placeholder="Extra cheese, no onions, ring the bell…"
                  value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} maxLength={300} />
              </div>
              <button type="submit" disabled={placing}
                style={{ width: '100%', background: '#ea580c', color: 'white', border: 'none', borderRadius: 14, padding: '14px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 8 }}>
                {placing ? 'Placing order…' : `Place Order — Rs. ${grandTotal}`}
              </button>
            </form>
          </div>
        </div>

        {/* Order summary */}
        <div style={{ width: '100%', maxWidth: 340 }}>
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f3f4f6', padding: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {items.map(item => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {item.image && <img src={item.image} alt={item.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />}
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{item.name}</p>
                      <p style={{ fontSize: 12, color: '#6b7280' }}>× {item.quantity}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111827', flexShrink: 0 }}>Rs. {item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
                <span>Subtotal</span><span>Rs. {subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
                <span>Delivery fee</span><span>Rs. {DELIVERY_FEE}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#ea580c', paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
                <span>Total</span><span>Rs. {grandTotal}</span>
              </div>
            </div>
            <div style={{ marginTop: 16, background: '#fff7ed', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#9a3412' }}>
              ⏱ Estimated delivery: <strong>30-45 minutes</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
