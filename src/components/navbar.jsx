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
