import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState('hi');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    const saved = localStorage.getItem('mannkibaat_session');
    if (saved) return saved;
    const newSession = crypto.randomUUID();
    localStorage.setItem('mannkibaat_session', newSession);
    return newSession;
  });

  // Sync session ID to storage whenever it changes
  useEffect(() => {
    localStorage.setItem('mannkibaat_session', currentSessionId);
  }, [currentSessionId]);

  // Load user from local storage
  useEffect(() => {
    const storedUser = localStorage.getItem('mannkibaat_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setLanguage(parsed.preferredLanguage || 'hi');
    }
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
    setLanguage(userData.preferredLanguage);
    localStorage.setItem('mannkibaat_user', JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('mannkibaat_user');
    localStorage.removeItem('mannkibaat_session');
  };

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

  return (
    <AppContext.Provider value={{ user, language, setLanguage, isLoading, setIsLoading, loginUser, logoutUser, API_BASE, currentSessionId, setCurrentSessionId }}>
      {children}
    </AppContext.Provider>
  );
};
