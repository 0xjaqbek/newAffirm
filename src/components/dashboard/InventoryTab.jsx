// src/components/dashboard/InventoryTab.jsx
import React, { useState, useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { usePokemonTCG } from '../../hooks/usePokemonTCG';

const CONDITIONS = ['NM', 'LP', 'MP', 'HP', 'D'];

function InventoryTab() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [cards, setCards] = useLocalStorage('affirm_cards', []);
  const { results, loading, error, search, clear } = usePokemonTCG();

  const [query, setQuery] = useState('');
  const [selectedApiCard, setSelectedApiCard] = useState(null);
  const [form, setForm] = useState({ price: '', condition: 'NM', stock: '1' });

  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm ${
    isDark
      ? 'bg-dark-background border-dark-muted text-dark-text focus:border-dark-accent'
      : 'bg-white border-light-border text-light-text focus:border-light-highlight'
  } focus:outline-none`;

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    search(e.target.value);
  };

  const handleSelectCard = (apiCard) => {
    setSelectedApiCard(apiCard);
    setForm({ price: '', condition: 'NM', stock: '1' });
    clear();
    setQuery('');
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!selectedApiCard) return;
    const newCard = {
      id: selectedApiCard.id,
      name: selectedApiCard.name,
      image: selectedApiCard.images?.large || selectedApiCard.images?.small || '',
      set: selectedApiCard.set?.name || '',
      series: selectedApiCard.set?.series || '',
      rarity: selectedApiCard.rarity || '',
      types: selectedApiCard.types || [],
      price: parseFloat(form.price) || 0,
      condition: form.condition,
      stock: parseInt(form.stock, 10) || 1,
      addedAt: Date.now(),
    };
    setCards(prev => {
      const exists = prev.findIndex(c => c.id === newCard.id);
      if (exists !== -1) {
        const updated = [...prev];
        updated[exists] = newCard;
        return updated;
      }
      return [...prev, newCard];
    });
    setSelectedApiCard(null);
    setForm({ price: '', condition: 'NM', stock: '1' });
  };

  const handleDelete = (cardId) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
  };

  return (
    <div className="space-y-6">
      {/* API Search */}
      <div>
        <h3 className={`font-display font-semibold mb-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
          Search pokemontcg.io
        </h3>
        <input
          type="text"
          placeholder="Search by card name (e.g. Pikachu, Charizard)..."
          value={query}
          onChange={handleQueryChange}
          className={inputClass}
        />
        {loading && (
          <p className={`text-sm mt-2 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Searching...</p>
        )}
        {error && (
          <p className="text-sm mt-2 text-red-500">{error}</p>
        )}
        {results.length > 0 && (
          <div className={`mt-2 rounded-lg border max-h-64 overflow-y-auto ${isDark ? 'border-dark-muted bg-dark-surface' : 'border-light-border bg-white'}`}>
            {results.map(card => (
              <button
                key={card.id}
                onClick={() => handleSelectCard(card)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:${isDark ? 'bg-dark-background' : 'bg-light-background'} transition-colors border-b last:border-b-0 ${isDark ? 'border-dark-muted/20' : 'border-light-border/30'}`}
              >
                <img src={card.images?.small} alt={card.name} className="h-12 w-auto rounded" />
                <div>
                  <p className={`font-medium text-sm ${isDark ? 'text-dark-text' : 'text-light-text'}`}>{card.name}</p>
                  <p className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                    {card.set?.name} • {card.rarity}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add Card Form */}
      {selectedApiCard && (
        <form
          onSubmit={handleAddCard}
          className={`rounded-lg p-4 border ${isDark ? 'border-dark-accent/30 bg-dark-surface' : 'border-light-highlight/30 bg-light-surface'}`}
        >
          <div className="flex gap-4 items-start mb-4">
            <img src={selectedApiCard.images?.large} alt={selectedApiCard.name} className="h-32 w-auto rounded shadow" />
            <div>
              <p className={`font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>{selectedApiCard.name}</p>
              <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>{selectedApiCard.set?.name}</p>
              <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>{selectedApiCard.rarity}</p>
              {selectedApiCard.types?.length > 0 && (
                <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>{selectedApiCard.types.join(', ')}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className={`block text-xs mb-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Price ($)</label>
              <input
                type="number" min="0" step="0.01" required
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className={inputClass}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className={`block text-xs mb-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Condition</label>
              <select
                value={form.condition}
                onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
                className={inputClass}
              >
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-xs mb-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Stock</label>
              <input
                type="number" min="0" required
                value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-dark-accent text-dark-text hover:bg-dark-accent/80' : 'bg-light-highlight text-white hover:bg-light-highlight/80'}`}
            >
              Add to Inventory
            </button>
            <button
              type="button"
              onClick={() => setSelectedApiCard(null)}
              className={`px-4 py-2 rounded-lg text-sm ${isDark ? 'text-dark-muted hover:text-dark-text' : 'text-light-muted hover:text-light-text'}`}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Inventory List */}
      <div>
        <h3 className={`font-display font-semibold mb-3 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
          Inventory ({cards.length} cards)
        </h3>
        {cards.length === 0 ? (
          <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>No cards yet. Search above to add some.</p>
        ) : (
          <div className="space-y-2">
            {cards.map(card => (
              <div
                key={card.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${isDark ? 'border-dark-muted/20 bg-dark-surface' : 'border-light-border/30 bg-white'}`}
              >
                <img src={card.image} alt={card.name} className="h-14 w-auto rounded shadow" />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate ${isDark ? 'text-dark-text' : 'text-light-text'}`}>{card.name}</p>
                  <p className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>{card.set} • {card.rarity}</p>
                  <p className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                    ${card.price} • {card.condition} • Stock: {card.stock}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(card.id)}
                  className="text-red-400 hover:text-red-600 text-sm px-2 py-1 shrink-0"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InventoryTab;
