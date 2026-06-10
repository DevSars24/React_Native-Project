import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { useWishlist } from '@/context/wishlist-context';
import { useToast } from '@/context/toast-context';

export function useNotifications() {
  const { state: authState } = useAuth();
  const { state: wishlistState } = useWishlist();
  const { showToast } = useToast();

  const notificationsEnabled = authState.user?.notificationsEnabled ?? true;
  const wishlistItems = wishlistState.items;

  const promoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const priceChangeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If notifications are disabled or user is not logged in, clear timers and return
    if (!notificationsEnabled || !authState.user) {
      if (promoTimerRef.current) clearTimeout(promoTimerRef.current);
      if (priceChangeTimerRef.current) clearTimeout(priceChangeTimerRef.current);
      return;
    }

    // 1. Simulate Daily Promotional Notification after 20 seconds
    promoTimerRef.current = setTimeout(() => {
      showToast('🎁 Promo Code: Use ZAP50 at checkout for 50% discount!', 'info');
    }, 20000);

    // 2. Simulate Wishlist Item Price Change after 12 seconds
    priceChangeTimerRef.current = setTimeout(() => {
      if (wishlistItems.length > 0) {
        // Pick a random item from wishlist
        const randomItem = wishlistItems[Math.floor(Math.random() * wishlistItems.length)];
        const discountedPrice = Math.round(randomItem.price * 0.85); // 15% discount
        showToast(
          `🔥 Price Drop: ${randomItem.emoji} ${randomItem.name} in your wishlist fell to Rs. ${discountedPrice}!`,
          'success'
        );
      }
    }, 12000);

    return () => {
      if (promoTimerRef.current) clearTimeout(promoTimerRef.current);
      if (priceChangeTimerRef.current) clearTimeout(priceChangeTimerRef.current);
    };
  }, [notificationsEnabled, wishlistItems, authState.user]);
}
