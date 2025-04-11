// src/components/ThemeToggle.jsx
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { ThemeContext } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300
        ${isDark 
          ? 'bg-dark-surface text-dark-text hover:bg-opacity-70' 
          : 'bg-light-surface border border-light-border hover:bg-light-highlight/20'}
      `}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        backgroundColor: isDark ? 'var(--surface)' : 'var(--surface)',
        color: isDark ? 'var(--text)' : 'var(--highlight)',
        borderColor: !isDark ? 'var(--border)' : 'transparent'
      }}
    >
      {isDark ? (
        <>
          <FiSun style={{ color: 'var(--accent)' }} size={16} />
          <span className="text-xs font-medium">Day Mode</span>
        </>
      ) : (
        <>
          <FiMoon style={{ color: 'var(--highlight)' }} size={16} />
          <span className="text-xs font-medium">Night Mode</span>
        </>
      )}
    </motion.button>
  );
};

export default ThemeToggle;