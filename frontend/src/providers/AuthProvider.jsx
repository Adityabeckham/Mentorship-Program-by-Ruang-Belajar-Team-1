import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import API, { clearAuthToken, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

const getSavedUser = () => {
  const savedUser = localStorage.getItem('user');
  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser);
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getSavedUser);

  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setAuthToken(savedToken);
        try {
          const response = await API.get('/auth/me');
          setUser(response.data.data);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

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

  const login = (tokenOrPayload, userParam) => {
    let nextToken = '';
    let nextUser = null;

    if (typeof tokenOrPayload === 'object' && tokenOrPayload !== null) {
      nextToken = tokenOrPayload.token || '';
      nextUser = tokenOrPayload.user || null;
    } else {
      nextToken = tokenOrPayload || '';
      nextUser = userParam || null;
    }

    setToken(nextToken);
    setUser(nextUser);
    if (nextToken) {
      setAuthToken(nextToken);
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    clearAuthToken();
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
