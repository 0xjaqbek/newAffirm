// src/components/CardFilters.jsx
import React, { useState, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

function CardFilters({ cards, filters, onChange }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [mobileOpen, setMobileOpen] = useState(false);

  const sets = [...new Set(cards.map(c => c.set).filter(Boolean))].sort();
  const rarities = [...new Set(cards.map(c => c.rarity).filter(Boolean))].sort();
  const types = [...new Set(cards.flatMap(c => c.types || []).filter(Boolean))].sort();

  const inputClass = `px-3 py-2 rounded-lg border text-sm focus:outline-none ${
    isDark
      ? 'bg-dark-surface border-dark-muted text-dark-text focus:border-dark-accent'
      : 'bg-light-surface border-light-border text-light-text focus:border-light-highlight'
  }`;

  const filterContent = (
    <div className="flex flex-wrap gap-2">
      <input
        type="text"
        placeholder="Search cards..."
        value={filters.search}
        onChange={e => onChange({ ...filters, search: e.target.value })}
        className={`${inputClass} flex-1 min-w-36`}
      />
      <select
        value={filters.set}
        onChange={e => onChange({ ...filters, set: e.target.value })}
        className={inputClass}
      >
        <option value="">All Sets</option>
        {sets.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <select
        value={filters.rarity}
        onChange={e => onChange({ ...filters, rarity: e.target.value })}
        className={inputClass}
      >
        <option value="">All Rarities</option>
        {rarities.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      <select
        value={filters.type}
        onChange={e => onChange({ ...filters, type: e.target.value })}
        className={inputClass}
      >
        <option value="">All Types</option>
        {types.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      {(filters.search || filters.set || filters.rarity || filters.type) && (
        <button
          onClick={() => onChange({ search: '', set: '', rarity: '', type: '' })}
          className={`px-3 py-2 rounded-lg text-sm ${isDark ? 'text-dark-muted hover:text-dark-text' : 'text-light-muted hover:text-light-text'}`}
        >
          Clear
        </button>
      )}
    </div>
  );

  return (
    <div className="mb-4 px-4">
      {/* Desktop: inline row */}
      <div className="hidden md:block">{filterContent}</div>
      {/* Mobile: collapsible */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(o => !o)}
          className={`w-full py-2 px-4 rounded-lg border text-sm font-medium ${
            isDark
              ? 'border-dark-accent text-dark-accent'
              : 'border-light-highlight text-light-highlight'
          }`}
        >
          {mobileOpen ? 'Hide Filters' : 'Filter & Search'}
        </button>
        {mobileOpen && <div className="mt-2 flex flex-col gap-2">{filterContent}</div>}
      </div>
    </div>
  );
}

export default CardFilters;
