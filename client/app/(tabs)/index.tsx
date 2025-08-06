import React, { useMemo, useState, useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import CategorySelector from '../../components/CategorySelector';
import LibraryCard from '../../components/LibraryCard';
import { Library, LibraryCategory } from '../../types/library';
import { LibraryDataService } from '../../services/LibraryDataService';
import { FavoritesService } from '../../services/FavoritesService';
import { useTheme } from '../../contexts/ThemeContext';

export default function Index() {
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<LibraryCategory>('ALL');

  // Initialize FavoritesService when component mounts
  useEffect(() => {
    FavoritesService.initialize();
  }, []);

  const handleFavoriteChange = (library: Library, isFavorite: boolean) => {
    // Optional: You could add some feedback here like a toast message
    console.log(`Library ${library.long_name} ${isFavorite ? 'added to' : 'removed from'} favorites`);
  };

  const handleLibraryPress = (library: Library) => {
    // Find the index of this library in the all libraries array
    const allLibraries = LibraryDataService.getLibrariesByCategory('ALL');
    const libraryIndex = allLibraries.findIndex(lib => lib.long_name === library.long_name);
    console.log('Navigating to library:', library.long_name);
    console.log('Library index:', libraryIndex);
    router.push(`/library/${libraryIndex}` as any);
  };

  // Get category counts using service
  const categoryCounts = useMemo(() => {
    return LibraryDataService.getCategoryCounts();
  }, []);

  // Get current libraries using service
  const currentLibraries = LibraryDataService.getLibrariesByCategory(selectedCategory);

  const styles = StyleSheet.create({
    contentContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    libraryList: {
      flex: 1,
      backgroundColor: colors.background,
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
      textAlign: 'center',
    }
  });

  const renderLibraryCard = ({ item }: { item: Library }) => (
    <LibraryCard
      library={item}
      onPress={() => handleLibraryPress(item)}
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
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Keine Bibliotheken in dieser Kategorie gefunden
            </Text>
          </View>
        }
      />
    </View>
  );
}
