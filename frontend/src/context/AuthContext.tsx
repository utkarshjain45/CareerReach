import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authApi, LoginPayload, RegisterPayload } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to check if a JWT token has expired based on its 'exp' claim
export const isJwtExpired = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const { exp } = JSON.parse(jsonPayload);
    if (!exp) return false;
    // Check if token expires within 10 seconds
    return Date.now() >= (exp * 1000) - 10000;
  } catch {
    return true;
  }
};

// Storage helpers using localStorage
const getStoredToken = (): string | null => {
  return localStorage.getItem('rm_token');
};

const getStoredUser = (): string | null => {
  return localStorage.getItem('rm_user');
};

const persistAuth = (token: string, user: User) => {
  localStorage.setItem('rm_token', token);
  localStorage.setItem('rm_user', JSON.stringify(user));
  // Clean up any old sessionStorage tokens
  sessionStorage.removeItem('rm_token');
  sessionStorage.removeItem('rm_user');
};

const clearAuth = () => {
  localStorage.removeItem('rm_token');
  localStorage.removeItem('rm_user');
  sessionStorage.removeItem('rm_token');
  sessionStorage.removeItem('rm_user');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    const stored = getStoredToken();
    if (stored && isJwtExpired(stored)) {
      clearAuth();
      return null;
    }
    return stored;
  });

  const [user, setUser] = useState<User | null>(() => {
    const storedToken = getStoredToken();
    if (storedToken && isJwtExpired(storedToken)) {
      return null;
    }
    const savedUser = getStoredUser();
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Validate existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken();
      if (storedToken) {
        if (isJwtExpired(storedToken)) {
          clearAuth();
          setToken(null);
          setUser(null);
        } else {
          try {
            const res = await authApi.getMe();
            if (res.data) {
              setUser(res.data);
              persistAuth(storedToken, res.data);
            }
          } catch {
            // Invalid or rejected token on server
            clearAuth();
            setToken(null);
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await authApi.login(payload);
    if (res.data) {
      const { token: newToken, user: newUser } = res.data;
      persistAuth(newToken, newUser);
      setToken(newToken);
      setUser(newUser);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await authApi.register(payload);
    if (res.data) {
      const { token: newToken, user: newUser } = res.data;
      persistAuth(newToken, newUser);
      setToken(newToken);
      setUser(newUser);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
