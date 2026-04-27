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
import { SEED_CARDS } from './data/seedCards';
import { SEED_ORDERS } from './data/seedOrders';

// Seed demo data into localStorage if empty
const existingCards = localStorage.getItem('affirm_cards');
if (!existingCards || JSON.parse(existingCards).length === 0) {
  localStorage.setItem('affirm_cards', JSON.stringify(SEED_CARDS));
}
const existingOrders = localStorage.getItem('affirm_orders');
if (!existingOrders || JSON.parse(existingOrders).length === 0) {
  localStorage.setItem('affirm_orders', JSON.stringify(SEED_ORDERS));
}

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
