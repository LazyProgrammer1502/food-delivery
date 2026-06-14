import { useState, useEffect } from 'react';
import { menuService, categoryService } from '../api/services';
import MenuItemCard from '../components/menu/MenuItemCard';

const Skeleton = () => (
  <div style={{ background: 'white', borderRadius: 18, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
    <div style={{ height: 160, background: '#f3f4f6' }} />
    <div style={{ padding: 16 }}>
      <div style={{ height: 16, background: '#f3f4f6', borderRadius: 8, width: '70%', marginBottom: 8 }} />
      <div style={{ height: 12, background: '#f3f4f6', borderRadius: 8, width: '90%', marginBottom: 4 }} />
      <div style={{ height: 12, background: '#f3f4f6', borderRadius: 8, width: '60%', marginBottom: 12 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ height: 20, background: '#f3f4f6', borderRadius: 8, width: '30%' }} />
        <div style={{ height: 34, background: '#f3f4f6', borderRadius: 12, width: '25%' }} />
      </div>
    </div>
  </div>
);

export default function Home() {
  const [items,      setItems]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    categoryService.getAll().then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory !== 'all') params.category = activeCategory;
    if (search.trim().length > 1)  params.search   = search.trim();
    menuService.getAll(params)
      .then(({ data }) => setItems(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

  const popularItems  = items.filter(i => i.isPopular);
  const featuredItems = items.filter(i => i.isFeatured);

  return (
    <div>
      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: 'white', padding: '48px 16px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12, lineHeight: 1.2 }}>
            🍕 Faizan's Kitchen
          </h1>
          <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 28 }}>
            Freshly made, delivered fast. Order your favourite food now!
          </p>
         {/* Search bar */}
<div style={{ position: 'relative', maxWidth: 440, margin: '0 auto' }}>
  <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
    placeholder="Search burgers, pizza, pasta…"
    style={{
      width: '100%',
      padding: '14px 16px 14px 48px',
      borderRadius: 14,
      border: 'none',
      fontSize: 15,
      outline: 'none',
      boxSizing: 'border-box',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      color: '#111827',
      background: 'white',
      caretColor: '#ea580c',
    }} />
</div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 24 }}>
          <button onClick={() => setActiveCategory('all')}
            style={{ flexShrink: 0, padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: activeCategory === 'all' ? '#ea580c' : 'white', color: activeCategory === 'all' ? 'white' : '#374151', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            🍽️ All
          </button>
          {categories.map(cat => (
            <button key={cat._id} onClick={() => setActiveCategory(cat._id)}
              style={{ flexShrink: 0, padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: activeCategory === cat._id ? '#ea580c' : 'white', color: activeCategory === cat._id ? 'white' : '#374151', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: 48 }}>🍽️</p>
            <p style={{ fontWeight: 600, color: '#374151', marginTop: 12 }}>No items found</p>
            <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>Try a different search or category</p>
          </div>
        ) : (
          <>
            {/* Popular section — only on "all" with no search */}
            {activeCategory === 'all' && !search && popularItems.length > 0 && (
              <div style={{ marginBottom: 36 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 16 }}>
                  🔥 Most Popular
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
                  {popularItems.map(item => <MenuItemCard key={item._id} item={item} />)}
                </div>
              </div>
            )}

            {/* All items */}
            <div>
              {activeCategory === 'all' && !search && (
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 16 }}>
                  🍽️ Full Menu
                </h2>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
                {items.map(item => <MenuItemCard key={item._id} item={item} />)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
