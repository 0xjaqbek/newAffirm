// src/components/dashboard/CustomerDashboard.jsx
import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped:   'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
};

function CustomerDashboard() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { currentUser } = useAuth();
  const [orders] = useLocalStorage('affirm_orders', []);

  const myOrders = orders.filter(o => o.userId === currentUser?.id);

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h2 className={`text-2xl font-display font-bold mb-6 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
        My Orders
      </h2>

      {myOrders.length === 0 ? (
        <div className={`text-center py-12 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
          <p className="text-lg mb-2">No orders yet.</p>
          <p className="text-sm">Contact us to buy cards — find us in the footer.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myOrders.map(order => (
            <div
              key={order.id}
              className={`flex items-center gap-4 p-4 rounded-lg border ${isDark ? 'border-dark-muted/20 bg-dark-surface' : 'border-light-border/30 bg-white'}`}
            >
              {order.cardImage && (
                <img src={order.cardImage} alt={order.cardName} className="h-14 w-auto rounded shadow shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${isDark ? 'text-dark-text' : 'text-light-text'}`}>{order.cardName}</p>
                <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                  Qty: {order.quantity} • ${order.price}
                </p>
                {order.notes && (
                  <p className={`text-xs italic ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>{order.notes}</p>
                )}
                <p className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}`}>
                {order.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;
