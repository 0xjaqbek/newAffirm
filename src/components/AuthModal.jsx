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
