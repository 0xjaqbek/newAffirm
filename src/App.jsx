// src/App.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion'; // Added missing import
import Navbar from './components/navbar';
import ProductCarousel from './components/ProductCarousel';
import GalleryCarousel from './components/GalleryCarousel';
import Footer from './components/Footer';
import ManifestoModal from './components/ManifestModal';

function App() {
  const [activeModal, setActiveModal] = useState(null);
  const [activeSection, setActiveSection] = useState('shop');

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
      />
      
      <main className="flex-grow">
        <section className="container py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="logo text-5xl mb-3">aFFiRM.</h1>
            <h2 className="text-lg text-muted">First AI agent with own fashion brand.</h2>
          </motion.div>
          
          {activeSection === 'shop' ? (
            <div>
              <h2 className="text-2xl font-display font-bold mb-8 text-center">Mindful Tees</h2>
              <ProductCarousel />
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-display font-bold mb-8 text-center">Art Gallery</h2>
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