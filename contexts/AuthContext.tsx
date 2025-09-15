import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define User type
type User = {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  phoneNumber?: string;
  bio?: string;
  preferredLanguage?: string;
  notificationsEnabled?: boolean;
};

// Define AuthContext type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  updateAvatar: (avatarUri: string) => Promise<void>;
};

// Create context with an initial undefined value
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate unique ID for mock users (replace with real backend ID in production)
const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from AsyncStorage
  const loadUser = useCallback(async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const parsedUser = JSON.parse(userJson);
        // Basic validation to ensure parsed data matches User type
        if (parsedUser.id && parsedUser.email && parsedUser.fullName) {
          setUser(parsedUser);
        } else {
          console.warn('Invalid user data in AsyncStorage');
          await AsyncStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      await AsyncStorage.removeItem('user'); // Clear corrupted data
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  async function signIn(email: string, password: string) {
    try {
      setIsLoading(true);
      // Input validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      if (!isValidEmail(email)) {
        throw new Error('Invalid email format');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // TODO: Replace with actual authentication API call
      const mockUser: User = {
        id: generateUniqueId(),
        fullName: 'John Doe',
        email,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
        phoneNumber: '+977 9876543210',
        bio: 'Travel enthusiast and mountain lover',
        preferredLanguage: 'English',
        notificationsEnabled: true,
      };
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error: any) {
      throw new Error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }

  async function signUp(fullName: string, email: string, password: string) {
    try {
      setIsLoading(true);
      // Input validation
      if (!fullName || !email || !password) {
        throw new Error('Full name, email, and password are required');
      }
      if (!isValidEmail(email)) {
        throw new Error('Invalid email format');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // TODO: Replace with actual registration API call
      const mockUser: User = {
        id: generateUniqueId(),
        fullName,
        email,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
        preferredLanguage: 'English',
        notificationsEnabled: true,
      };
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  }

  async function updateProfile(profileData: Partial<User>) {
    try {
      setIsLoading(true);
      if (!user) {
        throw new Error('No user logged in');
      }
      if (profileData.email && !isValidEmail(profileData.email)) {
        throw new Error('Invalid email format');
      }
      const updatedUser = { ...user, ...profileData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    } finally {
      setIsLoading(false);
    }
  }

  async function updateAvatar(avatarUri: string) {
    try {
      setIsLoading(true);
      if (!user) {
        throw new Error('No user logged in');
      }
      if (!avatarUri) {
        throw new Error('Avatar URI is required');
      }
      const updatedUser = { ...user, avatar: avatarUri };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error: any) {
      throw new Error(error.message || 'Avatar update failed');
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    try {
      setIsLoading(true);
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw new Error('Sign out failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        updateAvatar,
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