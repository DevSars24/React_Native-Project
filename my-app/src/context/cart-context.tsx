import React, { createContext, useContext, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartAction, CartItem, CartState, Product } from '@/constants/types';

const initialState: CartState = {
  items: [],
};

const CartContext = createContext<{
  state: CartState;
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totals: {
    subtotal: number;
    deliveryFee: number;
    tax: number;
    grandTotal: number;
    itemCount: number;
  };
} | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  let newItems;
  switch (action.type) {
    case 'LOAD_CART':
      return { ...state, items: action.payload };
    case 'ADD_TO_CART':
      const existingItem = state.items.find(
        (item) => item.product.id === action.payload.id
      );
      if (existingItem) {
        newItems = state.items.map((item) =>
          item.product.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.items, { product: action.payload, quantity: 1 }];
      }
      return { ...state, items: newItems };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter((item) => item.product.id !== action.payload),
      };

    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.product.id !== action.payload.productId),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart on app launch
  useEffect(() => {
    async function loadCart() {
      try {
        const stored = await AsyncStorage.getItem('@zapmart_cart');
        if (stored) {
          dispatch({ type: 'LOAD_CART', payload: JSON.parse(stored) });
        }
      } catch (e) {
        console.error('Failed to load cart state', e);
      }
    }
    loadCart();
  }, []);

  // Helper to persist state
  const saveCart = async (items: CartItem[]) => {
    try {
      await AsyncStorage.setItem('@zapmart_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist cart state', e);
    }
  };

  const addToCart = async (product: Product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
    // Calculate next state to save correctly
    const existingIndex = state.items.findIndex((item) => item.product.id === product.id);
    let nextItems;
    if (existingIndex > -1) {
      nextItems = state.items.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      nextItems = [...state.items, { product, quantity: 1 }];
    }
    await saveCart(nextItems);
  };

  const removeFromCart = async (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    const nextItems = state.items.filter((item) => item.product.id !== productId);
    await saveCart(nextItems);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    let nextItems;
    if (quantity <= 0) {
      nextItems = state.items.filter((item) => item.product.id !== productId);
    } else {
      nextItems = state.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    }
    await saveCart(nextItems);
  };

  const clearCart = async () => {
    dispatch({ type: 'CLEAR_CART' });
    await saveCart([]);
  };

  // Calculate totals
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  
  // Free delivery above 500 Rs, otherwise 40 Rs. No delivery fee if cart is empty.
  const deliveryFee = subtotal === 0 ? 0 : subtotal > 500 ? 0 : 40;
  
  // Tax (5% GST)
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  
  const grandTotal = subtotal + deliveryFee + tax;
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const totals = {
    subtotal,
    deliveryFee,
    tax,
    grandTotal,
    itemCount,
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totals,
      }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
