import { useState } from 'react';
import { useCart } from '../../context/CartContext';

export default function MenuItemCard({ item }) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAdd = () => {
    addItem(item, 1);
    setAdding(true);
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <div style={{ background: 'white', borderRadius: 18, border: '1px solid #f3f4f6', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'}>

      {/* Image */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {item.image ? (
          <img src={item.image} alt={item.name}
            style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: 160, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
            🍽️
          </div>
        )}
        {/* Tags */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 4 }}>
          {item.isPopular && (
            <span style={{ background: '#ea580c', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
              🔥 Popular
            </span>
          )}
          {item.tags?.includes('vegan') && (
            <span style={{ background: '#16a34a', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
              🌱 Vegan
            </span>
          )}
          {item.tags?.includes('spicy') && (
            <span style={{ background: '#dc2626', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
              🌶️ Spicy
            </span>
          )}
        </div>
        {/* Prep time */}
        <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 11, padding: '3px 8px', borderRadius: 20 }}>
          ⏱ {item.prepTime} min
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 4 }}>{item.name}</h3>
        {item.description && (
          <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5, marginBottom: 8, flex: 1,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {item.description}
          </p>
        )}
        {item.calories > 0 && (
          <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>🔥 {item.calories} cal</p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#ea580c' }}>Rs. {item.price}</span>
          <button onClick={handleAdd}
            style={{ background: adding ? '#16a34a' : '#ea580c', color: 'white', border: 'none', borderRadius: 12, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'background 0.3s' }}>
            {adding ? '✓ Added' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
