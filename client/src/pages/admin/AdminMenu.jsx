import { useState, useEffect, useRef, useCallback } from 'react';
import { menuService, categoryService } from '../../api/services';
import toast from 'react-hot-toast';

const EMPTY = { name: '', description: '', price: '', category: '', prepTime: '15', calories: '', tags: '', isPopular: false, isFeatured: false };

export default function AdminMenu() {
  const [items,      setItems]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [preview,    setPreview]    = useState('');
  const [saving,     setSaving]     = useState(false);
  const [toggling,   setToggling]   = useState(null);
  const fileRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    try {
      const [menuRes, catRes] = await Promise.all([menuService.getAdmin(), categoryService.getAll()]);
      setItems(menuRes.data.items);
      setCategories(catRes.data.categories);
    } catch { toast.error('Failed to load menu'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditItem(null);
    setForm(EMPTY);
    setPreview('');
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name, description: item.description || '',
      price: String(item.price), category: item.category?._id || '',
      prepTime: String(item.prepTime || 15), calories: String(item.calories || ''),
      tags: item.tags?.join(', ') || '',
      isPopular: item.isPopular, isFeatured: item.isFeatured,
    });
    setPreview(item.image || '');
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim())  return toast.error('Name required');
    if (!form.price)        return toast.error('Price required');
    if (!form.category)     return toast.error('Category required');

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name',        form.name.trim());
      fd.append('description', form.description.trim());
      fd.append('price',       form.price);
      fd.append('category',    form.category);
      fd.append('prepTime',    form.prepTime);
      fd.append('calories',    form.calories || 0);
      fd.append('isPopular',   form.isPopular);
      fd.append('isFeatured',  form.isFeatured);
      fd.append('tags',        JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)));
      if (fileRef.current?.files[0]) fd.append('image', fileRef.current.files[0]);

      if (editItem) {
        await menuService.update(editItem._id, fd);
        toast.success('Item updated');
      } else {
        await menuService.create(fd);
        toast.success('Item created');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleToggle = async (item) => {
    setToggling(item._id);
    try {
      await menuService.toggle(item._id);
      toast.success(item.isAvailable ? 'Marked unavailable' : 'Marked available');
      load();
    } catch { toast.error('Failed to toggle'); }
    finally { setToggling(null); }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      await menuService.remove(item._id);
      toast.success('Deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div style={{ padding: '24px 16px', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>Menu Items</h1>
        <button onClick={openNew}
          style={{ background: '#ea580c', color: 'white', border: 'none', borderRadius: 12, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          + Add Item
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 16px', overflowY: 'auto' }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 560, padding: 28, position: 'relative', marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 800, fontSize: 18, color: '#111827' }}>{editItem ? 'Edit Item' : 'New Menu Item'}</h2>
              <button onClick={() => setShowForm(false)}
                style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Image */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Image</label>
                {preview ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={preview} alt="preview" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 10 }} />
                    <button type="button" onClick={() => { setPreview(''); if (fileRef.current) fileRef.current.value = ''; }}
                      style={{ position: 'absolute', top: -8, right: -8, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, fontSize: 12, cursor: 'pointer' }}>✕</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    style={{ border: '2px dashed #e5e7eb', borderRadius: 10, padding: '16px 24px', fontSize: 13, color: '#9ca3af', background: 'none', cursor: 'pointer', width: '100%' }}>
                    Click to upload image
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files[0]; if (f) setPreview(URL.createObjectURL(f)); }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Name *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} required
                    style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} placeholder="e.g. Classic Burger" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Price (Rs.) *</label>
                  <input type="number" value={form.price} onChange={e => set('price', e.target.value)} required min="0"
                    style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} placeholder="350" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Category *</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)} required
                    style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '9px 12px', fontSize: 14, outline: 'none', background: 'white', boxSizing: 'border-box' }}>
                    <option value="">Select…</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Prep time (min)</label>
                  <input type="number" value={form.prepTime} onChange={e => set('prepTime', e.target.value)} min="1"
                    style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Calories</label>
                  <input type="number" value={form.calories} onChange={e => set('calories', e.target.value)} min="0"
                    style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} placeholder="e.g. 520" />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Description</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}
                    style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '9px 12px', fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                    placeholder="Describe the dish..." maxLength={300} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Tags (comma separated)</label>
                  <input value={form.tags} onChange={e => set('tags', e.target.value)}
                    style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    placeholder="spicy, vegan, bestseller, crispy" />
                </div>
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', gap: 20 }}>
                {[['isPopular', '🔥 Popular'], ['isFeatured', '⭐ Featured']].map(([key, label]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: '#ea580c' }} />
                    {label}
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ flex: 1, background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '11px 0', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ flex: 1, background: '#ea580c', color: 'white', border: 'none', borderRadius: 12, padding: '11px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Items list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 80, background: '#f3f4f6', borderRadius: 14 }} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(item => (
            <div key={item._id} style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, opacity: item.isAvailable ? 1 : 0.6 }}>
              {item.image
                ? <img src={item.image} alt={item.name} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: 56, height: 56, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🍽️</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{item.name}</p>
                  {item.isPopular  && <span style={{ fontSize: 10, background: '#fff7ed', color: '#ea580c', padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>🔥 Popular</span>}
                  {item.isFeatured && <span style={{ fontSize: 10, background: '#fef9c3', color: '#a16207', padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>⭐ Featured</span>}
                  {!item.isAvailable && <span style={{ fontSize: 10, background: '#f3f4f6', color: '#6b7280', padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>Unavailable</span>}
                </div>
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  {item.category?.icon} {item.category?.name} · Rs. {item.price} · ⏱ {item.prepTime} min
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button onClick={() => handleToggle(item)} disabled={toggling === item._id}
                  style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 500, color: item.isAvailable ? '#6b7280' : '#16a34a' }}>
                  {toggling === item._id ? '…' : item.isAvailable ? '🔴 Disable' : '🟢 Enable'}
                </button>
                <button onClick={() => openEdit(item)}
                  style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, border: 'none', background: '#eff6ff', color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(item)}
                  style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, border: 'none', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
