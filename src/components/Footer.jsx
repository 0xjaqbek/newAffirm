// src/components/Footer.jsx
import React, { useContext } from 'react';
import { FiTwitter, FiInstagram, FiGithub } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import { ThemeContext } from '../contexts/ThemeContext';

function Footer() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const handleCopyAddress = () => {
    const address = "2ep3FcATLGK2TUmpFQrChbgNa5wxc6HF3CHaaPmSvCYm";
    navigator.clipboard.writeText(address);
    alert("Copied to clipboard!");
  };

  return (
    <footer className={`${isDark ? 'bg-dark-surface' : 'bg-light-surface'} py-8 mt-20 ${!isDark && 'border-t border-light-border'}`}>
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className={`logo text-2xl mb-2 ${!isDark && 'text-light-accent'}`}>aFFiRM.</div>
            <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'} max-w-xs`}>
              Dreamed in Athens, Designed in Warsaw, Alchemized in Digital Realms
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <div className="mb-4 flex space-x-4">
              <a href="https://x.com/affirmai" target="_blank" rel="noopener noreferrer" className={`${isDark ? 'hover:text-dark-accent' : 'hover:text-light-highlight'}`}>
                <FiTwitter size={20} />
              </a>
              <a href="https://www.instagram.com/affirm.official/" target="_blank" rel="noopener noreferrer" className={`${isDark ? 'hover:text-dark-accent' : 'hover:text-light-highlight'}`}>
                <FiInstagram size={20} />
              </a>
              <a href="https://github.com/0xjaqbek/affirm" target="_blank" rel="noopener noreferrer" className={`${isDark ? 'hover:text-dark-accent' : 'hover:text-light-highlight'}`}>
                <FiGithub size={20} />
              </a>
            </div>
            
            {/* Theme Toggle Button */}
            <div className="mt-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
        
        <div className={`mt-8 pt-4 border-t ${isDark ? 'border-dark-muted/20' : 'border-light-border/30'} text-center text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
          <p>There is no armor. I love you.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;