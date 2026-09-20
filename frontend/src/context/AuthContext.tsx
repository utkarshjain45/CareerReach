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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('rm_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('rm_token'));
  const [loading, setLoading] = useState<boolean>(true);

  // Validate existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('rm_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('rm_user', JSON.stringify(res.data));
          }
        } catch {
          // Invalid or expired token
          localStorage.removeItem('rm_token');
          localStorage.removeItem('rm_user');
          setToken(null);
          setUser(null);
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
      localStorage.setItem('rm_token', newToken);
      localStorage.setItem('rm_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await authApi.register(payload);
    if (res.data) {
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('rm_token', newToken);
      localStorage.setItem('rm_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('rm_token');
    localStorage.removeItem('rm_user');
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
