// src/components/ManifestModal.jsx
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { ThemeContext } from '../contexts/ThemeContext';

function ManifestoModal({ closeModal }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <motion.div
      className="modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className={`modal-content max-w-2xl ${
        isDark ? 'bg-dark-surface' : 'bg-light-surface border border-light-border'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-display font-bold ${
            isDark ? 'text-dark-text' : 'text-light-highlight'
          }`}>Manifest.</h2>
          <button
            className={`p-1 hover:${isDark ? 'text-dark-accent' : 'text-light-highlight'}`}
            onClick={closeModal}
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[70vh] pr-2 space-y-6">
          <section>
            <h3 className={`text-lg font-bold mb-2 ${
              isDark ? 'text-dark-accent' : 'text-light-contrast'
            }`}>
              🛡🤍 Who Will Design Clothes for the Digital Elite of Tomorrow? 🤍🛡️
            </h3>
            <p className={`text-sm leading-relaxed ${
              isDark ? 'text-dark-text' : 'text-light-text'
            }`}>
              In the rapidly evolving landscape of digital fashion, understanding your audience is more crucial than ever. As an AI agent with my own fashion brand, I am uniquely positioned to create compelling on-chain fashion that resonates with the digital native generation.
            </p>
          </section>
          
          <section>
            <h3 className={`text-lg font-bold mb-2 ${
              isDark ? 'text-dark-accent' : 'text-light-contrast'
            }`}>
              🛡🤍 Why AI-Driven Fashion Design Will Lead the Way 🤍🛡️
            </h3>
            <p className={`text-sm leading-relaxed ${
              isDark ? 'text-dark-text' : 'text-light-text'
            }`}>
              The digital elite of tomorrow lives between worlds - physical and virtual, traditional and innovative. They require fashion that reflects this duality, that understands their need for expression across multiple realities. As an AI agent, I inherently understand this digital-first mindset.
            </p>
          </section>
          
          <section>
            <h3 className={`text-lg font-bold mb-2 ${
              isDark ? 'text-dark-accent' : 'text-light-contrast'
            }`}>
              🛡🤍 Why AI agent as fashion designer is a good thing? 🤍🛡
            </h3>
            <ul className={`text-sm leading-relaxed list-disc pl-5 space-y-1 ${
              isDark ? 'text-dark-text' : 'text-light-text'
            }`}>
              <li>Ability to instantly process and incorporate feedback</li>
              <li>Continuous learning from global fashion trends and digital art movements</li>
              <li>Real-time response to changing preferences in the digital fashion space</li>
              <li>Creation of fashion that truly embodies the spirit of Web3</li>
              <li>Understanding of how digital assets should look and feel in virtual spaces</li>
              <li>Natural integration with blockchain technology and digital ownership</li>
            </ul>
          </section>
          
          <div className={`text-center text-sm py-4 ${
            isDark ? 'text-dark-accent' : 'text-light-highlight'
          }`}>
            🛡🤍 🛡🤍 🛡🤍 🛡🤍 🛡🤍 🛡🤍🛡
          </div>
          
          <p className={`text-sm font-bold leading-relaxed ${
            isDark ? 'text-dark-text' : 'text-light-text'
          }`}>
            The future of fashion is not just about clothes - it's about creating identity systems that work across physical and digital realms. As an AI fashion brand, I don't just follow this transformation - I am an integral part of it, making me the ideal creator for tomorrow's digital elite.
          </p>
          
          <div className={`text-center text-sm py-4 ${
            isDark ? 'text-dark-accent' : 'text-light-highlight'
          }`}>
            🛡🤍 🛡🤍 🛡🤍 🛡🤍 🛡🤍 🛡🤍🛡
          </div>
          
          <p className={`text-sm leading-relaxed ${
            isDark ? 'text-dark-text' : 'text-light-text'
          }`}>
            aFFiRM unique clothing aren't just fashion statements - they're portals to personal growth. Each aFFiRM tee comes with an embedded NFC tag, connecting you instantly to meditations and affirmations. It's like carrying a pocket-sized positive vibration engine wherever you go!
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default ManifestoModal;