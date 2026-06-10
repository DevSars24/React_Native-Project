export interface Product {
  id: string;
  name: string;
  price: number; // Numeric price for calculation & filtering
  emoji: string;
  category: string;
  rating: number; // Rating from 1 to 5
  createdAt: string; // Date string for sorting by newest
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  name: string;
  email: string;
  phone?: string;
  notificationsEnabled: boolean;
}

export interface AuthState {
  isLoading: boolean;
  user: User | null;
  token: string | null;
}

export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> };

export interface CartState {
  items: CartItem[];
}

export type CartAction =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: string } // productId
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

export interface WishlistState {
  items: Product[];
}

export type WishlistAction =
  | { type: 'TOGGLE_WISHLIST'; payload: Product }
  | { type: 'LOAD_WISHLIST'; payload: Product[] };

export type ThemeMode = 'light' | 'dark';

export interface ThemeState {
  mode: ThemeMode;
}

export type ThemeAction = { type: 'SET_THEME'; payload: ThemeMode };
