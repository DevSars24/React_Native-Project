import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  
  const { totals } = useCart();
  const { state: wishlistState } = useWishlist();

  const cartCount = totals.itemCount;
  const wishlistCount = wishlistState.items.length;

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="wishlist">
        <NativeTabs.Trigger.Label>
          {wishlistCount > 0 ? `Wishlist (${wishlistCount})` : 'Wishlist'}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/wishlist.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="cart">
        <NativeTabs.Trigger.Label>
          {cartCount > 0 ? `Cart (${cartCount})` : 'Cart'}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/cart.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/profile.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

    </NativeTabs>
  );
}
