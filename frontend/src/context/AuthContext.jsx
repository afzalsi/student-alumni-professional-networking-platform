import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';
import { userApi } from '../services/userApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.data) {
            setUser(res.data.user);
            setProfile(res.data.profile);
            setProfileCompletion(res.data.profileCompletion || 0);
          }
        } catch (error) {
          console.error('Session restoration failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setProfile(res.data.profile);
      setProfileCompletion(res.data.profileCompletion || 0);
      return res.data;
    }
  };

  const register = async (formData) => {
    const res = await authApi.register(formData);
    if (res.success && res.data) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setProfile(res.data.profile);
      setProfileCompletion(res.data.profileCompletion || 0);
      return res.data;
    }
  };

  const updateProfileData = async (data) => {
    const res = await userApi.updateProfile(data);
    if (res.success && res.data) {
      setUser(res.data.user);
      setProfile(res.data.profile);
      setProfileCompletion(res.data.profileCompletion || 0);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setProfile(null);
    setProfileCompletion(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        profileCompletion,
        token,
        loading,
        login,
        register,
        logout,
        updateProfileData,
        isAuthenticated: Boolean(token && user)
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
