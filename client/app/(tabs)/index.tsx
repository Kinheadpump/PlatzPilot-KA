import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, StyleSheet, Text, View, Platform, RefreshControl, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import CategorySelector from '../../components/CategorySelector';
import LibraryCard from '../../components/LibraryCard';
import { Library, LibraryCategory } from '../../types/library';
import { LibraryDataService } from '../../services/LibraryDataService';
import { FavoritesService } from '../../services/FavoritesService';
import { useTheme } from '../../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Index() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<LibraryCategory>('ALL');
  const [currentLibraries, setCurrentLibraries] = useState<Library[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<LibraryCategory, number>>({} as Record<LibraryCategory, number>);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate bottom padding based on platform and safe area
  const tabBarHeight = Platform.OS === 'ios' ? 50 : 60;
  const bottomPadding = Platform.OS === 'ios' ? insets.bottom : 8;
  const totalTabBarHeight = tabBarHeight + bottomPadding;

  // Initialize services and load initial data
  useEffect(() => {
    initializeServices();
  }, []);

  // Load libraries when category changes
  useEffect(() => {
    loadLibrariesForCategory();
  }, [selectedCategory]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [])
  );

  const initializeServices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize both services
      await Promise.all([
        LibraryDataService.initialize(),
        FavoritesService.initialize()
      ]);

      // Load initial data
      await loadCategoryCounts();
      await loadLibrariesForCategory();

      console.log('✅ Services initialized successfully');
    } catch (err) {
      console.error('❌ Failed to initialize services:', err);
      setError('Failed to load library data. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategoryCounts = async () => {
    try {
      const counts = await LibraryDataService.getCategoryCounts();
      setCategoryCounts(counts);
    } catch (err) {
      console.error('Failed to load category counts:', err);
    }
  };

  const loadLibrariesForCategory = async () => {
    try {
      const libraries = await LibraryDataService.getLibrariesByCategory(selectedCategory);
      setCurrentLibraries(libraries);
    } catch (err) {
      console.error('Failed to load libraries for category:', selectedCategory, err);
      setCurrentLibraries([]);
    }
  };

  const refreshData = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      // Refresh data from server
      await LibraryDataService.refreshData();
      
      // Reload category counts and current libraries
      await loadCategoryCounts();
      await loadLibrariesForCategory();

      console.log('✅ Data refreshed successfully');
    } catch (err) {
      console.error('❌ Failed to refresh data:', err);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLibraryPress = async (library: Library) => {
    try {
      // Find the index of this library in the all libraries array
      const allLibraries = await LibraryDataService.getLibrariesByCategory('ALL');
      const libraryIndex = allLibraries.findIndex(lib => lib.long_name === library.long_name);
      console.log('Navigating to library:', library.long_name);
      console.log('Library index:', libraryIndex);
      router.push(`/library/${libraryIndex}` as any);
    } catch (err) {
      console.error('Failed to navigate to library:', err);
    }
  };

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
      paddingBottom: totalTabBarHeight + 20, // Add space for tab bar + extra padding
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
      marginBottom: 10,
    },
    errorText: {
      fontSize: 14,
      textAlign: 'center',
      color: colors.error,
      paddingHorizontal: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 10,
    }
  });

  const renderLibraryCard = ({ item }: { item: Library }) => (
    <LibraryCard
      library={item}
      onPress={() => handleLibraryPress(item)}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.contentContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Lade Bibliotheksdaten...</Text>
        </View>
      </View>
    );
  }

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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {error ? (
              <>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Fehler beim Laden der Daten
                </Text>
                <Text style={styles.errorText}>
                  {error}
                </Text>
              </>
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Keine Bibliotheken in dieser Kategorie gefunden
              </Text>
            )}
          </View>
        }
      />
    </View>
  );
}
