import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useWishlist } from '@/context/wishlist-context';
import { useTheme } from '@/hooks/use-theme';
import { ProductCard } from '@/components/product-card';

export default function WishlistScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { state: wishlistState } = useWishlist();
  
  const wishlistItems = wishlistState.items;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>My Wishlist ❤️</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Your saved items, ready to buy.
        </Text>
      </View>

      {/* Wishlist Items List */}
      {wishlistItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>❤️</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Your Wishlist is Empty</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Tap the heart icon on any product to save it here.
          </Text>
          <TouchableOpacity 
            style={[styles.shopBtn, { backgroundColor: '#168f6d' }]}
            onPress={() => router.push('/')}
          >
            <Text style={styles.shopBtnText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ProductCard product={item} index={index} />
          )}
          contentContainerStyle={styles.listContainer}
          initialNumToRender={6}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  listContainer: {
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 100, // Safe inset for navigation triggers
  },
  emptyContainer: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 72,
    opacity: 0.15,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    marginBottom: 24,
  },
  shopBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  shopBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
