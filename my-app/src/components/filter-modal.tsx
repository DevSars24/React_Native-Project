import React, { useState, useCallback } from 'react';
import { 
  Modal, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Pressable,
  ScrollView,
  TextInput,
  Platform
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  rating: number;
  sortBy: 'price-asc' | 'price-desc' | 'rating' | 'newest' | '';
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  currentFilters: FilterState;
}

const CATEGORIES = ['All', 'Fruits & Vegetables', 'Dairy', 'Bakery', 'Snacks', 'Beverages'];
const SORT_OPTIONS: { label: string; value: FilterState['sortBy'] }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Top Rated', value: 'rating' },
];

export function FilterModal({ visible, onClose, onApply, currentFilters }: FilterModalProps) {
  const theme = useTheme();

  const [category, setCategory] = useState(currentFilters.category);
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice.toString());
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice.toString());
  const [rating, setRating] = useState(currentFilters.rating);
  const [sortBy, setSortBy] = useState(currentFilters.sortBy);

  const handleApply = useCallback(() => {
    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || 1000;
    onApply({
      category,
      minPrice: min,
      maxPrice: max,
      rating,
      sortBy,
    });
    onClose();
  }, [category, minPrice, maxPrice, rating, sortBy, onApply, onClose]);

  const handleClear = useCallback(() => {
    setCategory('All');
    setMinPrice('0');
    setMaxPrice('1000');
    setRating(0);
    setSortBy('newest');
  }, []);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable 
          style={[styles.modalContent, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }]}
          onPress={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Filters & Sort</Text>
            <TouchableOpacity onPress={handleClear}>
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Sort Options */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Sort By</Text>
              <View style={styles.sortGrid}>
                {SORT_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setSortBy(opt.value)}
                    style={[
                      styles.sortOption,
                      { borderColor: theme.backgroundSelected },
                      sortBy === opt.value && { backgroundColor: '#168f6d', borderColor: '#168f6d' }
                    ]}
                  >
                    <Text 
                      style={[
                        styles.sortOptionText, 
                        { color: theme.text },
                        sortBy === opt.value && { color: '#ffffff', fontWeight: 'bold' }
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.chip,
                      { backgroundColor: theme.backgroundElement },
                      category === cat && { backgroundColor: '#168f6d' }
                    ]}
                  >
                    <Text 
                      style={[
                        styles.chipText, 
                        { color: theme.text },
                        category === cat && { color: '#ffffff', fontWeight: 'bold' }
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Price Inputs */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Price Range (Rs.)</Text>
              <View style={styles.priceRow}>
                <View style={styles.priceInputWrapper}>
                  <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Min</Text>
                  <TextInput
                    value={minPrice}
                    onChangeText={setMinPrice}
                    keyboardType="numeric"
                    style={[styles.priceInput, { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
                  />
                </View>
                <View style={styles.priceDivider} />
                <View style={styles.priceInputWrapper}>
                  <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Max</Text>
                  <TextInput
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    keyboardType="numeric"
                    style={[styles.priceInput, { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
                  />
                </View>
              </View>
            </View>

            {/* Rating Filter */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Minimum Rating</Text>
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={[
                      styles.ratingStarBtn,
                      { backgroundColor: theme.backgroundElement },
                      rating === star && { backgroundColor: '#f9a826' }
                    ]}
                  >
                    <Text 
                      style={[
                        styles.ratingStarText, 
                        { color: theme.text },
                        rating === star && { color: '#1b1b1b', fontWeight: 'bold' }
                      ]}
                    >
                      ⭐ {star}+
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={[styles.applyBtn, { backgroundColor: '#168f6d' }]} onPress={handleApply}>
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  clearBtnText: {
    color: '#e63946',
    fontWeight: '700',
    fontSize: 14,
  },
  scrollBody: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  sortGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sortOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  sortOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryRow: {
    gap: 10,
    paddingRight: 20,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  priceInputWrapper: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  priceInput: {
    borderRadius: 8,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  priceDivider: {
    width: 10,
    height: 2,
    backgroundColor: '#808080',
    marginTop: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingStarBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  ratingStarText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    paddingTop: 10,
  },
  applyBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
