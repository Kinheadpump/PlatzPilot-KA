import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import CategorySelector from '../components/CategorySelector';
import LibraryCard from '../components/LibraryCard';
import { Library, LibraryCategory } from '../types/library';
import { LibraryDataService } from '../services/LibraryDataService';

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState<LibraryCategory>('KITBIBS_N');

  // Get category counts using service
  const categoryCounts = useMemo(() => {
    return LibraryDataService.getCategoryCounts();
  }, []);

  // Get current libraries and stats using service
  const currentLibraries = LibraryDataService.getLibrariesByCategory(selectedCategory);
  const categoryStats = LibraryDataService.getCategoryStats(selectedCategory);


  const renderLibraryCard = ({ item }: { item: Library }) => (
    <LibraryCard
      library={item}
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

      {/* Statistiken */}
      {/* <StatsDisplay
        libraryCount={categoryStats.libraryCount}
        totalFreeSeats={categoryStats.totalFreeSeats}
        totalSeats={categoryStats.totalSeats}
      /> */}

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
