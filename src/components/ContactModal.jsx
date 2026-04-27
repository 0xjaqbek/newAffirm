// src/components/ContactModal.jsx
import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../contexts/ThemeContext';

function ContactModal({ card, onClose }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Hi, I'm interested in buying ${card?.name || 'this card'}. Please let me know if it's available.`,
  });
  const [submitted, setSubmitted] = useState(false);

  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none ${
    isDark
      ? 'bg-dark-background border-dark-muted text-dark-text focus:border-dark-accent'
      : 'bg-white border-light-border text-light-text focus:border-light-highlight'
  }`;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className={`w-full max-w-md rounded-xl shadow-2xl overflow-hidden ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-dark-muted/30' : 'border-light-border/50'}`}>
          <div className="flex items-center gap-3">
            {card?.image && (
              <img src={card.image} alt={card.name} className="h-10 w-auto rounded shadow" />
            )}
            <div>
              <h2 className={`font-display font-bold text-lg ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                Contact to Buy
              </h2>
              {card && (
                <p className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                  {card.name} — {card.condition} — ${card.price}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className={`text-xl leading-none px-2 py-1 rounded hover:opacity-70 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6"
              >
                <div className="text-4xl mb-3">✉️</div>
                <h3 className={`font-display font-bold text-lg mb-1 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                  Message sent!
                </h3>
                <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                  We'll get back to you as soon as possible.
                </p>
                <button
                  onClick={onClose}
                  className={`mt-5 px-6 py-2 rounded-lg text-sm font-medium ${
                    isDark ? 'bg-dark-accent text-dark-text' : 'bg-light-highlight text-white'
                  }`}
                >
                  Close
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs mb-1 font-medium ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 font-medium ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="Optional"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-xs mb-1 font-medium ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 font-medium ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                    Message
                  </label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      isDark
                        ? 'bg-dark-accent text-dark-text hover:bg-dark-accent/80'
                        : 'bg-light-highlight text-white hover:bg-light-highlight/80'
                    }`}
                  >
                    Send Inquiry
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      isDark ? 'text-dark-muted hover:text-dark-text' : 'text-light-muted hover:text-light-text'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default ContactModal;
