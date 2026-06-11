import React, { createContext, useContext, useEffect, useReducer, useRef, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, WishlistAction, WishlistState } from '@/constants/types';

const initialState: WishlistState = {
  items: [],
};

const WishlistContext = createContext<{
  state: WishlistState;
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
} | undefined>(undefined);

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'LOAD_WISHLIST':
      return { ...state, items: action.payload };
    case 'TOGGLE_WISHLIST':
      const exists = state.items.some((item) => item.id === action.payload.id);
      if (exists) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload.id),
        };
      } else {
        return {
          ...state,
          items: [...state.items, action.payload],
        };
      }
    default:
      return state;
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const isInitiated = useRef(false);

  // Load wishlist from AsyncStorage on launch
  useEffect(() => {
    async function loadWishlist() {
      try {
        const stored = await AsyncStorage.getItem('@zapmart_wishlist');
        if (stored) {
          dispatch({ type: 'LOAD_WISHLIST', payload: JSON.parse(stored) });
        }
      } catch (e) {
        console.error('Failed to load wishlist state', e);
      } finally {
        isInitiated.current = true;
      }
    }
    loadWishlist();
  }, []);

  // Save wishlist whenever items change
  useEffect(() => {
    if (isInitiated.current) {
      AsyncStorage.setItem('@zapmart_wishlist', JSON.stringify(state.items)).catch((e) => {
        console.error('Failed to persist wishlist state', e);
      });
    }
  }, [state.items]);

  const toggleWishlist = useCallback(async (product: Product) => {
    dispatch({ type: 'TOGGLE_WISHLIST', payload: product });
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return state.items.some((item) => item.id === productId);
  }, [state.items]);

  const contextValue = useMemo(() => ({
    state,
    toggleWishlist,
    isInWishlist,
  }), [state, toggleWishlist, isInWishlist]);

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

