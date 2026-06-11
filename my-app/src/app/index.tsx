import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Product } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';
import { fetchProductsFromAPI } from '@/services/api';
import { ProductCard } from '@/components/product-card';
import { SkeletonLoader } from '@/components/skeleton-loader';
import { OfflineBanner } from '@/components/offline-banner';
import { FilterModal, FilterState } from '@/components/filter-modal';
import { useToast } from '@/context/toast-context';

export default function ZapMartScreen() {
  const theme = useTheme();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Filter Modal visibility
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    category: 'All',
    minPrice: 0,
    maxPrice: 1000,
    rating: 0,
    sortBy: 'newest',
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProductsFromAPI();
      setProducts(data);
      setIsOffline(false);

      // Cache products
      const now = new Date().toISOString();
      await AsyncStorage.setItem('@zapmart_products_cache', JSON.stringify(data));
      await AsyncStorage.setItem('@zapmart_products_cache_timestamp', now);
      setLastUpdated(now);
    } catch (e) {
      setIsOffline(true);
      showToast('Network error. Loaded offline cache.', 'warning');
      
      // Load from cache
      try {
        const cachedProducts = await AsyncStorage.getItem('@zapmart_products_cache');
        const cachedTime = await AsyncStorage.getItem('@zapmart_products_cache_timestamp');
        if (cachedProducts) {
          setProducts(JSON.parse(cachedProducts));
        }
        if (cachedTime) {
          setLastUpdated(cachedTime);
        }
      } catch (cacheErr) {
        console.error('Failed to load products from cache', cacheErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Process search, filters, and sorting using useMemo
  const processedProducts = useMemo(() => {
    let list = [...products];

    // 1. Search Name
    if (searchText.trim() !== '') {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // 2. Filter Category
    if (filters.category !== 'All') {
      list = list.filter((p) => p.category === filters.category);
    }

    // 3. Filter Price Range
    list = list.filter(
      (p) => p.price >= filters.minPrice && p.price <= filters.maxPrice
    );

    // 4. Filter Rating
    if (filters.rating > 0) {
      list = list.filter((p) => p.rating >= filters.rating);
    }

    // 5. Sorting
    if (filters.sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [products, searchText, filters]);

  const handleApplyFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const renderProduct = useCallback(({ item, index }: { item: Product; index: number }) => (
    <ProductCard product={item} index={index} />
  ), []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Connection Banner */}
      <OfflineBanner 
        isOffline={isOffline} 
        lastUpdated={lastUpdated} 
        onRetry={loadProducts} 
      />

      <View style={styles.header}>
        <View>
          <Text style={[styles.brand, { color: theme.text }]}>ZapMart</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            High-speed grocery shopping, delivered fresh.
          </Text>
        </View>
      </View>

      {/* Search Bar & Filter Button */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search groceries..."
            placeholderTextColor={theme.textSecondary}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>

        <TouchableOpacity 
          style={[styles.filterBtn, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={styles.filterBtnText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {filters.category === 'All' ? 'All Products' : filters.category}
        </Text>
        {processedProducts.length > 0 && (
          <Text style={[styles.productCount, { color: theme.textSecondary }]}>
            {processedProducts.length} items
          </Text>
        )}
      </View>

      {/* Product List */}
      {loading ? (
        <SkeletonLoader />
      ) : (
        <FlatList
          data={processedProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          contentContainerStyle={styles.productList}
          initialNumToRender={6}
          maxToRenderPerBatch={10}
          windowSize={5}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No products found. Adjust filters or search query.
            </Text>
          }
        />
      )}

      {/* Filter modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
      />
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
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontSize: 34,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  searchBox: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 8,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
    fontWeight: '600',
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtnText: {
    fontSize: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  productCount: {
    fontSize: 13,
    fontWeight: '700',
  },
  productList: {
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 100, // Leave room for absolute web tab triggers
  },
  emptyText: {
    fontSize: 15,
    paddingVertical: 32,
    textAlign: 'center',
    fontWeight: '600',
  },
});
