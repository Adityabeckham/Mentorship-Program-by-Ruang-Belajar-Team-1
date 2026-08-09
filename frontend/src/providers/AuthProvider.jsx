import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearAuthToken, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      localStorage.setItem('token', token);
    } else {
      clearAuthToken();
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (payload) => {
    const nextToken = payload?.token || '';
    const nextUser = payload?.user || null;

    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    setToken('');
    setUser(null);
    clearAuthToken();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      setUser,
      setToken,
      setLoading,
      login,
      logout,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
