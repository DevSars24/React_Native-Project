import { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Product = {
  id: string;
  name: string;
  price: string;
  emoji: string;
};

type SearchBarProps = {
  searchText: string;
  onSearchChange: (text: string) => void;
};

type CartCounterProps = {
  count: number;
  onAddItem: () => void;
};

type ProductCardProps = {
  product: Product;
  onAddItem: () => void;
};

const products: Product[] = [
  { id: '1', name: 'Fresh Apples', price: 'Rs. 120/kg', emoji: 'A' },
  { id: '2', name: 'Milk Pack', price: 'Rs. 64', emoji: 'M' },
  { id: '3', name: 'Brown Bread', price: 'Rs. 45', emoji: 'B' },
  { id: '4', name: 'Potato Chips', price: 'Rs. 30', emoji: 'C' },
  { id: '5', name: 'Green Tea', price: 'Rs. 180', emoji: 'T' },
  { id: '6', name: 'Instant Noodles', price: 'Rs. 55', emoji: 'N' },
];

function SearchBar({ searchText, onSearchChange }: SearchBarProps) {
  return (
    <View style={styles.searchBox}>
      <Text style={styles.searchIcon}>Search</Text>
      <TextInput
        value={searchText}
        onChangeText={onSearchChange}
        placeholder="Search groceries..."
        placeholderTextColor="#77838f"
        style={styles.searchInput}
      />
    </View>
  );
}

function CartCounter({ count, onAddItem }: CartCounterProps) {
  return (
    <View style={styles.cartCard}>
      <View>
        <Text style={styles.cartLabel}>Cart Items</Text>
        <Text style={styles.cartCount}>{count}</Text>
      </View>

      <TouchableOpacity style={styles.cartButton} onPress={onAddItem}>
        <Text style={styles.cartButtonText}>+ Add Item</Text>
      </TouchableOpacity>
    </View>
  );
}

function ProductCard({ product, onAddItem }: ProductCardProps) {
  return (
    <View style={styles.productCard}>
      <View style={styles.productAvatar}>
        <Text style={styles.productAvatarText}>{product.emoji}</Text>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>{product.price}</Text>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={onAddItem}>
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ZapMartScreen() {
  const [searchText, setSearchText] = useState('');
  const [cartCount, setCartCount] = useState(0);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  function handleAddItem() {
    setCartCount(cartCount + 1);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.brand}>ZapMart</Text>
        <Text style={styles.subtitle}>Quick groceries, faster cart practice.</Text>
      </View>

      <SearchBar searchText={searchText} onSearchChange={setSearchText} />
      <CartCounter count={cartCount} onAddItem={handleAddItem} />

      <Text style={styles.sectionTitle}>Products</Text>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard product={item} onAddItem={handleAddItem} />
        )}
        contentContainerStyle={styles.productList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No products found. Try another search.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7faf9',
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  header: {
    marginBottom: 20,
  },
  brand: {
    color: '#14213d',
    fontSize: 34,
    fontWeight: '800',
  },
  subtitle: {
    color: '#52616b',
    fontSize: 15,
    marginTop: 6,
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#dbe7e4',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchIcon: {
    color: '#168f6d',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  searchInput: {
    color: '#1f2933',
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  cartCard: {
    alignItems: 'center',
    backgroundColor: '#113f67',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
    padding: 18,
  },
  cartLabel: {
    color: '#b9d7ea',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cartCount: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 42,
    marginTop: 4,
  },
  cartButton: {
    backgroundColor: '#f9a826',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  cartButtonText: {
    color: '#1b1b1b',
    fontSize: 15,
    fontWeight: '800',
  },
  sectionTitle: {
    color: '#14213d',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },
  productList: {
    gap: 10,
    paddingBottom: 24,
  },
  productCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e3ece9',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 14,
  },
  productAvatar: {
    alignItems: 'center',
    backgroundColor: '#dff6f0',
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    marginRight: 12,
    width: 46,
  },
  productAvatarText: {
    color: '#168f6d',
    fontSize: 18,
    fontWeight: '900',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    color: '#1f2933',
    fontSize: 16,
    fontWeight: '800',
  },
  productPrice: {
    color: '#687782',
    fontSize: 14,
    marginTop: 3,
  },
  addButton: {
    backgroundColor: '#168f6d',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyText: {
    color: '#687782',
    fontSize: 15,
    paddingVertical: 24,
    textAlign: 'center',
  },
});
