import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming 
} from 'react-native-reanimated';

interface OfflineBannerProps {
  isOffline: boolean;
  lastUpdated: string | null;
  onRetry: () => void;
}

export function OfflineBanner({ isOffline, lastUpdated, onRetry }: OfflineBannerProps) {
  const height = useSharedValue(0);

  useEffect(() => {
    height.value = withTiming(isOffline ? 60 : 0, { duration: 300 });
  }, [isOffline]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: height.value > 0 ? 1 : 0,
  }));

  return (
    <Animated.View style={[styles.banner, animatedStyle]}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Offline Mode</Text>
          {lastUpdated && (
            <Text style={styles.subtitle}>
              Cached: {new Date(lastUpdated).toLocaleTimeString()}
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryText}>Retry 🔄</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#e63946',
    width: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 100,
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 0,
      }
    })
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: '100%',
  },
  textContainer: {
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  retryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});
