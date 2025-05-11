import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type User = {
  id: string;
  phone: string;
  fullName: string;
  userType: 'normal' | 'primary';
  age: number;
  height: number;
  weight: number;
  gender: string;
  medicalHistory?: string;
  primaryUserId?: string; // For normal users, references their primary user
  connectedUsers?: string[]; // For primary users, list of connected normal users
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (phone: string, password: string, rememberMe: boolean) => Promise<void>;
  signUp: (userData: Omit<User, 'id' | 'connectedUsers'> & { password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  bypassLogin: () => Promise<void>;
  updatePrimaryUser: (primaryUserPhone: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER: User = {
  id: 'bypass-123',
  phone: '+1234567890',
  fullName: 'Test User',
  userType: 'primary',
  age: 35,
  height: 175,
  weight: 70,
  gender: 'other',
  connectedUsers: ['user-1', 'user-2'],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkStoredUser();
  }, []);

  const checkStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (phone: string, password: string, rememberMe: boolean) => {
    setIsLoading(true);
    try {
      // TODO: Implement Firebase authentication
      const mockUser: User = {
        id: '123',
        phone,
        fullName: 'Test User',
        userType: 'normal',
        age: 30,
        height: 170,
        weight: 70,
        gender: 'male',
      };

      setUser(mockUser);
      if (rememberMe) {
        await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: Omit<User, 'id' | 'connectedUsers'> & { password: string }) => {
    setIsLoading(true);
    try {
      // TODO: Implement Firebase user creation
      const mockUser: User = {
        ...userData,
        id: '123',
        connectedUsers: userData.userType === 'primary' ? [] : undefined,
      };

      setUser(mockUser);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrimaryUser = async (primaryUserPhone: string) => {
    if (!user || user.userType !== 'normal') return;

    try {
      // TODO: Implement Firebase connection logic
      const updatedUser: User = {
        ...user,
        primaryUserId: 'primary-123', // This would be the actual primary user's ID from Firebase
      };

      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating primary user:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const bypassLogin = async () => {
    try {
      setUser(MOCK_USER);
      await AsyncStorage.setItem('user', JSON.stringify(MOCK_USER));
    } catch (error) {
      console.error('Error in bypass login:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, bypassLogin, updatePrimaryUser }}>
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