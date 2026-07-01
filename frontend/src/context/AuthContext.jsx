import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize and check token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await authAPI.me();
          setUser(profile);
        } catch (err) {
          console.error("Auth validation failed", err);
          // Token might be expired or invalid
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await authAPI.login(email, password);
      localStorage.setItem('token', data.access_token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.detail || "Invalid email or password";
      setError(msg);
      throw new Error(msg);
    }
  };

  const signup = async (name, email, password) => {
    setError(null);
    try {
      await authAPI.signup(name, email, password);
    } catch (err) {
      const msg = err.response?.data?.detail || "Signup failed. Email may already exist.";
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const updatedUser = await authAPI.updateProfile(profileData);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to update profile";
      setError(msg);
      throw new Error(msg);
    }
  };

  const deleteAccount = async () => {
    setError(null);
    try {
      await authAPI.deleteAccount();
      logout();
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to delete account";
      setError(msg);
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      signup,
      logout,
      updateProfile,
      deleteAccount,
      isAuthenticated: !!user
    }}>
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
