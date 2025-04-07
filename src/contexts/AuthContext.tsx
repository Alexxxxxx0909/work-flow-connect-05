import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export type UserType = {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  bio?: string;
  skills: string[];
  role: 'freelancer' | 'client'; // Ensure role is properly typed
};

type AuthContextType = {
  currentUser: UserType | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserType | undefined>;
  register: (name: string, email: string, password: string, role: 'freelancer' | 'client') => Promise<UserType | undefined>;
  logout: () => void;
  updateUserProfile: (updates: Partial<Omit<UserType, 'id' | 'email'>>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('wfc_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  // Fix the login function to use proper role type
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call for login
      await new Promise(resolve => setTimeout(resolve, 1000));
    
      // Mock user data
      const userData: UserType = {
        id: '1',
        name: 'John Doe',
        email,
        photoURL: '/assets/avatars/avatar-1.png',
        bio: 'Desarrollador Full Stack con 5 años de experiencia en React y Node.js.',
        skills: ['React', 'Node.js', 'TypeScript'],
        role: 'freelancer' // Must be 'freelancer' or 'client'
      };
    
      setCurrentUser(userData);
      setIsLoggedIn(true);
      localStorage.setItem('wfc_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: 'freelancer' | 'client') => {
    setIsLoading(true);
    try {
      // Simulate API call for registration
      await new Promise(resolve => setTimeout(resolve, 1000));
    
      // Mock user data
      const userData: UserType = {
        id: Date.now().toString(),
        name,
        email,
        photoURL: '',
        bio: '',
        skills: [],
        role // This is now properly typed
      };
    
      setCurrentUser(userData);
      setIsLoggedIn(true);
      localStorage.setItem('wfc_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('wfc_user');
  };

  const updateUserProfile = async (updates: Partial<Omit<UserType, 'id' | 'email'>>) => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    const updatedUser: UserType = { ...currentUser, ...updates } as UserType;
    setCurrentUser(updatedUser);
    localStorage.setItem('wfc_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
