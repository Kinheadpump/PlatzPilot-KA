import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Platform } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import LibraryCard from '../../components/LibraryCard';
import { Library } from '../../types/library';
import { FavoritesService } from '../../services/FavoritesService';
import { LibraryDataService } from '../../services/LibraryDataService';
import { useTheme } from '../../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Favorites() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [favorites, setFavorites] = useState<Library[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate bottom padding based on platform and safe area
  const tabBarHeight = Platform.OS === 'ios' ? 50 : 60;
  const bottomPadding = Platform.OS === 'ios' ? insets.bottom : 8;
  const totalTabBarHeight = tabBarHeight + bottomPadding;

  const loadFavorites = async () => {
    try {
      const favoriteLibraries = await FavoritesService.getFavorites();
      setFavorites(favoriteLibraries);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadFavorites();
    setIsRefreshing(false);
  };

  const handleFavoriteChange = async (library: Library, isFavorite: boolean) => {
    // Reload favorites when a library is unfavorited
    if (!isFavorite) {
      await loadFavorites();
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

  // Load favorites when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const renderLibraryCard = ({ item }: { item: Library }) => (
    <LibraryCard
      library={item}
      onPress={() => handleLibraryPress(item)}
      onFavoriteChange={handleFavoriteChange}
    />
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    headerContainer: {
      backgroundColor: colors.background,
      height: 50,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      textAlign: 'center',
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 10,
    },
    hint: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    count: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    libraryList: {
      flex: 1,
    },
    listContent: {
      paddingBottom: totalTabBarHeight + 20, // Add space for tab bar + extra padding
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Favoriten</Text>
      </View>
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.subtitle}>
            Sie haben noch keine Bibliotheken als Favoriten gespeichert.
          </Text>
          <Text style={styles.hint}>
            Tippen Sie auf das Herz-Symbol bei einer Bibliothek, um sie zu Ihren Favoriten hinzuzufügen.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderLibraryCard}
          keyExtractor={(item, index) => `favorite-${index}`}
          style={styles.libraryList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
};
