import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence 
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/use-theme';

export function SkeletonLoader() {
  const theme = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 600 }),
        withTiming(0.4, { duration: 600 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4].map((i) => (
        <Animated.View
          key={i}
          style={[
            styles.card,
            animatedStyle,
            { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: theme.backgroundSelected }]} />
          <View style={styles.info}>
            <View style={[styles.line, { backgroundColor: theme.backgroundSelected, width: '60%' }]} />
            <View style={[styles.line, { backgroundColor: theme.backgroundSelected, width: '40%', marginTop: 8 }]} />
          </View>
          <View style={[styles.btn, { backgroundColor: theme.backgroundSelected }]} />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  line: {
    height: 14,
    borderRadius: 4,
  },
  btn: {
    width: 60,
    height: 34,
    borderRadius: 8,
  },
});
