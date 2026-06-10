import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import Animated, { 
  FadeInDown, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated';
import { Product } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';
import { useWishlist } from '@/context/wishlist-context';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/context/toast-context';

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const theme = useTheme();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const isLiked = isInWishlist(product.id);

  // Button Press Animations
  const cardScale = useSharedValue(1);
  const heartScale = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleAddToCart = async () => {
    cardScale.value = 0.95;
    cardScale.value = withSpring(1);
    await addToCart(product);
    showToast(`${product.name} added to cart!`, 'success');
  };

  const handleToggleWishlist = async () => {
    heartScale.value = 1.3;
    heartScale.value = withSpring(1);
    await toggleWishlist(product);
    showToast(
      isLiked 
        ? `${product.name} removed from wishlist.` 
        : `${product.name} added to wishlist!`, 
      isLiked ? 'info' : 'success'
    );
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(Math.min(index * 50, 400))}
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
        cardStyle
      ]}
    >
      {/* Product Avatar/Emoji */}
      <View style={[styles.avatarContainer, { backgroundColor: theme.background }]}>
        <Text style={styles.emoji}>{product.emoji}</Text>
      </View>

      {/* Product Information */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={[styles.category, { color: theme.textSecondary }]}>
          {product.category}
        </Text>
        
        {/* Rating and Price */}
        <View style={styles.row}>
          <Text style={[styles.price, { color: theme.text }]}>Rs. {product.price}</Text>
          <Text style={[styles.rating, { color: theme.text }]}>⭐ {product.rating}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {/* Wishlist button */}
        <Animated.View style={heartStyle}>
          <TouchableOpacity
            onPress={handleToggleWishlist}
            accessibilityLabel={`Toggle wishlist for ${product.name}`}
            style={styles.heartBtn}
          >
            <Text style={styles.heartText}>
              {isLiked ? '❤️' : '🖤'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Add to Cart button */}
        <TouchableOpacity
          onPress={handleAddToCart}
          accessibilityLabel={`Add ${product.name} to cart`}
          style={styles.addBtn}
        >
          <Text style={styles.addText}>+ Add</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
      }
    }),
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heartBtn: {
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartText: {
    fontSize: 20,
  },
  addBtn: {
    backgroundColor: '#168f6d',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 56,
    alignItems: 'center',
  },
  addText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
