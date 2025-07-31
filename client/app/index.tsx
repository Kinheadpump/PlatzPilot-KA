import React, { useMemo, useState } from 'react';
import { FlatList, Modal, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CategorySelector from '../components/CategorySelector';
import LibraryCard from '../components/LibraryCard';
import LibraryDetail from '../components/LibraryDetail';
import { Library, LibraryCategory, LibraryData, categoryDisplayNames } from '../types/library';

// Import der JSON-Daten
import libraryDataJson from '../assets/example.json';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState<LibraryCategory>('ALLBIBS');
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Typisierung der JSON-Daten
  const libraryData = libraryDataJson as LibraryData;

  // Berechnung der Anzahl von Bibliotheken pro Kategorie
  const categoryCounts = useMemo(() => {
    const counts = {} as Record<LibraryCategory, number>;
    Object.keys(categoryDisplayNames).forEach(category => {
      const categoryKey = category as LibraryCategory;
      counts[categoryKey] = libraryData[categoryKey]?.length || 0;
    });
    return counts;
  }, [libraryData]);

  // Aktuell ausgewählte Bibliotheken
  const currentLibraries = libraryData[selectedCategory] || [];

  // Gesamtstatistiken für die ausgewählte Kategorie
  const totalSeats = currentLibraries.reduce((sum, lib) => sum + lib.available_seats, 0);
  const totalFreeSeats = currentLibraries.reduce((sum, lib) => sum + lib.free_seats_currently, 0);

  const handleLibraryPress = (library: Library) => {
    setSelectedLibrary(library);
    setDetailModalVisible(true);
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedLibrary(null);
  };

  const renderLibraryCard = ({ item }: { item: Library }) => (
    <LibraryCard 
      library={item} 
      onPress={() => handleLibraryPress(item)}
    />
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />


        {/* Kategorie-Selektor */}
        <CategorySelector
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categoryCounts={categoryCounts}
        />

        {/* Statistiken */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{currentLibraries.length}</Text>
            <Text style={styles.statLabel}>Bibliotheken</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalFreeSeats}</Text>
            <Text style={styles.statLabel}>Freie Plätze</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalSeats}</Text>
            <Text style={styles.statLabel}>Gesamt Plätze</Text>
          </View>
        </View>

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

        {/* Detail Modal */}
        <Modal
          visible={detailModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={closeDetailModal}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeDetailModal}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            {selectedLibrary && (
              <LibraryDetail 
                library={selectedLibrary}
                onClose={closeDetailModal}
              />
            )}
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
});
