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

  const promoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const priceChangeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wishlistItemsRef = useRef(wishlistItems);

  // Keep ref up to date
  useEffect(() => {
    wishlistItemsRef.current = wishlistItems;
  }, [wishlistItems]);

  // 1. Promotional code notification effect
  useEffect(() => {
    if (!notificationsEnabled || !authState.user) {
      if (promoTimerRef.current) clearTimeout(promoTimerRef.current);
      return;
    }

    promoTimerRef.current = setTimeout(() => {
      showToast('🎁 Promo Code: Use ZAP50 at checkout for 50% discount!', 'info');
    }, 20000);

    return () => {
      if (promoTimerRef.current) clearTimeout(promoTimerRef.current);
    };
  }, [notificationsEnabled, authState.user, showToast]);

  const hasWishlistItems = wishlistItems.length > 0;

  // 2. Wishlist price change notification effect
  useEffect(() => {
    if (!notificationsEnabled || !authState.user || !hasWishlistItems) {
      if (priceChangeTimerRef.current) clearTimeout(priceChangeTimerRef.current);
      return;
    }

    priceChangeTimerRef.current = setTimeout(() => {
      const items = wishlistItemsRef.current;
      if (items.length > 0) {
        // Pick a random item from wishlist
        const randomItem = items[Math.floor(Math.random() * items.length)];
        const discountedPrice = Math.round(randomItem.price * 0.85); // 15% discount
        showToast(
          `🔥 Price Drop: ${randomItem.emoji} ${randomItem.name} in your wishlist fell to Rs. ${discountedPrice}!`,
          'success'
        );
      }
    }, 12000);

    return () => {
      if (priceChangeTimerRef.current) clearTimeout(priceChangeTimerRef.current);
    };
  }, [notificationsEnabled, authState.user, hasWishlistItems, showToast]);
}

