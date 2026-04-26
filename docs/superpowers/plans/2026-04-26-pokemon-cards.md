# Pokemon Card Store Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the aFFiRM t-shirt store into a Pokemon card store with inventory management, role-based dashboard, and card search/filtering.

**Architecture:** Extends the existing `activeSection` state-based routing. A new `AuthContext` wraps the app alongside `ThemeContext`. Card inventory and orders persist in `localStorage`. The admin uses the pokemontcg.io API to search and add cards; the existing 3D/Swiper carousels are preserved and wired to the live inventory.

**Tech Stack:** React 18, Vite, Tailwind CSS, framer-motion, Three.js/R3F, Swiper, pokemontcg.io v2 API (no key required for MVP)

> **Note:** No test framework is configured in this project. Each task uses `npm run dev` + manual browser verification instead of automated tests.

---

## File Map

| Status | File | Purpose |
|---|---|---|
| CREATE | `src/hooks/useLocalStorage.js` | Generic localStorage read/write hook |
| CREATE | `src/contexts/AuthContext.jsx` | Hardcoded accounts, login/logout state |
| CREATE | `src/hooks/usePokemonTCG.js` | Debounced search against pokemontcg.io v2 |
| CREATE | `src/components/AuthModal.jsx` | Role-selector modal (Admin / Customer) |
| CREATE | `src/components/CardFilters.jsx` | Search input + Set/Rarity/Type dropdowns |
| CREATE | `src/components/dashboard/AdminDashboard.jsx` | Tab wrapper (Inventory / Orders) |
| CREATE | `src/components/dashboard/InventoryTab.jsx` | API search → add card → inventory list |
| CREATE | `src/components/dashboard/OrdersTab.jsx` | Log order form + orders table |
| CREATE | `src/components/dashboard/CustomerDashboard.jsx` | Customer read-only order history |
| MODIFY | `src/App.jsx` | Add AuthProvider, dashboard section, AuthModal |
| MODIFY | `src/components/navbar.jsx` | Dashboard button, logged-in state, logout |
| MODIFY | `src/components/ProductCarousel.jsx` | localStorage cards, CardFilters, updated detail panel |
| MODIFY | `src/components/MobileCarousel.jsx` | Pokemon card fields in product renderer |
| MODIFY | `src/components/GalleryCarousel.jsx` | Inventory card images instead of static IMAGES array |

---

## Task 1: useLocalStorage hook

**Files:**
- Create: `src/hooks/useLocalStorage.js`

- [ ] **Step 1: Create the hook**

```js
// src/hooks/useLocalStorage.js
import { useState } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue];
}
```

- [ ] **Step 2: Verify**

Run: `npm run dev`
Open browser console and paste:
```js
localStorage.setItem('affirm_test', JSON.stringify([1,2,3]));
JSON.parse(localStorage.getItem('affirm_test')); // should return [1,2,3]
localStorage.removeItem('affirm_test');
```
Expected: no errors, returns `[1,2,3]`.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useLocalStorage.js
git commit -m "feat: add useLocalStorage hook"
```

---

## Task 2: AuthContext

**Files:**
- Create: `src/contexts/AuthContext.jsx`

- [ ] **Step 1: Create the context**

```jsx
// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';

export const ACCOUNTS = [
  { id: 'admin',    role: 'admin', name: 'Admin' },
  { id: 'customer', role: 'user',  name: 'Customer' },
];

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const login = (accountId) => {
    const account = ACCOUNTS.find(a => a.id === accountId);
    if (account) setCurrentUser(account);
  };

  const logout = () => setCurrentUser(null);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, ACCOUNTS }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

- [ ] **Step 2: Verify**

No UI yet — verify by reading the file and confirming it exports `AuthProvider`, `useAuth`, `ACCOUNTS`.

- [ ] **Step 3: Commit**

```bash
git add src/contexts/AuthContext.jsx
git commit -m "feat: add AuthContext with hardcoded accounts"
```

---

## Task 3: usePokemonTCG hook

**Files:**
- Create: `src/hooks/usePokemonTCG.js`

- [ ] **Step 1: Create the hook**

```js
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
```

- [ ] **Step 2: Verify**

In browser console (with dev server running):
```js
const res = await fetch('https://api.pokemontcg.io/v2/cards?q=name:*Pikachu*&pageSize=3');
const data = await res.json();
console.log(data.data[0].name, data.data[0].images.large);
```
Expected: logs a Pikachu card name and image URL.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/usePokemonTCG.js
git commit -m "feat: add usePokemonTCG search hook with debounce"
```

---

## Task 4: AuthModal

**Files:**
- Create: `src/components/AuthModal.jsx`

- [ ] **Step 1: Create the component**

```jsx
// src/components/AuthModal.jsx
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

