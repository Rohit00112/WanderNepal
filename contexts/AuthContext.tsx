import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  updateAvatar: (avatarUri: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      setIsLoading(true);
      // TODO: Implement actual authentication API call
      const mockUser = {
        id: '1',
        fullName: 'John Doe',
        email: email,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
        phoneNumber: '+977 9876543210',
        bio: 'Travel enthusiast and mountain lover',
        preferredLanguage: 'English',
        notificationsEnabled: true
      };
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error) {
      throw new Error('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }

  async function signUp(fullName: string, email: string, password: string) {
    try {
      setIsLoading(true);
      // TODO: Implement actual registration API call
      const mockUser = {
        id: '1',
        fullName: fullName,
        email: email,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
        preferredLanguage: 'English',
        notificationsEnabled: true
      };
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  }

  async function updateProfile(profileData: Partial<User>) {
    try {
      if (!user) throw new Error('No user logged in');
      
      const updatedUser = { ...user, ...profileData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Profile update failed');
    }
  }

  async function updateAvatar(avatarUri: string) {
    try {
      if (!user) throw new Error('No user logged in');
      
      const updatedUser = { ...user, avatar: avatarUri };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return;
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw new Error('Avatar update failed');
    }
  }

  async function signOut() {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}