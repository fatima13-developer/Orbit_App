import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { getMe, loginUser, registerUser, demoLoginUser, logoutUser } from '../api/auth.api.js';
import { setAccessToken, getAccessToken } from '../api/axios.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Login Modal State
  const [loginModal, setLoginModal] = useState({
    isOpen: false,
    message: '',
    actionTitle: ''
  });

  const pendingActionRef = useRef(null);

  const openLoginModal = useCallback((message = '', callback = null, actionTitle = 'Sign in to Orbit') => {
    pendingActionRef.current = callback;
    setLoginModal({
      isOpen: true,
      message,
      actionTitle
    });
  }, []);

  const closeLoginModal = useCallback((executePending = false) => {
    setLoginModal({
      isOpen: false,
      message: '',
      actionTitle: ''
    });

    if (executePending && typeof pendingActionRef.current === 'function') {
      try {
        pendingActionRef.current();
      } catch (err) {
        console.error('Error executing pending action:', err);
      }
    }
    pendingActionRef.current = null;
  }, []);

  // Reusable requireAuth guard
  const requireAuth = useCallback((actionDescription = 'continue', callback = null) => {
    if (user) {
      if (typeof callback === 'function') {
        callback();
      }
      return true;
    }

    const message = actionDescription.startsWith('to ')
      ? `Sign in ${actionDescription}`
      : `Sign in to ${actionDescription}`;

    openLoginModal(message, callback, 'Action Requires Sign In');
    return false;
  }, [user, openLoginModal]);

  // Initial silent auth check (Never redirects to /login)
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const res = await getMe();
          setUser(res.data.user);
        } catch (err) {
          // Token invalid/expired - try silent refresh
          try {
            const { data } = await axios.post(
              `${API_BASE_URL}/api/v1/auth/refresh-token`,
              {},
              { withCredentials: true }
            );
            setAccessToken(data.data.accessToken);
            setUser(data.data.user);
          } catch (refreshErr) {
            setAccessToken(null);
            setUser(null);
          }
        }
      } else {
        // Try silent refresh in case httpOnly cookie is present from previous session
        try {
          const { data } = await axios.post(
            `${API_BASE_URL}/api/v1/auth/refresh-token`,
            {},
            { withCredentials: true }
          );
          setAccessToken(data.data.accessToken);
          setUser(data.data.user);
        } catch (err) {
          // Normal guest state
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();

    const handleRequireAuthEvent = (event) => {
      openLoginModal(event.detail?.message || 'Please sign in to continue');
    };

    window.addEventListener('orbit:require-auth', handleRequireAuthEvent);
    return () => window.removeEventListener('orbit:require-auth', handleRequireAuthEvent);
  }, [openLoginModal]);

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    const { user: loggedInUser, accessToken } = res.data;
    setAccessToken(accessToken);
    setUser(loggedInUser);
    showToast(`Welcome back, ${loggedInUser.name}!`);

    // Execute pending action if any
    closeLoginModal(true);
    return loggedInUser;
  };

  const register = async (formData) => {
    const res = await registerUser(formData);
    const { user: registeredUser, accessToken } = res.data;
    setAccessToken(accessToken);
    setUser(registeredUser);
    showToast(`Welcome to Orbit, ${registeredUser.name}!`);

    closeLoginModal(true);
    return registeredUser;
  };

  const demoLogin = async () => {
    const res = await demoLoginUser();
    const { user: demoUser, accessToken } = res.data;
    setAccessToken(accessToken);
    setUser(demoUser);
    showToast(`Logged in as demo user: ${demoUser.name}`);

    closeLoginModal(true);
    return demoUser;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      // Ignore logout errors
    } finally {
      setAccessToken(null);
      setUser(null);
      showToast('Logged out successfully');
    }
  };

  const updateAuthUser = (updatedData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        demoLogin,
        logout,
        updateAuthUser,
        requireAuth,
        openLoginModal,
        closeLoginModal,
        loginModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useRequireAuth = () => {
  const { requireAuth } = useAuth();
  return requireAuth;
};
