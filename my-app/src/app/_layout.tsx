import { DarkTheme, DefaultTheme, ThemeProvider as NavigationProvider } from 'expo-router';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { ThemeProvider, useAppTheme } from '@/context/theme-context';
import { CartProvider } from '@/context/cart-context';
import { WishlistProvider } from '@/context/wishlist-context';
import { ToastProvider } from '@/context/toast-context';
import { Colors } from '@/constants/theme';
import { useNotifications } from '@/hooks/use-notifications';
import { ErrorBoundary } from '@/components/error-boundary';

function LoadingScreen() {
  const { colors } = useAppTheme();
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 600 }),
        withTiming(1.0, { duration: 600 })
      ),
      -1, // infinite loops
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Text style={[styles.logoText, { color: '#168f6d' }]}>🛒</Text>
      </Animated.View>
      <Text style={[styles.brandName, { color: colors.text }]}>ZapMart</Text>
      <ActivityIndicator size="large" color="#168f6d" style={{ marginTop: 20 }} />
    </View>
  );
}

function AppContent() {
  const { state: authState } = useAuth();
  const { themeMode, colors } = useAppTheme();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Initialize background notifications simulator
  useNotifications();

  useEffect(() => {
    if (authState.isLoading) return;

    // Check if user is in auth routes (login / signup)
    const segs = segments as string[];
    const inAuthGroup = segs[0] === 'login' || segs[0] === 'signup';

    if (!authState.token && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/login' as any);
    } else if (authState.token && inAuthGroup) {
      // Redirect to home if authenticated
      router.replace('/' as any);
    }
    setIsReady(true);
  }, [authState.token, authState.isLoading, segments]);

  if (authState.isLoading || !isReady) {
    return <LoadingScreen />;
  }

  const navTheme = themeMode === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationProvider value={navTheme}>
      <AnimatedSplashOverlay />
      {!authState.token ? (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
        </Stack>
      ) : (
        <AppTabs />
      )}
    </NavigationProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <ToastProvider>
                  <AppContent />
                </ToastProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#dff6f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#168f6d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  logoText: {
    fontSize: 50,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 15,
    letterSpacing: 1,
  },
});
