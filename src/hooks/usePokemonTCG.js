// src/hooks/usePokemonTCG.js
import { useState, useRef } from 'react';

export function usePokemonTCG() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  const search = (query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://api.pokemontcg.io/v2/cards?q=name:*${encodeURIComponent(query.trim())}*&pageSize=20`
        );
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();
        setResults(data.data || []);
      } catch (err) {
        setError('Failed to fetch cards. Check your connection.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const clear = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setResults([]);
    setError(null);
  };

  return { results, loading, error, search, clear };
}
