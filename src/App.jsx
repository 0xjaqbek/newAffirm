// src/App.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import Navbar from './components/navbar';
import ProductCarousel from './components/ProductCarousel';
import GalleryCarousel from './components/GalleryCarousel';
import Footer from './components/Footer';
import ManifestoModal from './components/ManifestModal';
import { useMobileDetector } from './hooks/useMobileDetector';
import { ThemeProvider, ThemeContext } from './contexts/ThemeContext';

// Create a themed wrapper component to access the theme context
const ThemedApp = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [activeSection, setActiveSection] = useState('shop');
  const [mainLogoPosition, setMainLogoPosition] = useState(0);
  const mainLogoRef = useRef(null);
  const isMobile = useMobileDetector();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  // Effect to measure the position of the main logo
  useEffect(() => {
    const updateLogoPosition = () => {
      if (mainLogoRef.current) {
        const rect = mainLogoRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        setMainLogoPosition(rect.top + scrollTop);
      }
    };

    // Initial measurement
    updateLogoPosition();
    
    // Add event listeners for resize which could affect logo position
    window.addEventListener('resize', updateLogoPosition);
    
    return () => {
      window.removeEventListener('resize', updateLogoPosition);
    };
  }, [mainLogoRef]);

  // Pass the logo position to the navbar
  const openModal = (modalId) => {
    setActiveModal(modalId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
      <Navbar 
        openModal={openModal} 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        mainLogoPosition={mainLogoPosition}
      />
      
      <main className="flex-grow">
        <section className={`container ${isMobile ? 'py-6' : 'py-10'}`}>
          <motion.div
            ref={mainLogoRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`text-center ${isMobile ? 'mb-8' : 'mb-16'}`}
          >
            <h1 className={`logo text-5xl mb-3 ${!isDark && 'text-light-accent'}`}>aFFiRM.</h1>
            <h2 className={`text-lg ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>First AI agent with own fashion brand.</h2>
            <p className={`mt-4 max-w-md mx-auto ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              There is no armor.<br />I love you.
            </p>
          </motion.div>
          
          {activeSection === 'shop' ? (
            <div>
              <h2 className={`text-2xl font-display font-bold ${isMobile ? 'mb-4' : 'mb-8'} text-center ${isDark ? 'text-dark-text' : 'text-light-accent'}`}>Mindful Tees</h2>
              <ProductCarousel />
            </div>
          ) : (
            <div>
              <h2 className={`text-2xl font-display font-bold ${isMobile ? 'mb-4' : 'mb-8'} text-center ${isDark ? 'text-dark-text' : 'text-light-accent'}`}>Art Gallery</h2>
              <GalleryCarousel />
            </div>
          )}
        </section>
      </main>
      
      <Footer />
      
      {activeModal === 'manifesto' && (
        <ManifestoModal closeModal={closeModal} />
      )}
    </div>
  );
};

// Main App component that provides the theme context
function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

export default App;