import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/api';
import { User, UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (data: { email: string; username: string; full_name: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get<UserProfile>('/users/profile');
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('fitquest_token');
      if (token) {
        try {
          const res = await apiClient.get<User>('/auth/me');
          setUser(res.data);
          await fetchProfile();
        } catch (err) {
          console.error('Token verification failed', err);
          localStorage.removeItem('fitquest_token');
          localStorage.removeItem('fitquest_user');
          setUser(null);
          setProfile(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username_or_email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { username_or_email, password });
    const { access_token, user } = res.data;
    localStorage.setItem('fitquest_token', access_token);
    localStorage.setItem('fitquest_user', JSON.stringify(user));
    setUser(user);
    await fetchProfile();
  };

  const register = async (data: { email: string; username: string; full_name: string; password: string }) => {
    const res = await apiClient.post('/auth/register', data);
    const { access_token, user } = res.data;
    localStorage.setItem('fitquest_token', access_token);
    localStorage.setItem('fitquest_user', JSON.stringify(user));
    setUser(user);
    await fetchProfile();
  };

  const logout = () => {
    localStorage.removeItem('fitquest_token');
    localStorage.removeItem('fitquest_user');
    setUser(null);
    setProfile(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile: fetchProfile,
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
