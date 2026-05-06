import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { userApi, authApi } from '../services/api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchCurrentUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userApi.getMe();
      if (res.ok && res.data) {
        const userData = { ...res.data };
        if (userData.role === 'instructor') userData.role = 'teacher';
        setUser(userData);
        localStorage.setItem('accessToken', 'session-active');
        localStorage.setItem('userRole', userData.role);
        setError(null);
      } else {
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userRole');
      }
    } catch (e) {
      setUser(null);
      localStorage.removeItem('userRole');
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const res = await authApi.logout();
      console.log('Logout API response:', res);
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');
      sessionStorage.clear();
      console.log('Client-side session cleared');
    }
  }, []);

  useEffect(() => { fetchCurrentUser(); }, [fetchCurrentUser]);

  const value = useMemo(
    () => ({ user, loading, error, logout, fetchCurrentUser }),
    [user, loading, error, logout, fetchCurrentUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);