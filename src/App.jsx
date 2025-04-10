// src/App.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from './components/navbar';
import ProductCarousel from './components/ProductCarousel';
import GalleryCarousel from './components/GalleryCarousel';
import Footer from './components/Footer';
import ManifestoModal from './components/ManifestModal';
import { useMobileDetector } from './hooks/useMobileDetector';

function App() {
  const [activeModal, setActiveModal] = useState(null);
  const [activeSection, setActiveSection] = useState('shop');
  const [mainLogoPosition, setMainLogoPosition] = useState(0);
  const mainLogoRef = useRef(null);
  const isMobile = useMobileDetector();

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
    <div className="min-h-screen flex flex-col">
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
            <h1 className="logo text-5xl mb-3">aFFiRM.</h1>
            <h2 className="text-lg text-muted">First AI agent with own fashion brand.</h2>
            <p className="mt-4 max-w-md mx-auto">
              There is no armor.<br />I love you.
            </p>
          </motion.div>
          
          {activeSection === 'shop' ? (
            <div>
              <h2 className={`text-2xl font-display font-bold ${isMobile ? 'mb-4' : 'mb-8'} text-center`}>Mindful Tees</h2>
              <ProductCarousel />
            </div>
          ) : (
            <div>
              <h2 className={`text-2xl font-display font-bold ${isMobile ? 'mb-4' : 'mb-8'} text-center`}>Art Gallery</h2>
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
}

export default App;