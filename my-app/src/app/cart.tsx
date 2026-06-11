import React, { useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  ScrollView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useCart } from '@/context/cart-context';
import { useTheme } from '@/hooks/use-theme';
import { useToast } from '@/context/toast-context';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';

export default function CartScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { showToast } = useToast();
  const { 
    state: cartState, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    totals 
  } = useCart();

  const cartItems = cartState.items;

  const handleCheckout = useCallback(async () => {
    // Mock checkout success
    showToast('🎉 Order placed successfully! Thank you for shopping.', 'success');
    await clearCart();
  }, [clearCart, showToast]);

  const renderCartItem = useCallback(({ item, index }: { item: any; index: number }) => (
    <Animated.View 
      entering={FadeInDown.duration(350).delay(index * 40)}
      style={[styles.itemCard, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
    >
      <View style={[styles.itemAvatar, { backgroundColor: theme.background }]}>
        <Text style={styles.itemEmoji}>{item.product.emoji}</Text>
      </View>
      
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={1}>
          {item.product.name}
        </Text>
        <Text style={[styles.itemPrice, { color: theme.textSecondary }]}>
          Rs. {item.product.price}
        </Text>
      </View>

      {/* Quantity Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity 
          style={[styles.qtyBtn, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }]}
          onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
        >
          <Text style={[styles.qtyBtnText, { color: theme.text }]}>-</Text>
        </TouchableOpacity>
        
        <Text style={[styles.qtyText, { color: theme.text }]}>{item.quantity}</Text>
        
        <TouchableOpacity 
          style={[styles.qtyBtn, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }]}
          onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
        >
          <Text style={[styles.qtyBtnText, { color: theme.text }]}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.deleteBtn}
          onPress={() => removeFromCart(item.product.id)}
        >
          <Text style={styles.deleteBtnText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  ), [theme, updateQuantity, removeFromCart]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.title, { color: theme.text }]}>My Cart 🛒</Text>
          {cartItems.length > 0 && (
            <TouchableOpacity onPress={clearCart}>
              <Text style={styles.clearBtnText}>Clear Cart</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Review items and complete your order.
        </Text>
      </View>

      {/* Cart Body */}
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛍️</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Your Cart is Empty</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Looks like you haven't added any products to your cart yet.
          </Text>
          <TouchableOpacity 
            style={[styles.shopBtn, { backgroundColor: '#168f6d' }]}
            onPress={() => router.push('/')}
          >
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.product.id}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContent}
          />

          {/* Checkout Invoice Card */}
          <Animated.View 
            entering={SlideInDown.duration(400)}
            style={[styles.invoiceCard, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
          >
            <View style={styles.invoiceRow}>
              <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Subtotal</Text>
              <Text style={{ color: theme.text, fontWeight: '700' }}>Rs. {totals.subtotal}</Text>
            </View>

            <View style={styles.invoiceRow}>
              <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Delivery Fee</Text>
              <Text style={{ color: theme.text, fontWeight: '700' }}>
                {totals.deliveryFee === 0 ? 'FREE' : `Rs. ${totals.deliveryFee}`}
              </Text>
            </View>

            <View style={styles.invoiceRow}>
              <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Tax (5% GST)</Text>
              <Text style={{ color: theme.text, fontWeight: '700' }}>Rs. {totals.tax}</Text>
            </View>

            <View style={styles.invoiceDivider} />

            <View style={[styles.invoiceRow, { marginBottom: 16 }]}>
              <Text style={{ color: theme.text, fontWeight: '800', fontSize: 16 }}>Grand Total</Text>
              <Text style={{ color: '#168f6d', fontWeight: '900', fontSize: 18 }}>Rs. {totals.grandTotal}</Text>
            </View>

            <TouchableOpacity 
              style={[styles.checkoutBtn, { backgroundColor: '#168f6d' }]}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutBtnText}>Checkout Order</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
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
    paddingBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  clearBtnText: {
    color: '#e63946',
    fontWeight: '700',
    fontSize: 14,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemAvatar: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemEmoji: {
    fontSize: 20,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '800',
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '800',
    minWidth: 16,
    textAlign: 'center',
  },
  deleteBtn: {
    padding: 6,
  },
  deleteBtnText: {
    fontSize: 16,
  },
  invoiceCard: {
    padding: 18,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100, // Safe padding above tab trigger in web
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    })
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  invoiceDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#808080',
    opacity: 0.3,
    marginVertical: 10,
  },
  checkoutBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
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
  },
  shopBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
