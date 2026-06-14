import { createContext, useContext, useState, useEffect } from 'react';

const Ctx = createContext(null);
const STORAGE_KEY = 'faizan_cart';

export const CartProvider = ({ children }) => {
  const [items,    setItems]    = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  });
  const [isOpen, setIsOpen] = useState(false);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (menuItem, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i._id === menuItem._id);
      if (existing) {
        return prev.map(i => i._id === menuItem._id
          ? { ...i, quantity: i.quantity + quantity }
          : i
        );
      }
      return [...prev, { ...menuItem, quantity }];
    });
    setIsOpen(true); // open cart on add
  };

  const removeItem = (id) => setItems(prev => prev.filter(i => i._id !== id));

  const updateQty = (id, quantity) => {
    if (quantity < 1) { removeItem(id); return; }
    setItems(prev => prev.map(i => i._id === id ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal   = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const DELIVERY_FEE = 50;
  const grandTotal = subtotal + DELIVERY_FEE;

  return (
    <Ctx.Provider value={{
      items, isOpen, setIsOpen,
      addItem, removeItem, updateQty, clearCart,
      totalItems, subtotal, grandTotal, DELIVERY_FEE,
    }}>
      {children}
    </Ctx.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart outside CartProvider');
  return ctx;
};
