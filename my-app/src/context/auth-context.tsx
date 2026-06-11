import React, { createContext, useContext, useEffect, useReducer, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthAction, AuthState, User } from '@/constants/types';

const initialState: AuthState = {
  isLoading: true,
  user: null,
  token: null,
};

const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, name?: string) => Promise<void>;
  signup: (name: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (fields: Partial<User>) => Promise<void>;
} | undefined>(undefined);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN':
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'LOGOUT':
      return {
        ...state,
        isLoading: false,
        user: null,
        token: null,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check auth state on app launch
  useEffect(() => {
    async function loadAuth() {
      try {
        const stored = await AsyncStorage.getItem('@zapmart_auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.token && parsed.user) {
            dispatch({ type: 'LOGIN', payload: parsed });
            return;
          }
        }
      } catch (e) {
        console.error('Failed to load auth state', e);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
    loadAuth();
  }, []);

  const login = useCallback(async (email: string, name = 'ZapMart User') => {
    dispatch({ type: 'SET_LOADING', payload: true });
    // Mock login delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user: User = {
      name,
      email,
      notificationsEnabled: true,
    };
    const token = 'mock-jwt-token-zapmart-12345';
    const data = { user, token };

    try {
      await AsyncStorage.setItem('@zapmart_auth', JSON.stringify(data));
      dispatch({ type: 'LOGIN', payload: data });
    } catch (e) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw new Error('Failed to save auth state during login');
    }
  }, []);

  const signup = useCallback(async (name: string, email: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    // Mock signup delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user: User = {
      name,
      email,
      notificationsEnabled: true,
    };
    const token = 'mock-jwt-token-zapmart-12345';
    const data = { user, token };

    try {
      await AsyncStorage.setItem('@zapmart_auth', JSON.stringify(data));
      dispatch({ type: 'LOGIN', payload: data });
    } catch (e) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw new Error('Failed to save auth state during signup');
    }
  }, []);

  const logout = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await AsyncStorage.removeItem('@zapmart_auth');
      dispatch({ type: 'LOGOUT' });
    } catch (e) {
      dispatch({ type: 'SET_LOADING', payload: false });
      console.error('Failed to clear auth state during logout', e);
    }
  }, []);

  const updateProfile = useCallback(async (fields: Partial<User>) => {
    if (!state.user || !state.token) return;

    const updatedUser = { ...state.user, ...fields };
    const data = { user: updatedUser, token: state.token };

    try {
      await AsyncStorage.setItem('@zapmart_auth', JSON.stringify(data));
      dispatch({ type: 'UPDATE_PROFILE', payload: fields });
    } catch (e) {
      console.error('Failed to update profile in AsyncStorage', e);
      throw new Error('Failed to update profile settings');
    }
  }, [state.user, state.token]);

  const contextValue = useMemo(() => ({
    state,
    login,
    signup,
    logout,
    updateProfile,
  }), [state, login, signup, logout, updateProfile]);

  return (
    <AuthContext.Provider value={contextValue}>
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