function AuthModal({ closeModal, onLogin }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { login, ACCOUNTS } = useAuth();

  const handleSelect = (accountId) => {
    login(accountId);
    onLogin();
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={`rounded-xl p-8 shadow-2xl w-80 ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}
      >
        <h2 className={`text-2xl font-display font-bold mb-2 text-center ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
          Dashboard
        </h2>
        <p className={`text-sm text-center mb-6 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
          Select your account
        </p>
        <div className="flex flex-col gap-3">
          {ACCOUNTS.map(account => (
            <button
              key={account.id}
              onClick={() => handleSelect(account.id)}
              className={`w-full py-3 rounded-lg font-semibold text-lg transition-all ${
                account.role === 'admin'
                  ? isDark
                    ? 'bg-dark-accent text-dark-text hover:bg-dark-accent/80'
                    : 'bg-light-highlight text-white hover:bg-light-highlight/80'
                  : isDark
                    ? 'border border-dark-accent text-dark-accent hover:bg-dark-accent/10'
                    : 'border border-light-highlight text-light-highlight hover:bg-light-highlight/10'
              }`}
            >
              {account.name}
            </button>
          ))}
        </div>
        <button
          onClick={closeModal}
          className={`mt-4 w-full py-2 text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'} hover:underline`}
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
}

export default AuthModal;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AuthModal.jsx
git commit -m "feat: add AuthModal role-selector"
```

---

## Task 5: Update App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Replace App.jsx with the following**

```jsx
// src/App.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/navbar';
import ProductCarousel from './components/ProductCarousel';
import GalleryCarousel from './components/GalleryCarousel';
import Footer from './components/Footer';
import ManifestoModal from './components/ManifestModal';
import AuthModal from './components/AuthModal';
import { useMobileDetector } from './hooks/useMobileDetector';
import { ThemeProvider, ThemeContext } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const ThemedApp = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [activeSection, setActiveSection] = useState('shop');
  const [mainLogoPosition, setMainLogoPosition] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const mainLogoRef = useRef(null);
  const isMobile = useMobileDetector();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    const updateLogoPosition = () => {
      if (mainLogoRef.current) {
        const rect = mainLogoRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        setMainLogoPosition(rect.top + scrollTop);
      }
    };
    updateLogoPosition();
    window.addEventListener('resize', updateLogoPosition);
    return () => window.removeEventListener('resize', updateLogoPosition);
  }, [mainLogoRef]);

  const openModal = (modalId) => setActiveModal(modalId);
  const closeModal = () => setActiveModal(null);

  const openDashboard = () => {
    if (currentUser) {
      setActiveSection('dashboard');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLogout = () => {
    logout();
    setActiveSection('shop');
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
      <Navbar
        openModal={openModal}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        mainLogoPosition={mainLogoPosition}
        openDashboard={openDashboard}
        onLogout={handleLogout}
      />

      <main className="flex-grow">
        <section className={`container ${isMobile ? 'py-0.5' : 'py-1'}`}>
          <motion.div
            ref={mainLogoRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`text-center ${isMobile ? 'mb-2' : 'mb-4'}`}
          >
            <h1 className={`logo text-5xl m-3 ${!isDark && 'text-light-highlight'}`}>aFFiRM.</h1>
            <h2 className={`text-lg ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Pokemon Card Store</h2>
            <p className={`mt-1 max-w-md mx-auto ${isDark ? 'text-dark-text' : 'text-light-text'}`}>.</p>
          </motion.div>

          {activeSection === 'shop' && (
            <div>
              <h2 className={`text-2xl font-display font-bold ${isMobile ? 'mb-1' : 'mb-2'} text-center ${isDark ? 'text-dark-text' : 'text-light-highlight'}`}>
                Card Shop
              </h2>
              <ProductCarousel />
            </div>
          )}

          {activeSection === 'gallery' && (
            <div>
              <h2 className={`text-2xl font-display font-bold ${isMobile ? 'mb-4' : 'mb-8'} text-center ${isDark ? 'text-dark-text' : 'text-light-highlight'}`}>
                Card Gallery
              </h2>
              <GalleryCarousel />
            </div>
          )}

          {activeSection === 'dashboard' && currentUser && (
            <DashboardSection />
          )}
        </section>
      </main>

      <Footer />

      {activeModal === 'manifesto' && <ManifestoModal closeModal={closeModal} />}

      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            closeModal={() => setShowAuthModal(false)}
            onLogin={() => setActiveSection('dashboard')}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Lazy imports at module scope (correct React.lazy pattern)
const AdminDashboard = React.lazy(() => import('./components/dashboard/AdminDashboard'));
const CustomerDashboard = React.lazy(() => import('./components/dashboard/CustomerDashboard'));

const DashboardSection = () => {
  const { currentUser } = useAuth();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  if (!currentUser) return null;

  return (
    <React.Suspense fallback={
      <div className={`text-center py-12 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Loading...</div>
    }>
      {currentUser.role === 'admin' ? <AdminDashboard /> : <CustomerDashboard />}
    </React.Suspense>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemedApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
```

- [ ] **Step 2: Verify**

`npm run dev` — page loads, shows "Pokemon Card Store" subtitle, no console errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add AuthProvider, dashboard section routing, auth modal trigger to App"
```

---

## Task 6: Update Navbar

**Files:**
- Modify: `src/components/navbar.jsx`

- [ ] **Step 1: Replace navbar.jsx with the following**

```jsx
// src/components/navbar.jsx
import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { useMobileDetector } from '../hooks/useMobileDetector';
import { ThemeContext } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

function Navbar({ openModal, activeSection, setActiveSection, mainLogoPosition, openDashboard, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogoInHeader, setShowLogoInHeader] = useState(false);
  const isMobile = useMobileDetector();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 20;
      setShowLogoInHeader(window.scrollY > scrollThreshold);
      setScrolled(window.scrollY > scrollThreshold);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navBtnClass = (section) =>
    `transition-colors px-3 py-1 rounded-full ${
      activeSection === section
        ? isDark
          ? 'text-dark-accent'
          : 'text-light-highlight border border-light-border'
        : isDark
          ? 'text-dark-text hover:text-dark-accent'
          : 'text-light-contrast hover:text-light-highlight'
    }`;

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ${
        scrolled
          ? isDark
            ? 'bg-dark-background/80 backdrop-blur-md shadow-md'
            : 'bg-light-background/80 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container flex justify-between items-center">
        <div
          className="flex items-center w-56 transition-opacity duration-500 ease-in-out"
          style={{ opacity: showLogoInHeader ? 1 : 0 }}
        >
          <button
            className={`logo text-4xl hover:opacity-80 transition-opacity ${!isDark && 'text-light-highlight'}`}
            onClick={() => setActiveSection('shop')}
          >
            aFFiRM.
          </button>
          <div className="ml-2 flex flex-col justify-center">
            <span className={`text-[10px] uppercase tracking-wider font-thin leading-[0.5rem] ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Pokemon</span>
            <span className={`text-[10px] uppercase tracking-wider font-thin leading-[0.5rem] ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Card</span>
            <span className={`text-[10px] uppercase tracking-wider font-thin leading-[0.5rem] ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Store</span>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center space-x-4">
          <button className={navBtnClass('shop')} onClick={() => setActiveSection('shop')}>Shop</button>
          <button className={navBtnClass('gallery')} onClick={() => setActiveSection('gallery')}>Gallery</button>
          <button
            className={`transition-colors px-3 py-1 rounded-full ${isDark ? 'text-dark-text hover:text-dark-accent' : 'text-light-contrast hover:text-light-highlight'}`}
            onClick={() => openModal('manifesto')}
          >
            Manifesto
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                className={navBtnClass('dashboard')}
                onClick={() => openDashboard()}
              >
                {currentUser.name}
              </button>
              <button
                onClick={onLogout}
                className={`text-xs px-2 py-1 rounded border ${
                  isDark
                    ? 'border-dark-muted text-dark-muted hover:border-dark-accent hover:text-dark-accent'
                    : 'border-light-border text-light-muted hover:border-light-highlight hover:text-light-highlight'
                }`}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={openDashboard}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                isDark
                  ? 'border border-dark-accent text-dark-accent hover:bg-dark-accent/10'
                  : 'border border-light-highlight text-light-highlight hover:bg-light-highlight/10'
              }`}
            >
              Dashboard
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <button className="p-2 focus:outline-none" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div
          className={`md:hidden absolute top-full left-0 right-0 ${isDark ? 'bg-dark-surface' : 'bg-light-surface shadow-lg'} p-4`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col space-y-3">
            {['shop', 'gallery'].map(section => (
              <button
                key={section}
                className={`py-2 px-4 rounded-md capitalize ${
                  activeSection === section
                    ? isDark
                      ? 'bg-dark-accent/10 text-dark-accent'
                      : 'bg-light-highlight/10 text-light-highlight border border-light-border'
                    : ''
                }`}
                onClick={() => { setActiveSection(section); setIsMenuOpen(false); }}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
            <button className="py-2 px-4 rounded-md" onClick={() => { openModal('manifesto'); setIsMenuOpen(false); }}>
              Manifesto
            </button>
            {currentUser ? (
              <>
                <button
                  className={`py-2 px-4 rounded-md ${activeSection === 'dashboard' ? (isDark ? 'bg-dark-accent/10 text-dark-accent' : 'bg-light-highlight/10 text-light-highlight border border-light-border') : ''}`}
                  onClick={() => { openDashboard(); setIsMenuOpen(false); }}
                >
                  {currentUser.name} Dashboard
                </button>
                <button className="py-2 px-4 rounded-md text-left" onClick={() => { onLogout(); setIsMenuOpen(false); }}>
                  Logout
                </button>
              </>
            ) : (
              <button className="py-2 px-4 rounded-md" onClick={() => { openDashboard(); setIsMenuOpen(false); }}>
                Dashboard
              </button>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}

export default Navbar;
```

- [ ] **Step 2: Verify**

Dev server running — navbar shows "Dashboard" button. Clicking it opens the AuthModal. Selecting Admin shows the user name in the navbar. Logout returns to Shop.

- [ ] **Step 3: Commit**

```bash
git add src/components/navbar.jsx
git commit -m "feat: add Dashboard button and auth state to Navbar"
```

---

## Task 7: CardFilters component

**Files:**
- Create: `src/components/CardFilters.jsx`

- [ ] **Step 1: Create the component**

```jsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CardFilters.jsx
git commit -m "feat: add CardFilters component with search and set/rarity/type dropdowns"
```

---

## Task 8: Update ProductCarousel

**Files:**
- Modify: `src/components/ProductCarousel.jsx`

- [ ] **Step 1: Replace ProductCarousel.jsx with the following**

```jsx
// src/components/ProductCarousel.jsx
import React, { useRef, useState, useEffect, useMemo, useContext } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useCursor, Environment, PresentationControls, ContactShadows, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import MobileCarousel from './MobileCarousel';
import CardFilters from './CardFilters';
import { useMobileDetector } from '../hooks/useMobileDetector';
import { ThemeContext } from '../contexts/ThemeContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

function ProductFrame({ product, index, setFocused, isFocused, totalProducts, theme, featuredIndex, userInteracted, ...props }) {
  const mesh = useRef();
  const [hovered, setHovered] = useState(false);
  const { viewport, camera } = useThree();
  useCursor(hovered);
  const isDark = theme === 'dark';

  const texture = useTexture(product.image);

  const baseScale = 3;
  const scaleFactor = useMemo(() => Math.min(viewport.width, viewport.height) / 12, [viewport]);
  const originalPosition = useMemo(() => new THREE.Vector3(...props.position), [props.position]);

  const floatSpeed = 0.5 + (index / Math.max(totalProducts, 1)) * 0.5;
  const floatHeight = 0.05 + (index % 3) * 0.02;
  const isFeatured = featuredIndex === index;

  useFrame((state) => {
    if (!mesh.current) return;
    const floatY = Math.sin(state.clock.elapsedTime * floatSpeed) * floatHeight;
    const lookPos = new THREE.Vector3();
    camera.getWorldPosition(lookPos);
    mesh.current.lookAt(lookPos);

    if (isFocused) {
      mesh.current.scale.x = THREE.MathUtils.lerp(mesh.current.scale.x, baseScale * scaleFactor * 1.9, 0.08);
      mesh.current.scale.y = THREE.MathUtils.lerp(mesh.current.scale.y, baseScale * scaleFactor * 1.9, 0.08);
      const toCamera = new THREE.Vector3(-1, 0, 0);
      const targetPosition = originalPosition.clone().add(toCamera);
      mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, targetPosition.x, 0.08);
      mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, targetPosition.y + floatY * 0.3, 0.08);
      mesh.current.position.z = THREE.MathUtils.lerp(mesh.current.position.z, targetPosition.z, 0.08);
      mesh.current.material.color.lerp(new THREE.Color('#FFFFFF'), 0.05);
    } else if (isFeatured && !userInteracted) {
      mesh.current.scale.x = THREE.MathUtils.lerp(mesh.current.scale.x, baseScale * scaleFactor * 1.5, 0.05);
      mesh.current.scale.y = THREE.MathUtils.lerp(mesh.current.scale.y, baseScale * scaleFactor * 1.5, 0.05);
      mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, originalPosition.x, 0.05);
      mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, originalPosition.y + floatY * 1.5, 0.05);
      mesh.current.position.z = THREE.MathUtils.lerp(mesh.current.position.z, originalPosition.z, 0.05);
      mesh.current.material.color.lerp(new THREE.Color('#FFFFFF'), 0.05);
    } else if (hovered) {
      const targetScale = baseScale * scaleFactor * 1.15;
      mesh.current.scale.x = THREE.MathUtils.lerp(mesh.current.scale.x, targetScale, 0.05);
      mesh.current.scale.y = THREE.MathUtils.lerp(mesh.current.scale.y, targetScale, 0.05);
      mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, originalPosition.x, 0.05);
      mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, originalPosition.y + floatY, 0.05);
      mesh.current.position.z = THREE.MathUtils.lerp(mesh.current.position.z, originalPosition.z, 0.05);
      mesh.current.material.color.lerp(new THREE.Color('#FFFFFF'), 0.05);
    } else {
      const targetScale = baseScale * scaleFactor;
      mesh.current.scale.x = THREE.MathUtils.lerp(mesh.current.scale.x, targetScale, 0.05);
      mesh.current.scale.y = THREE.MathUtils.lerp(mesh.current.scale.y, targetScale, 0.05);
      mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, originalPosition.x, 0.05);
      mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, originalPosition.y + floatY, 0.05);
      mesh.current.position.z = THREE.MathUtils.lerp(mesh.current.position.z, originalPosition.z, 0.05);
      mesh.current.material.color.lerp(new THREE.Color('#FFFFFF'), 0.05);
    }
  });

  return (
    <mesh
      ref={mesh}
      {...props}
      onClick={(e) => { e.stopPropagation(); setFocused(isFocused ? null : index); }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={[baseScale * scaleFactor, baseScale * scaleFactor * 1.4, 0.1]}
    >
      <boxGeometry args={[1, 1, 0.1]} />
      <meshStandardMaterial color="#FFFFFF" map={texture} transparent={true} />
    </mesh>
  );
}

function ProductsGallery({ products, setCurrentProduct, theme }) {
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const [rotationPaused, setRotationPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const group = useRef();
  const elapsedTimeRef = useRef(0);
  const lastUpdateTimeRef = useRef(0);
  const { viewport } = useThree();

  const radius = useMemo(() => Math.min(viewport.width, viewport.height) * 0.35, [viewport]);
  const theta = useMemo(() => (2 * Math.PI) / Math.max(products.length, 1), [products.length]);
  const featureDuration = 5;
  const fadeOutDuration = 0.4;
  const fadeInDuration = 0.4;

  useFrame((state, delta) => {
    elapsedTimeRef.current += delta;
    if (!group.current || products.length === 0) return;

    if (rotationPaused) {
      if (focusedIndex !== null) {
        const targetRotation = -focusedIndex * theta;
        const currentRotation = group.current.rotation.y;
        let diff = targetRotation - currentRotation;
        if (diff > Math.PI) diff -= 2 * Math.PI;
        if (diff < -Math.PI) diff += 2 * Math.PI;
        group.current.rotation.y += diff * 0.05;
      }
    } else {
      if (!isTransitioning) {
        group.current.rotation.y -= delta * 0.2;
        const normalizedRotation = -group.current.rotation.y % (2 * Math.PI);
        const newFeaturedIndex = Math.round(normalizedRotation / theta) % products.length;
        const positiveIndex = (newFeaturedIndex + products.length) % products.length;
        if (positiveIndex !== featuredIndex && elapsedTimeRef.current - lastUpdateTimeRef.current > featureDuration) {
          setIsTransitioning(true);
          setFeaturedIndex(positiveIndex);
          setTimeout(() => {
            setIsTransitioning(false);
            lastUpdateTimeRef.current = elapsedTimeRef.current;
          }, (fadeOutDuration + fadeInDuration) * 1000);
        }
      }
    }
  });

  useEffect(() => {
    if (focusedIndex !== null) {
      setCurrentProduct(products[focusedIndex]);
      setUserInteracted(true);
      setRotationPaused(true);
    } else if (featuredIndex !== null && !userInteracted) {
      setCurrentProduct(products[featuredIndex] || null);
    } else {
      setCurrentProduct(null);
    }
  }, [focusedIndex, featuredIndex, userInteracted, products, setCurrentProduct]);

  useEffect(() => {
    if (focusedIndex === null) {
      const timer = setTimeout(() => {
        setUserInteracted(false);
        setRotationPaused(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [focusedIndex]);

  // Reset focused/featured when products array changes (filter)
  useEffect(() => {
    setFocusedIndex(null);
    setFeaturedIndex(0);
    setUserInteracted(false);
    setRotationPaused(false);
  }, [products.length]);

  return (
    <group ref={group} position={[0, 0, 0]}>
      {products.map((product, i) => (
        <ProductFrame
          key={product.id}
          product={product}
          index={i}
          totalProducts={products.length}
          position={[radius * Math.sin(i * theta), 0, radius * Math.cos(i * theta)]}
          setFocused={setFocusedIndex}
          isFocused={focusedIndex === i}
          featuredIndex={featuredIndex}
          userInteracted={userInteracted}
          theme={theme}
        />
      ))}
    </group>
  );
}

function ProductCarousel() {
  const [cards] = useLocalStorage('affirm_cards', []);
  const [filters, setFilters] = useState({ search: '', set: '', rarity: '', type: '' });
  const [currentProduct, setCurrentProduct] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
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

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentProduct) setShowDetails(false);
  }, [currentProduct]);

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
      <div className="carousel-container" style={{ height: '75vh' }}>
        {!isLoaded ? (
          <div className={`flex items-center justify-center h-full ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
            <div className="text-center">
              <div className={`inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDark ? 'border-dark-accent' : 'border-light-accent'}`}></div>
              <p className={`mt-4 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Loading Cards...</p>
            </div>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className={`flex items-center justify-center h-full ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
            <p className={`text-center ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
              {cards.length === 0 ? 'No cards in inventory yet.' : 'No cards match your filters.'}
            </p>
          </div>
        ) : (
          <Canvas
            camera={{ position: [0, 0, 15], fov: 50 }}
            dpr={window.devicePixelRatio > 1 ? 1.5 : 1}
            gl={{ powerPreference: 'default', antialias: true, alpha: false, stencil: false, depth: true, failIfMajorPerformanceCaveat: false }}
            frameloop="always"
          >
            <color attach="background" args={[isDark ? '#121212' : '#F2F0EA']} />
            <fog attach="fog" args={[isDark ? '#121212' : '#F2F0EA', 8, 30]} />
            <ambientLight intensity={isDark ? 0.7 : 0.9} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={isDark ? 1 : 1.2} castShadow />
            <PresentationControls
              global zoom={0.8} rotation={[0, 0, 0]}
              polar={[-Math.PI / 3, Math.PI / 3]}
              azimuth={[-Math.PI / 1.5, Math.PI / 1.5]}
              config={{ mass: 1, tension: 170, friction: 26 }}
              snap={false}
              enabled={currentProduct === null}
            >
              <ProductsGallery products={filteredCards} setCurrentProduct={setCurrentProduct} theme={theme} />
            </PresentationControls>
            <ContactShadows position={[0, 4, 0]} opacity={0.1} scale={200} blur={20} far={200} />
            <Environment preset={isDark ? 'city' : 'sunset'} />
          </Canvas>
        )}
      </div>

      <motion.div
        className="absolute inset-x-0 bottom-4 px-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className={`mb-2 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
          {currentProduct ? 'Click card again to deselect' : 'Click on a card to view details'}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {currentProduct && (
          <motion.div
            key={currentProduct.id}
            className={`absolute left-0 right-0 mx-auto max-w-md ${isDark ? 'bg-dark-surface/90' : 'bg-light-surface/90'} backdrop-blur-sm p-6 rounded-lg shadow-lg`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-start gap-4">
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
              </div>
              <button
                className={`btn shrink-0 ${isDark ? 'btn-primary' : 'bg-light-highlight text-white hover:bg-light-highlight/90'}`}
                onClick={contactToBuy}
              >
                Contact to Buy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductCarousel;
```

- [ ] **Step 2: Verify**

Dev server — Shop section loads. With no inventory: shows "No cards in inventory yet." Filters render above carousel. No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ProductCarousel.jsx
git commit -m "feat: wire ProductCarousel to localStorage inventory with filters and Pokemon card detail panel"
```

---

## Task 9: Update MobileCarousel

**Files:**
- Modify: `src/components/MobileCarousel.jsx`

- [ ] **Step 1: Replace MobileCarousel.jsx with the following**

```jsx
// src/components/MobileCarousel.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion } from 'framer-motion';
import { FiMaximize } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation, Autoplay } from 'swiper/modules';
import { ThemeContext } from '../contexts/ThemeContext';

const MobileCarousel = ({ items, type }) => {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerHeight, setContainerHeight] = useState(type === 'product' ? 450 : 350);
  const swiperRef = useRef(null);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  useEffect(() => {
    setContainerHeight(type === 'product' ? 450 : 350);
  }, [items, type]);

  const renderProductItem = (item) => {
    return (
      <div className="flex flex-col items-center h-full py-6">
        <div className="bg-surface p-4 rounded-lg shadow-md mb-3 transform transition-all duration-300 hover:scale-105">
          <img src={item.image} alt={item.name} className="h-48 w-auto object-contain mx-auto" />
        </div>
        <h3 className={`font-display font-bold text-xl mt-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>{item.name}</h3>
        <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>{item.set}</p>
        <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>{item.rarity} • {item.condition}</p>
        {item.types?.length > 0 && (
          <p className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>{item.types.join(', ')}</p>
        )}
        <p className={`font-bold mt-1 ${isDark ? 'text-dark-accent' : 'text-light-highlight'}`}>${item.price}</p>
        <p className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Stock: {item.stock}</p>
        <div className="flex flex-col items-center mt-3">
          <button
            className={`btn px-6 py-2 rounded-full ${isDark ? 'btn-primary' : 'bg-light-highlight text-white hover:bg-light-highlight/90'}`}
            onClick={() => document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Contact to Buy
          </button>
        </div>
      </div>
    );
  };

  const renderGalleryItem = (item, index) => {
    return (
      <div className="relative h-full flex items-center justify-center py-6">
        <img src={item} alt="Gallery item" className="max-h-64 w-auto object-contain mx-auto rounded-lg shadow-xl transform transition-all duration-300 hover:scale-105" />
        <button
          className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full"
          onClick={() => { setActiveIndex(index); setShowFullscreen(true); }}
        >
          <FiMaximize size={20} />
        </button>
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="w-full" style={{ height: `${containerHeight + 40}px`, perspective: '1000px', perspectiveOrigin: 'center' }}>
        <Swiper
          ref={swiperRef}
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          coverflowEffect={{ rotate: 50, stretch: 0, depth: 100, modifier: 1, slideShadows: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          speed={1000}
          pagination={{ clickable: true, dynamicBullets: true }}
          navigation={true}
          modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
          className="h-full"
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          {items.map((item, index) => (
            <SwiperSlide
              key={index}
              style={{ width: type === 'product' ? '280px' : '320px', height: type === 'product' ? '380px' : '280px' }}
              className={`${isDark ? 'bg-dark-background/30' : 'bg-light-background/30'} backdrop-blur-sm rounded-lg border ${isDark ? 'border-dark-muted/10' : 'border-light-border/10'}`}
            >
              {type === 'product' ? renderProductItem(item) : renderGalleryItem(item, index)}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {showFullscreen && type === 'gallery' && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
          onClick={() => setShowFullscreen(false)}
        >
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            src={items[activeIndex]} alt="Full size"
            className="max-w-full max-h-full p-4 object-contain"
          />
          <div className="absolute bottom-10 flex space-x-4">
            <button className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full" onClick={(e) => { e.stopPropagation(); setActiveIndex(prev => prev > 0 ? prev - 1 : items.length - 1); }}>Previous</button>
            <button className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full" onClick={(e) => { e.stopPropagation(); setActiveIndex(prev => prev < items.length - 1 ? prev + 1 : 0); }}>Next</button>
          </div>
          <button className="absolute top-6 right-6 text-white text-xl bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-80 transition-all" onClick={(e) => { e.stopPropagation(); setShowFullscreen(false); }}>✕</button>
        </motion.div>
      )}
    </div>
  );
};

export default MobileCarousel;
```

- [ ] **Step 2: Verify**

On mobile (or narrow viewport) — card swiper shows card image, name, set, rarity, condition, price, stock, and "Contact to Buy" button. No console errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/MobileCarousel.jsx
git commit -m "feat: update MobileCarousel product renderer for Pokemon card fields"
```

---

## Task 10: Update GalleryCarousel

**Files:**
- Modify: `src/components/GalleryCarousel.jsx`

- [ ] **Step 1: Replace GalleryCarousel.jsx with the following**

```jsx
// src/components/GalleryCarousel.jsx
import React, { useRef, useState, useEffect, useMemo, useContext } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useCursor, Image, Environment, PresentationControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import MobileCarousel from './MobileCarousel';
import { useMobileDetector } from '../hooks/useMobileDetector';
import { ThemeContext } from '../contexts/ThemeContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

function ImageFrame({ url, index, setFocused, isFocused, totalImages, theme, featuredIndex, userInteracted, centralPosition, ...props }) {
  const image = useRef();
  const [hovered, setHovered] = useState(false);
  const { viewport, camera } = useThree();
  useCursor(hovered);
  const isDark = theme === 'dark';

  const baseScale = 2.5;
  const scaleFactor = useMemo(() => Math.min(viewport.width, viewport.height) / 10, [viewport]);
  const originalPosition = useMemo(() => new THREE.Vector3(...props.position), [props.position]);
  const isFeatured = featuredIndex === index;
  const [normalizedDist, setNormalizedDist] = useState(1);

  useFrame((state) => {
    if (!image.current) return;
    const lookPos = new THREE.Vector3();
    camera.getWorldPosition(lookPos);
    image.current.lookAt(lookPos);

    const worldPos = new THREE.Vector3();
    image.current.getWorldPosition(worldPos);
    const distToCenter = worldPos.distanceTo(centralPosition);
    setNormalizedDist(Math.min(distToCenter / (viewport.width * 0.5), 1));

    const floatSpeed = 0.5 + (index / Math.max(totalImages, 1)) * 0.5;
    const floatHeight = 0.05 + (index % 3) * 0.02;
    const floatY = Math.sin(state.clock.elapsedTime * floatSpeed) * floatHeight;

    if (isFocused) {
      image.current.scale.x = THREE.MathUtils.lerp(image.current.scale.x, baseScale * scaleFactor * 1.9, 0.08);
      image.current.scale.y = THREE.MathUtils.lerp(image.current.scale.y, baseScale * scaleFactor * 1.9, 0.08);
      const toCamera = new THREE.Vector3(3, 3, 3);
      const targetPosition = originalPosition.clone().add(toCamera);
      image.current.position.x = THREE.MathUtils.lerp(image.current.position.x, targetPosition.x, 0.08);
      image.current.position.y = THREE.MathUtils.lerp(image.current.position.y, targetPosition.y + floatY * 0.3, 0.08);
      image.current.position.z = THREE.MathUtils.lerp(image.current.position.z, targetPosition.z, 0.08);
      image.current.material.color.lerp(new THREE.Color(1, 1, 1), 0.1);
    } else if (isFeatured && !userInteracted) {
      image.current.scale.x = THREE.MathUtils.lerp(image.current.scale.x, baseScale * scaleFactor * 1.5, 0.05);
      image.current.scale.y = THREE.MathUtils.lerp(image.current.scale.y, baseScale * scaleFactor * 1.5, 0.05);
      image.current.position.x = THREE.MathUtils.lerp(image.current.position.x, originalPosition.x, 0.05);
      image.current.position.y = THREE.MathUtils.lerp(image.current.position.y, originalPosition.y + floatY * 1.5, 0.05);
      image.current.position.z = THREE.MathUtils.lerp(image.current.position.z, originalPosition.z, 0.05);
      image.current.material.color.lerp(new THREE.Color(1, 1, 1), 0.1);
    } else if (hovered) {
      const targetScale = baseScale * scaleFactor * 1.15;
      image.current.scale.x = THREE.MathUtils.lerp(image.current.scale.x, targetScale, 0.06);
      image.current.scale.y = THREE.MathUtils.lerp(image.current.scale.y, targetScale, 0.06);
      image.current.position.x = THREE.MathUtils.lerp(image.current.position.x, originalPosition.x, 0.06);
      image.current.position.y = THREE.MathUtils.lerp(image.current.position.y, originalPosition.y + floatY, 0.06);
      image.current.position.z = THREE.MathUtils.lerp(image.current.position.z, originalPosition.z, 0.06);
      image.current.material.color.lerp(new THREE.Color(1, 1, 1), 0.1);
    } else {
      const targetScale = baseScale * scaleFactor;
      image.current.scale.x = THREE.MathUtils.lerp(image.current.scale.x, targetScale, 0.06);
      image.current.scale.y = THREE.MathUtils.lerp(image.current.scale.y, targetScale, 0.06);
      image.current.position.x = THREE.MathUtils.lerp(image.current.position.x, originalPosition.x, 0.06);
      image.current.position.y = THREE.MathUtils.lerp(image.current.position.y, originalPosition.y + floatY, 0.06);
      image.current.position.z = THREE.MathUtils.lerp(image.current.position.z, originalPosition.z, 0.06);
      const baseColor = isDark ? 0.85 : 0.95;
      const brightness = baseColor * (1 - normalizedDist * 0.3);
      image.current.material.color.lerp(new THREE.Color(brightness, brightness, brightness), 0.1);
    }
  });

  return (
    <Image
      ref={image}
      {...props}
      url={url}
      scale={[baseScale * scaleFactor, baseScale * scaleFactor * 1.4, 1]}
      transparent={true}
      onClick={(e) => { e.stopPropagation(); setFocused(isFocused ? null : index); }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    />
  );
}

function Gallery({ images, setCurrentImage, theme }) {
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const [rotationPaused, setRotationPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [frontPositionIndex, setFrontPositionIndex] = useState(0);
  const group = useRef();
  const elapsedTimeRef = useRef(0);
  const lastUpdateTimeRef = useRef(0);
  const imagePositions = useRef([]);
  const { viewport } = useThree();

  const centralPosition = useMemo(() => new THREE.Vector3(0, 0, viewport.width * 0.25), [viewport]);
  const radius = useMemo(() => Math.min(viewport.width, viewport.height) * 0.45, [viewport]);
  const theta = useMemo(() => (2 * Math.PI) / Math.max(images.length, 1), [images.length]);
  const featureDuration = 5;

  useEffect(() => {
    if (focusedIndex !== null) {
      setCurrentImage(images[focusedIndex]);
      setUserInteracted(true);
      setRotationPaused(true);
    } else if (featuredIndex !== null && !userInteracted) {
      setCurrentImage(images[featuredIndex] || null);
    } else {
      setCurrentImage(null);
    }
  }, [focusedIndex, featuredIndex, userInteracted, images, setCurrentImage]);

  useEffect(() => {
    if (focusedIndex === null) {
      const timer = setTimeout(() => { setUserInteracted(false); setRotationPaused(false); }, 2000);
      return () => clearTimeout(timer);
    }
  }, [focusedIndex]);

  useFrame((state, delta) => {
    elapsedTimeRef.current += delta;
    if (!group.current || images.length === 0) return;

    if (imagePositions.current.length !== images.length) {
      imagePositions.current = images.map((_, i) => {
        const angle = i * theta;
        return new THREE.Vector3(radius * Math.sin(angle), 0, radius * Math.cos(angle));
      });
    }

    if (rotationPaused) {
      if (focusedIndex !== null) {
        const targetRotation = -focusedIndex * theta;
        const currentRotation = group.current.rotation.y;
        let diff = targetRotation - currentRotation;
        if (diff > Math.PI) diff -= 2 * Math.PI;
        if (diff < -Math.PI) diff += 2 * Math.PI;
        group.current.rotation.y += diff * 0.05;
      }
    } else {
      if (!isTransitioning) {
        group.current.rotation.y -= delta * 0.15;
        const currentRotation = group.current.rotation.y;
        const normalizedRotation = ((currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const rotationIndex = Math.round(normalizedRotation / theta) % images.length;
        const frontIndex = (images.length - rotationIndex) % images.length;
        if (frontIndex !== frontPositionIndex) {
          setFrontPositionIndex(frontIndex);
          if (!isTransitioning && elapsedTimeRef.current - lastUpdateTimeRef.current > featureDuration) {
            setIsTransitioning(true);
            setFeaturedIndex(frontIndex);
            setTimeout(() => {
              setIsTransitioning(false);
              lastUpdateTimeRef.current = elapsedTimeRef.current;
            }, 300);
          }
        }
      }
    }
  });

  return (
    <group ref={group} position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
      {images.map((url, i) => (
        <ImageFrame
          key={i}
          url={url}
          index={i}
          totalImages={images.length}
          position={[radius * Math.sin(i * theta), 0, radius * Math.cos(i * theta)]}
          setFocused={setFocusedIndex}
          isFocused={focusedIndex === i}
          featuredIndex={featuredIndex}
          userInteracted={userInteracted}
          centralPosition={centralPosition}
          theme={theme}
        />
      ))}
    </group>
  );
}

function GalleryCarousel() {
  const [cards] = useLocalStorage('affirm_cards', []);
  const images = useMemo(() => cards.map(c => c.image), [cards]);

  const [currentImage, setCurrentImage] = useState(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobile = useMobileDetector();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isMobile) {
    return <MobileCarousel items={images} type="gallery" />;
  }

  return (
    <div className="relative">
      <div className="carousel-container" style={{ height: '70vh' }}>
        {!isLoaded ? (
          <div className={`flex items-center justify-center h-full ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
            <div className="text-center">
              <div className={`inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDark ? 'border-dark-accent' : 'border-light-accent'}`}></div>
              <p className={`mt-4 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Loading Gallery...</p>
            </div>
          </div>
        ) : images.length === 0 ? (
          <div className={`flex items-center justify-center h-full ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
            <p className={`${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>No cards in inventory yet.</p>
          </div>
        ) : (
          <Canvas
            camera={{ position: [0, 0, 20], fov: 45 }}
            dpr={window.devicePixelRatio > 1 ? 1.5 : 1}
            gl={{ powerPreference: 'default', antialias: true, alpha: false, stencil: false, depth: true, failIfMajorPerformanceCaveat: false }}
            frameloop="always"
          >
            <color attach="background" args={[isDark ? '#121212' : '#F2F0EA']} />
            <fog attach="fog" args={[isDark ? '#121212' : '#F2F0EA', 10, 40]} />
            <ambientLight intensity={isDark ? 0.7 : 0.9} />
            <spotLight position={[0, 10, 0]} intensity={isDark ? 1 : 1.2} angle={0.3} penumbra={1} castShadow />
            <PresentationControls
              global zoom={0.8} rotation={[0, 0, 0]}
              polar={[-Math.PI / 3, Math.PI / 3]}
              azimuth={[-Math.PI / 1.5, Math.PI / 1.5]}
              config={{ mass: 1, tension: 170, friction: 26 }}
              snap={false}
              enabled={currentImage === null}
            >
              <Gallery images={images} setCurrentImage={setCurrentImage} theme={theme} />
            </PresentationControls>
            <ContactShadows position={[0, 4, 0]} opacity={0.1} scale={200} blur={20} far={200} />
            <Environment preset={isDark ? 'city' : 'sunset'} />
          </Canvas>
        )}
      </div>

      <motion.div
        className="absolute inset-x-0 bottom-4 px-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className={`${isDark ? 'text-dark-muted' : 'text-light-muted'} mb-2`}>
          {currentImage ? 'Click again to return' : 'Click on a card to focus'}
        </p>
        {currentImage && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`btn ${isDark ? 'btn-primary' : 'bg-light-highlight text-white'} px-6 py-2 rounded-full`}
            onClick={() => setShowFullscreen(true)}
          >
            Open Full Size
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {showFullscreen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
            onClick={() => setShowFullscreen(false)}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              src={currentImage} alt="Full size"
              className="max-w-full max-h-full p-4 object-contain"
            />
            <button
              className="absolute top-6 right-6 text-white text-xl bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-80 transition-all"
              onClick={(e) => { e.stopPropagation(); setShowFullscreen(false); }}
            >✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GalleryCarousel;
```

- [ ] **Step 2: Verify**

Gallery section loads. Empty state shown when no inventory. No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/GalleryCarousel.jsx
git commit -m "feat: wire GalleryCarousel to inventory cards from localStorage"
```

---

## Task 11: InventoryTab

**Files:**
- Create: `src/components/dashboard/InventoryTab.jsx`

- [ ] **Step 1: Create the component**

```jsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/InventoryTab.jsx
git commit -m "feat: add InventoryTab with pokemontcg.io API search and card management"
```

---

## Task 12: OrdersTab

**Files:**
- Create: `src/components/dashboard/OrdersTab.jsx`

- [ ] **Step 1: Create the component**

```jsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/OrdersTab.jsx
git commit -m "feat: add OrdersTab with log order form and inline status update"
```

---

## Task 13: AdminDashboard + CustomerDashboard

**Files:**
- Create: `src/components/dashboard/AdminDashboard.jsx`
- Create: `src/components/dashboard/CustomerDashboard.jsx`

- [ ] **Step 1: Create AdminDashboard**

```jsx
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
```

- [ ] **Step 2: Create CustomerDashboard**

```jsx
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
```

- [ ] **Step 3: Verify full flow**

With dev server running:
1. Click Dashboard → select Admin → Inventory tab shows search bar and empty inventory
2. Search "Pikachu" → results appear after 500ms → click a result → form appears with card info
3. Fill in price, condition, stock → click "Add to Inventory" → card appears in inventory list
4. Switch to Gallery section → card image appears in 3D carousel
5. Switch to Shop section → card appears in 3D carousel
6. Test filters: Set dropdown shows card's set, filtering by it shows the card, filtering by a non-matching set shows empty state
7. Logout → navbar shows "Dashboard" again
8. Login as Customer → "My Orders" page shows empty state
9. Login as Admin → Orders tab → Log Order form → select customer and card → save → order appears
10. Logout, login as Customer → order appears with status badge

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/AdminDashboard.jsx src/components/dashboard/CustomerDashboard.jsx
git commit -m "feat: add AdminDashboard (tabs) and CustomerDashboard (order history)"
```

---

## Summary

| Task | Commits |
|---|---|
| 1: useLocalStorage | `feat: add useLocalStorage hook` |
| 2: AuthContext | `feat: add AuthContext with hardcoded accounts` |
| 3: usePokemonTCG | `feat: add usePokemonTCG search hook with debounce` |
| 4: AuthModal | `feat: add AuthModal role-selector` |
| 5: App.jsx | `feat: add AuthProvider, dashboard section routing, auth modal trigger to App` |
| 6: Navbar | `feat: add Dashboard button and auth state to Navbar` |
| 7: CardFilters | `feat: add CardFilters component with search and set/rarity/type dropdowns` |
| 8: ProductCarousel | `feat: wire ProductCarousel to localStorage inventory with filters and Pokemon card detail panel` |
| 9: MobileCarousel | `feat: update MobileCarousel product renderer for Pokemon card fields` |
| 10: GalleryCarousel | `feat: wire GalleryCarousel to inventory cards from localStorage` |
| 11: InventoryTab | `feat: add InventoryTab with pokemontcg.io API search and card management` |
| 12: OrdersTab | `feat: add OrdersTab with log order form and inline status update` |
| 13: Admin + Customer Dashboards | `feat: add AdminDashboard (tabs) and CustomerDashboard (order history)` |
