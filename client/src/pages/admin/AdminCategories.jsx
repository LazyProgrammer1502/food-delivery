import { useState, useEffect } from 'react';
import { categoryService } from '../../api/services';
import toast from 'react-hot-toast';

const ICONS = ['🍔','🍕','🍝','🍗','🥤','🍰','🌮','🍜','🥗','🍣','🌯','🍟','🥪','🧆','🍛','🍤','☕'];
const EMPTY = { name: '', icon: '🍽️', order: 0 };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [form,       setForm]       = useState(EMPTY);
  const [editId,     setEditId]     = useState(null);
  const [saving,     setSaving]     = useState(false);

  const load = () => {
    categoryService.getAll()
      .then(({ data }) => setCategories(data.categories))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const startEdit = (cat) => {
    setEditId(cat._id);
    setForm({ name: cat.name, icon: cat.icon || '🍽️', order: cat.order || 0 });
  };

  const cancelEdit = () => { setEditId(null); setForm(EMPTY); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name required');
    setSaving(true);
    try {
      if (editId) {
        await categoryService.update(editId, form);
        toast.success('Updated');
      } else {
        await categoryService.create(form);
        toast.success('Category created');
      }
      cancelEdit();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"?`)) return;
    try {
      await categoryService.remove(cat._id);
      toast.success('Deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div style={{ padding: '24px 16px', maxWidth: 600, boxSizing: 'border-box' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 24 }}>Categories</h1>

      {/* Form */}
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f3f4f6', padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
          {editId ? 'Edit category' : 'New category'}
        </h2>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
              style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              placeholder="e.g. Burgers" />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Icon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {ICONS.map(icon => (
                <button key={icon} type="button" onClick={() => setForm(f => ({ ...f, icon }))}
                  style={{ width: 38, height: 38, borderRadius: 8, border: form.icon === icon ? '2px solid #ea580c' : '1px solid #e5e7eb', background: form.icon === icon ? '#fff7ed' : 'white', fontSize: 20, cursor: 'pointer' }}>
                  {icon}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 12, color: '#9ca3af' }}>Selected: {form.icon}</p>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Display order</label>
            <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} min="0"
              style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Lower number appears first in the menu</p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {editId && (
              <button type="button" onClick={cancelEdit}
                style={{ flex: 1, background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '11px 0', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
            )}
            <button type="submit" disabled={saving}
              style={{ flex: 1, background: '#ea580c', color: 'white', border: 'none', borderRadius: 12, padding: '11px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 52, background: '#f3f4f6', borderRadius: 10 }} />)}
          </div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No categories yet</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {categories.map((cat, idx) => (
              <div key={cat._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: idx < categories.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{cat.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{cat.name}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>Order: {cat.order}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => startEdit(cat)}
                    style={{ fontSize: 12, padding: '5px 12px', borderRadius: 8, border: 'none', background: '#eff6ff', color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(cat)}
                    style={{ fontSize: 12, padding: '5px 12px', borderRadius: 8, border: 'none', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
