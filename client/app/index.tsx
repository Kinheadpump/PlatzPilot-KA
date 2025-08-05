import React, { useMemo, useState, useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import CategorySelector from '../components/CategorySelector';
import LibraryCard from '../components/LibraryCard';
import { Library, LibraryCategory } from '../types/library';
import { LibraryDataService } from '../services/LibraryDataService';
import { FavoritesService } from '../services/FavoritesService';

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState<LibraryCategory>('ALL');

  // Initialize FavoritesService when component mounts
  useEffect(() => {
    FavoritesService.initialize();
  }, []);

  const handleFavoriteChange = (library: Library, isFavorite: boolean) => {
    // Optional: You could add some feedback here like a toast message
    console.log(`Library ${library.long_name} ${isFavorite ? 'added to' : 'removed from'} favorites`);
  };

  // Get category counts using service
  const categoryCounts = useMemo(() => {
    return LibraryDataService.getCategoryCounts();
  }, []);

  // Get current libraries using service
  const currentLibraries = LibraryDataService.getLibrariesByCategory(selectedCategory);


  const renderLibraryCard = ({ item }: { item: Library }) => (
    <LibraryCard
      library={item}
      onFavoriteChange={handleFavoriteChange}
    />
  );

  return (
    <View style={styles.contentContainer}>
      {/* Kategorie-Selektor */}
      <CategorySelector
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categoryCounts={categoryCounts}
      />

      {/* Bibliotheksliste */}
      <FlatList
        data={currentLibraries}
        renderItem={renderLibraryCard}
        keyExtractor={(item, index) => `${selectedCategory}-${index}`}
        style={styles.libraryList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Keine Bibliotheken in dieser Kategorie gefunden
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  libraryList: {
    flex: 1,
    backgroundColor: "#ffffffff"
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  }
});
