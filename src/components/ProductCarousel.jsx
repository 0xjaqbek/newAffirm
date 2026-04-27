// src/components/ProductCarousel.jsx
// CSS 3D carousel — pokemontcg.io CDN has no CORS headers so WebGL textures are blocked;
// CSS perspective + <img> tags give the same 3D rotating card effect without restrictions.
import React, { useRef, useState, useEffect, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MobileCarousel from './MobileCarousel';
import CardFilters from './CardFilters';
import { useMobileDetector } from '../hooks/useMobileDetector';
import { ThemeContext } from '../contexts/ThemeContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

function DesktopCardCarousel({ products, setCurrentProduct, theme }) {
  const [focusedIndex, setFocusedIndex] = useState(null);
  const containerRef = useRef(null);
  const rotRef = useRef(0);
  const animRef = useRef(null);
  const isDark = theme === 'dark';
  const count = products.length;
  const angleStep = count > 0 ? 360 / count : 0;
  const radius = Math.max(300, count * 70);

  // Auto-rotate: update DOM directly each frame — no React state updates per frame
  useEffect(() => {
    if (focusedIndex !== null) return;
    let last = null;
    const animate = (ts) => {
      if (last !== null && containerRef.current) {
        rotRef.current -= (ts - last) * 0.022;
        containerRef.current.style.transform = `rotateY(${rotRef.current}deg)`;
      }
      last = ts;
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [focusedIndex, count]);

  // Reset selection when product list changes (filter applied)
  useEffect(() => {
    setFocusedIndex(null);
    setCurrentProduct(null);
  }, [count]);

  const handleClick = (i) => {
    if (focusedIndex === i) {
      setFocusedIndex(null);
      setCurrentProduct(null);
      return;
    }
    cancelAnimationFrame(animRef.current);
    setFocusedIndex(i);
    setCurrentProduct(products[i]);

    // Rotate to bring card i to front via shortest path
    const targetRot = -i * angleStep;
    const curNorm = ((rotRef.current % 360) + 360) % 360;
    const tgtNorm = ((targetRot % 360) + 360) % 360;
    let diff = tgtNorm - curNorm;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    rotRef.current += diff;

    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.55s ease';
      containerRef.current.style.transform = `rotateY(${rotRef.current}deg)`;
      setTimeout(() => {
        if (containerRef.current) containerRef.current.style.transition = '';
      }, 600);
    }
  };

  return (
    <div
      style={{
        height: '70vh',
        perspective: '1200px',
        perspectiveOrigin: 'center 40%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        ref={containerRef}
        style={{
          transformStyle: 'preserve-3d',
          width: '180px',
          height: '252px',
          position: 'relative',
        }}
      >
        {products.map((product, i) => {
          const isActive = focusedIndex === i;
          return (
            <div
              key={product.id}
              onClick={() => handleClick(i)}
              style={{
                position: 'absolute',
                width: '180px',
                height: '252px',
                transform: `rotateY(${i * angleStep}deg) translateZ(${radius}px)`,
                cursor: 'pointer',
              }}
            >
              <img
                src={product.image}
                alt={product.name}
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '10px',
                  userSelect: 'none',
                  transform: isActive ? 'scale(1.22) translateZ(24px)' : 'scale(1)',
                  filter: isActive ? 'brightness(1.08)' : 'brightness(0.82)',
                  boxShadow: isActive
                    ? '0 0 36px rgba(255,255,255,0.45), 0 8px 32px rgba(0,0,0,0.55)'
                    : '0 4px 18px rgba(0,0,0,0.45)',
                  transition: 'transform 0.3s ease, filter 0.3s ease, box-shadow 0.3s ease',
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProductCarousel() {
  const [cards] = useLocalStorage('affirm_cards', []);
  const [filters, setFilters] = useState({ search: '', set: '', rarity: '', type: '' });
  const [currentProduct, setCurrentProduct] = useState(null);
  const isMobile = useMobileDetector();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const matchSearch = !filters.search || card.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchSet = !filters.set || card.set === filters.set;
      const matchRarity = !filters.rarity || card.rarity === filters.rarity;
      const matchType = !filters.type || (card.types || []).includes(filters.type);
      return matchSearch && matchSet && matchRarity && matchType;
    });
  }, [cards, filters]);

  const contactToBuy = () => {
    document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isMobile) {
    return (
      <>
        <CardFilters cards={cards} filters={filters} onChange={setFilters} />
        <MobileCarousel items={filteredCards} type="product" />
      </>
    );
  }

  return (
    <div className="relative">
      <CardFilters cards={cards} filters={filters} onChange={setFilters} />

      {filteredCards.length === 0 ? (
        <div className={`flex items-center justify-center`} style={{ height: '70vh' }}>
          <p className={`text-center ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
            {cards.length === 0 ? 'No cards in inventory yet.' : 'No cards match your filters.'}
          </p>
        </div>
      ) : (
        <DesktopCardCarousel
          products={filteredCards}
          setCurrentProduct={setCurrentProduct}
          theme={theme}
        />
      )}

      <p className={`text-center mt-2 mb-2 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
        {currentProduct ? 'Click card again to deselect' : 'Click on a card to view details'}
      </p>

      <AnimatePresence mode="wait">
        {currentProduct && (
          <motion.div
            key={currentProduct.id}
            className={`mx-auto max-w-md mt-2 ${isDark ? 'bg-dark-surface/90' : 'bg-light-surface/90'} backdrop-blur-sm p-6 rounded-lg shadow-lg`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start gap-4">
              {currentProduct.image && (
                <img src={currentProduct.image} alt={currentProduct.name} className="h-32 w-auto rounded shadow-md shrink-0" />
              )}
              <div className="flex-1">
                <h3 className={`font-display font-bold text-xl ${isDark ? 'text-dark-text' : 'text-light-text'}`}>{currentProduct.name}</h3>
                <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>{currentProduct.set}</p>
                <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                  {currentProduct.rarity} • {currentProduct.condition}
                </p>
                {currentProduct.types?.length > 0 && (
                  <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                    {currentProduct.types.join(', ')}
                  </p>
                )}
                <p className={`font-bold mt-1 ${isDark ? 'text-dark-accent' : 'text-light-highlight'}`}>
                  ${currentProduct.price}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                  Stock: {currentProduct.stock}
                </p>
                <button
                  className={`mt-3 btn ${isDark ? 'btn-primary' : 'bg-light-highlight text-white hover:bg-light-highlight/90'}`}
                  onClick={contactToBuy}
                >
                  Contact to Buy
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductCarousel;
