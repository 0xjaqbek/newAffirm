// src/components/dashboard/OrdersTab.jsx
import React, { useState, useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { ACCOUNTS } from '../../contexts/AuthContext';

const STATUSES = ['pending', 'confirmed', 'shipped', 'completed'];

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped:   'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
};

const CUSTOMERS = ACCOUNTS.filter(a => a.role === 'user');

function OrdersTab() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [cards] = useLocalStorage('affirm_cards', []);
  const [orders, setOrders] = useLocalStorage('affirm_orders', []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    userId: CUSTOMERS[0]?.id || '',
    cardId: '',
    quantity: '1',
    price: '',
    status: 'pending',
    notes: '',
  });

  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm ${
    isDark
      ? 'bg-dark-background border-dark-muted text-dark-text focus:border-dark-accent'
      : 'bg-white border-light-border text-light-text focus:border-light-highlight'
  } focus:outline-none`;

  const handleSubmit = (e) => {
    e.preventDefault();
    const card = cards.find(c => c.id === form.cardId);
    const newOrder = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      userId: form.userId,
      cardId: form.cardId,
      cardName: card?.name || '',
      cardImage: card?.image || '',
      quantity: parseInt(form.quantity, 10) || 1,
      price: parseFloat(form.price) || 0,
      status: form.status,
      notes: form.notes,
      createdAt: Date.now(),
    };
    setOrders(prev => [newOrder, ...prev]);
    setShowForm(false);
    setForm({ userId: CUSTOMERS[0]?.id || '', cardId: '', quantity: '1', price: '', status: 'pending', notes: '' });
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`font-display font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
          Orders ({orders.length})
        </h3>
        <button
          onClick={() => setShowForm(f => !f)}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-dark-accent text-dark-text hover:bg-dark-accent/80' : 'bg-light-highlight text-white hover:bg-light-highlight/80'}`}
        >
          {showForm ? 'Cancel' : '+ Log Order'}
        </button>
      </div>

      {/* Log Order Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className={`rounded-lg p-4 border space-y-3 ${isDark ? 'border-dark-accent/30 bg-dark-surface' : 'border-light-highlight/30 bg-light-surface'}`}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs mb-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Customer</label>
              <select value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} className={inputClass}>
                {CUSTOMERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-xs mb-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Card</label>
              <select required value={form.cardId} onChange={e => setForm(f => ({ ...f, cardId: e.target.value }))} className={inputClass}>
                <option value="">Select card...</option>
                {cards.map(c => <option key={c.id} value={c.id}>{c.name} ({c.condition})</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-xs mb-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Quantity</label>
              <input type="number" min="1" required value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={`block text-xs mb-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Price ($)</label>
              <input type="number" min="0" step="0.01" required value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className={inputClass} placeholder="0.00" />
            </div>
            <div>
              <label className={`block text-xs mb-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={inputClass}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-xs mb-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Notes</label>
              <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={inputClass} placeholder="Optional..." />
            </div>
          </div>
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-dark-accent text-dark-text' : 'bg-light-highlight text-white'}`}
          >
            Save Order
          </button>
        </form>
      )}

      {/* Orders Table */}
      {orders.length === 0 ? (
        <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>No orders logged yet.</p>
      ) : (
        <div className="space-y-2">
          {orders.map(order => (
            <div
              key={order.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${isDark ? 'border-dark-muted/20 bg-dark-surface' : 'border-light-border/30 bg-white'}`}
            >
              {order.cardImage && (
                <img src={order.cardImage} alt={order.cardName} className="h-12 w-auto rounded shadow shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${isDark ? 'text-dark-text' : 'text-light-text'}`}>{order.cardName}</p>
                <p className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                  {ACCOUNTS.find(a => a.id === order.userId)?.name || order.userId} • qty {order.quantity} • ${order.price}
                </p>
                {order.notes && (
                  <p className={`text-xs italic ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>{order.notes}</p>
                )}
                <p className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <select
                value={order.status}
                onChange={e => handleStatusChange(order.id, e.target.value)}
                className={`text-xs px-2 py-1 rounded-full font-medium border-0 ${STATUS_COLORS[order.status]}`}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrdersTab;
