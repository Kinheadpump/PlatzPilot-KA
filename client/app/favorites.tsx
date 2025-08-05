import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import LibraryCard from '../components/LibraryCard';
import { Library } from '../types/library';
import { FavoritesService } from '../services/FavoritesService';

export default function Favorites() {
  const [favorites, setFavorites] = useState<Library[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Load favorites when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const renderLibraryCard = ({ item }: { item: Library }) => (
    <LibraryCard
      library={item}
      onFavoriteChange={handleFavoriteChange}
    />
  );

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
              colors={['#000000ff']}
              tintColor={'#000000ff'}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    backgroundColor: '#ffffff',
    height: 50,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  hint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  count: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  libraryList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
});
