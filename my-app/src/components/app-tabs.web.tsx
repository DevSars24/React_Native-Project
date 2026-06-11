import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { Pressable, useColorScheme, View, StyleSheet, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useEffect } from 'react';

import { ExternalLink } from './external-link';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import { useTheme } from '@/hooks/use-theme';
import { useAppTheme } from '@/context/theme-context';

export default function AppTabs() {
  const { totals } = useCart();
  const { state: wishlistState } = useWishlist();

  const cartCount = totals.itemCount;
  const wishlistCount = wishlistState.items.length;

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton>Home</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>Explore</TabButton>
          </TabTrigger>
          <TabTrigger name="wishlist" href={"/wishlist" as any} asChild>
            <TabButton badgeCount={wishlistCount}>Wishlist</TabButton>
          </TabTrigger>
          <TabTrigger name="cart" href={"/cart" as any} asChild>
            <TabButton badgeCount={cartCount}>Cart</TabButton>
          </TabTrigger>
          <TabTrigger name="profile" href={"/profile" as any} asChild>
            <TabButton>Profile</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

interface CustomTabButtonProps extends TabTriggerSlotProps {
  badgeCount?: number;
}

export function TabButton({ children, isFocused, badgeCount, ...props }: CustomTabButtonProps) {
  const theme = useTheme();
  
  // Badge scale animation for bounce effect on update
  const scale = useSharedValue(1);

  useEffect(() => {
    if (badgeCount && badgeCount > 0) {
      scale.value = withSpring(1.3, {}, () => {
        scale.value = withSpring(1);
      });
    }
  }, [badgeCount]);

  const animatedBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}>
        <View style={styles.tabButtonContent}>
          <ThemedText type="smallBold" themeColor={isFocused ? 'text' : 'textSecondary'}>
            {children}
          </ThemedText>
          {badgeCount !== undefined && badgeCount > 0 && (
            <Animated.View style={[styles.badge, animatedBadgeStyle]}>
              <Text style={styles.badgeText}>{badgeCount}</Text>
            </Animated.View>
          )}
        </View>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const { colors } = useAppTheme();

  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        <ThemedText type="smallBold" style={styles.brandText}>
          ZapMart 🛒
        </ThemedText>

        <View style={styles.triggersWrapper}>
          {props.children}
        </View>

        <ExternalLink href="https://docs.expo.dev" asChild>
          <Pressable style={styles.externalPressable}>
            <ThemedText type="link">Docs</ThemedText>
            <SymbolView
              tintColor={colors.text}
              name={{ ios: 'arrow.up.right.square', web: 'link' }}
              size={12}
            />
          </Pressable>
        </ExternalLink>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    bottom: 0,
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.1)',
  },
  brandText: {
    marginRight: Spacing.four,
    fontSize: 16,
    color: '#168f6d',
  },
  triggersWrapper: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.one + 2,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  tabButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    backgroundColor: '#e63946',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  externalPressable: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
    marginLeft: Spacing.three,
  },
});
