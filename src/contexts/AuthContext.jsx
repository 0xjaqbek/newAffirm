// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';

export const ACCOUNTS = [
  { id: 'admin',    role: 'admin', name: 'Admin' },
  { id: 'customer', role: 'user',  name: 'Customer' },
];

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const login = (accountId) => {
    const account = ACCOUNTS.find(a => a.id === accountId);
    if (account) setCurrentUser(account);
  };

  const logout = () => setCurrentUser(null);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, ACCOUNTS }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
