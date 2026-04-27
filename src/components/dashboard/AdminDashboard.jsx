// src/components/dashboard/AdminDashboard.jsx
import React, { useState, useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import InventoryTab from './InventoryTab';
import OrdersTab from './OrdersTab';

const TABS = ['Inventory', 'Orders'];

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Inventory');
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h2 className={`text-2xl font-display font-bold mb-6 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
        Admin Dashboard
      </h2>

      {/* Tab bar */}
      <div className={`flex border-b mb-6 ${isDark ? 'border-dark-muted/30' : 'border-light-border/50'}`}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? isDark
                  ? 'border-dark-accent text-dark-accent'
                  : 'border-light-highlight text-light-highlight'
                : `border-transparent ${isDark ? 'text-dark-muted hover:text-dark-text' : 'text-light-muted hover:text-light-text'}`
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Inventory' && <InventoryTab />}
      {activeTab === 'Orders' && <OrdersTab />}
    </div>
  );
}

export default AdminDashboard;
