import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CartSidebar() {
  const { items, isOpen, setIsOpen, removeItem, updateQty, subtotal, grandTotal, DELIVERY_FEE, totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsOpen(false);
    if (!user) { navigate('/login?redirect=/checkout'); return; }
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div onClick={() => setIsOpen(false)}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }} />

      {/* Sidebar */}
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 400, background: 'white', zIndex: 101, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)' }}>

        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 18, color: '#111827' }}>Your Cart</h2>
            <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setIsOpen(false)}
            style={{ background: '#f3f4f6', border: 'none', borderRadius: 10, width: 36, height: 36, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✕
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontSize: 48 }}>🛒</p>
              <p style={{ fontWeight: 600, color: '#374151', marginTop: 12 }}>Your cart is empty</p>
              <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>Add some delicious items!</p>
              <button onClick={() => setIsOpen(false)}
                style={{ marginTop: 20, background: '#ea580c', color: 'white', border: 'none', borderRadius: 12, padding: '10px 24px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                Browse Menu
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map(item => (
                <div key={item._id} style={{ display: 'flex', gap: 12, background: '#f9fafb', borderRadius: 14, padding: 12 }}>
                  {item.image && (
                    <img src={item.image} alt={item.name}
                      style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    <p style={{ color: '#ea580c', fontWeight: 700, fontSize: 14, marginTop: 2 }}>Rs. {item.price}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <button onClick={() => updateQty(item._id, item.quantity - 1)}
                        style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        −
                      </button>
                      <span style={{ fontWeight: 700, fontSize: 15, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item._id, item.quantity + 1)}
                        style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#ea580c', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        +
                      </button>
                      <button onClick={() => removeItem(item._id)}
                        style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 18 }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: 20, borderTop: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6b7280' }}>
                <span>Subtotal</span><span>Rs. {subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6b7280' }}>
                <span>Delivery fee</span><span>Rs. {DELIVERY_FEE}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: '#111827', paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
                <span>Total</span><span style={{ color: '#ea580c' }}>Rs. {grandTotal}</span>
              </div>
            </div>
            <button onClick={handleCheckout}
              style={{ width: '100%', background: '#ea580c', color: 'white', border: 'none', borderRadius: 14, padding: '14px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
