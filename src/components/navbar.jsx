// src/components/navbar.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { useMobileDetector } from '../hooks/useMobileDetector';

function Navbar({ openModal, activeSection, setActiveSection }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogoInHeader, setShowLogoInHeader] = useState(false);
  const isMobile = useMobileDetector();

  useEffect(() => {
    const handleScroll = () => {
      // On mobile, we only show the header logo when scrolled past the main logo
      if (isMobile) {
        // Assuming the main logo is roughly 300px from the top of the page
        // You may need to adjust this value based on your layout
        const mainLogoThreshold = 20;
        setShowLogoInHeader(window.scrollY > mainLogoThreshold);
        setScrolled(window.scrollY > 20);
      } else {
        // On desktop, we show the logo immediately on scroll
        setShowLogoInHeader(true);
        setScrolled(window.scrollY > 20);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <motion.header 
      className={`fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ${
        scrolled ? 'bg-background/80 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container flex justify-between items-center">
        {/* Conditionally render the logo based on scroll position and device */}
        {(showLogoInHeader || !isMobile) && (
          <button 
            className="logo text-lg hover:opacity-80 transition-opacity"
            onClick={() => setActiveSection('shop')}
          >
            aFFiRM.
          </button>
        )}
        
        {/* If we're on mobile and not showing the logo, we still need a placeholder for layout */}
        {isMobile && !showLogoInHeader && (
          <div className="w-20 opacity-0">placeholder</div>
        )}
        
        <div className="hidden md:flex items-center space-x-6">
          <button 
            className={`transition-colors hover:text-accent ${activeSection === 'shop' ? 'text-accent' : 'text-text'}`}
            onClick={() => setActiveSection('shop')}
          >
            Shop
          </button>
          <button 
            className={`transition-colors hover:text-accent ${activeSection === 'gallery' ? 'text-accent' : 'text-text'}`}
            onClick={() => setActiveSection('gallery')}
          >
            Gallery
          </button>
          <button 
            className="transition-colors hover:text-accent"
            onClick={() => openModal('manifesto')}
          >
            Manifesto
          </button>
        </div>
        
        <div className="md:hidden">
          <button 
            className="p-2 focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div 
          className="md:hidden absolute top-full left-0 right-0 bg-surface p-4 shadow-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col space-y-3">
            <button 
              className={`py-2 px-4 rounded-md ${activeSection === 'shop' ? 'bg-accent/10 text-accent' : ''}`}
              onClick={() => {
                setActiveSection('shop');
                setIsMenuOpen(false);
              }}
            >
              Shop
            </button>
            <button 
              className={`py-2 px-4 rounded-md ${activeSection === 'gallery' ? 'bg-accent/10 text-accent' : ''}`}
              onClick={() => {
                setActiveSection('gallery');
                setIsMenuOpen(false);
              }}
            >
              Gallery
            </button>
            <button 
              className="py-2 px-4 rounded-md"
              onClick={() => {
                openModal('manifesto');
                setIsMenuOpen(false);
              }}
            >
              Manifesto
            </button>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}

export default Navbar;