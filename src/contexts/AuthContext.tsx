import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserInteraction } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  trackInteraction: (productId: string, type: UserInteraction['type'], rating?: number) => void;
  getUserInteractions: () => UserInteraction[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useLocalStorage<User | null>('currentUser', null);
  const [users, setUsers] = useLocalStorage<User[]>('users', []);
  const [interactions, setInteractions] = useLocalStorage<UserInteraction[]>('userInteractions', []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      setUser(existingUser);
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return false; // User already exists
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      preferences: {
        categories: [],
        priceRange: [0, 2000],
        brands: []
      },
      interactions: []
    };

    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const trackInteraction = (productId: string, type: UserInteraction['type'], rating?: number) => {
    if (!user) return;

    const interaction: UserInteraction = {
      productId,
      type,
      timestamp: Date.now(),
      rating
    };

    setInteractions(prev => [...prev.filter(i => !(i.productId === productId && i.type === type)), interaction]);
  };

  const getUserInteractions = (): UserInteraction[] => {
    if (!user) return [];
    return interactions;
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    trackInteraction,
    getUserInteractions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}