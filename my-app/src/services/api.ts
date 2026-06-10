import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@/constants/types';

export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Fresh Apples', price: 120, emoji: '🍎', category: 'Fruits & Vegetables', rating: 4.8, createdAt: '2026-06-01T10:00:00.000Z' },
  { id: '2', name: 'Milk Pack', price: 64, emoji: '🥛', category: 'Dairy', rating: 4.5, createdAt: '2026-06-02T11:00:00.000Z' },
  { id: '3', name: 'Brown Bread', price: 45, emoji: '🍞', category: 'Bakery', rating: 4.2, createdAt: '2026-06-03T12:00:00.000Z' },
  { id: '4', name: 'Potato Chips', price: 30, emoji: '🥔', category: 'Snacks', rating: 4.0, createdAt: '2026-06-04T13:00:00.000Z' },
  { id: '5', name: 'Green Tea', price: 180, emoji: '🍵', category: 'Beverages', rating: 4.6, createdAt: '2026-06-05T14:00:00.000Z' },
  { id: '6', name: 'Instant Noodles', price: 55, emoji: '🍜', category: 'Snacks', rating: 3.8, createdAt: '2026-06-06T15:00:00.000Z' },
  { id: '7', name: 'Organic Bananas', price: 60, emoji: '🍌', category: 'Fruits & Vegetables', rating: 4.7, createdAt: '2026-06-07T09:00:00.000Z' },
  { id: '8', name: 'Cheddar Cheese', price: 250, emoji: '🧀', category: 'Dairy', rating: 4.9, createdAt: '2026-06-08T08:00:00.000Z' },
  { id: '9', name: 'Chocolate Chip Cookies', price: 80, emoji: '🍪', category: 'Bakery', rating: 4.4, createdAt: '2026-06-09T07:00:00.000Z' },
  { id: '10', name: 'Greek Yogurt', price: 120, emoji: '🍦', category: 'Dairy', rating: 4.6, createdAt: '2026-06-10T06:00:00.000Z' },
  { id: '11', name: 'Roasted Almonds', price: 350, emoji: '🥜', category: 'Snacks', rating: 4.7, createdAt: '2026-06-10T15:00:00.000Z' },
  { id: '12', name: 'Fresh Orange Juice', price: 150, emoji: '🍊', category: 'Beverages', rating: 4.3, createdAt: '2026-06-10T16:00:00.000Z' },
];

export async function fetchProductsFromAPI(): Promise<Product[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Check if simulated offline mode is toggled on
  try {
    const isOffline = await AsyncStorage.getItem('@zapmart_simulated_offline');
    if (isOffline === 'true') {
      throw new Error('Network request failed. Connect to internet and try again.');
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes('Network request failed')) {
      throw e;
    }
  }

  return MOCK_PRODUCTS;
}
