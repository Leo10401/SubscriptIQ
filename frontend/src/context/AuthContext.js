'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

const DEFAULT_DEMO_USERS = {
  Admin: {
    id: 'demo_admin',
    name: 'Ayush Sharma',
    email: 'admin@subscriptiq.io',
    role: 'Admin',
    department: 'Leadership & Ops',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  CSM: {
    id: 'demo_csm',
    name: 'Sarah Connor',
    email: 'sarah@subscriptiq.io',
    role: 'CSM',
    department: 'Customer Success',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  Support: {
    id: 'demo_support',
    name: 'Dave Miller',
    email: 'dave@subscriptiq.io',
    role: 'Support',
    department: 'Technical Support',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  Analyst: {
    id: 'demo_analyst',
    name: 'Maya Patel',
    email: 'maya@subscriptiq.io',
    role: 'Analyst',
    department: 'Revenue Operations',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_DEMO_USERS.Admin);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for saved session
    const savedUser = localStorage.getItem('subscriptiq_user');
    const token = localStorage.getItem('subscriptiq_token');

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(DEFAULT_DEMO_USERS.Admin);
      }
    }

    if (token) {
      api
        .getCurrentUser()
        .then((res) => {
          if (res && res.user) {
            setUser(res.user);
            localStorage.setItem('subscriptiq_user', JSON.stringify(res.user));
          }
        })
        .catch(() => {
          // If backend offline, retain local demo user
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const switchPersona = async (targetRole) => {
    try {
      // Try logging in with demo account on backend
      const targetUser = DEFAULT_DEMO_USERS[targetRole] || DEFAULT_DEMO_USERS.Admin;
      const res = await api.login(targetUser.email, 'password123').catch(() => null);

      if (res && res.token) {
        localStorage.setItem('subscriptiq_token', res.token);
        localStorage.setItem('subscriptiq_user', JSON.stringify(res.user));
        setUser(res.user);
      } else {
        // Fallback local switch
        localStorage.setItem('subscriptiq_user', JSON.stringify(targetUser));
        setUser(targetUser);
      }
    } catch (e) {
      const targetUser = DEFAULT_DEMO_USERS[targetRole] || DEFAULT_DEMO_USERS.Admin;
      setUser(targetUser);
    }
  };

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res && res.token) {
      localStorage.setItem('subscriptiq_token', res.token);
      localStorage.setItem('subscriptiq_user', JSON.stringify(res.user));
      setUser(res.user);
      return res.user;
    }
    throw new Error('Login failed.');
  };

  const logout = () => {
    localStorage.removeItem('subscriptiq_token');
    localStorage.removeItem('subscriptiq_user');
    setUser(null);
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'Guest',
        loading,
        switchPersona,
        login,
        logout,
        hasRole,
        availablePersonas: Object.keys(DEFAULT_DEMO_USERS),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
