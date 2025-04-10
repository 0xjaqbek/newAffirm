// src/components/Footer.jsx
import React from 'react';
import { FiTwitter, FiInstagram, FiGithub } from 'react-icons/fi';

function Footer() {
  const handleCopyAddress = () => {
    const address = "2ep3FcATLGK2TUmpFQrChbgNa5wxc6HF3CHaaPmSvCYm";
    navigator.clipboard.writeText(address);
    alert("Copied to clipboard!");
  };

  return (
    <footer className="bg-surface py-8 mt-20">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="logo text-2xl mb-2">aFFiRM.</div>
            <p className="text-sm text-muted max-w-xs">
              Dreamed in Athens, Designed in Warsaw, Alchemized in Digital Realms
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <div className="mb-4 flex space-x-4">
              <a href="https://x.com/affirmai" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                <FiTwitter size={20} />
              </a>
              <a href="https://www.instagram.com/affirm.official/" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                <FiInstagram size={20} />
              </a>
              <a href="https://github.com/0xjaqbek/affirm" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                <FiGithub size={20} />
              </a>
            </div>
            
            <div className="flex items-center space-x-2 bg-surface/50 rounded-md px-3 py-2 border border-muted/30">
              <div className="text-xs text-muted">CA 2ep3FcATLGK2TUmpFQr...aPmSvCYm</div>
              <button 
                className="text-xs text-accent hover:underline"
                onClick={handleCopyAddress}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-muted/20 text-center text-xs text-muted">
          <p>There is no armor. I love you.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;