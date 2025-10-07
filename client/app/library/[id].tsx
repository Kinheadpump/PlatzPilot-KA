import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { LibraryDataService } from '../../services/LibraryDataService';
import { Library } from '../../types/library';
import LibraryStatusBadge from '../../components/LibraryStatusBadge';
import CurrentAvailability from '../../components/CurrentAvailability';
import PredictionsChart from '../../components/PredictionsChart';
import LocationInfo from '../../components/LocationInfo';
import OpeningHoursComponent from '../../components/OpeningHoursComponent';
import AdditionalInfo from '../../components/AdditionalInfo';

export default function LibraryDetail() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [library, setLibrary] = useState<Library | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadLibrary();
  }, [id]);

  const loadLibrary = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const allLibraries = await LibraryDataService.getLibrariesByCategory('ALL');
      const libraryIndex = parseInt(id || '0', 10);
      const foundLibrary = allLibraries[libraryIndex];

      if (foundLibrary) {
        setLibrary(foundLibrary);
      } else {
        setError('Library not found');
      }
    } catch (err) {
      console.error('Failed to load library:', err);
      setError('Failed to load library data');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
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
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    errorText: {
      fontSize: 18,
      color: colors.error,
      textAlign: 'center',
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Lade Bibliotheksdaten...</Text>
        </View>
      </View>
    );
  }

  if (error || !library) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || 'Library not found'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>{library.long_name}</Text>

      {/* Status Badge */}
      <LibraryStatusBadge isClosed={library.is_closed} />

      {/* Current Availability */}
      <CurrentAvailability 
        freeSeats={library.free_seats_currently} 
        totalSeats={library.available_seats} 
      />

      {/* Predictions Chart */}
      {library.predictions && library.predictions.length > 0 && (
        <PredictionsChart 
          predictions={library.predictions} 
          currentFreeSeats={library.free_seats_currently} 
        />
      )}

      {/* Location Information */}
      <LocationInfo 
        building={library.building}
        level={library.level}
        room={library.room}
        geoCoordinates={library.geo_coordinates}
      />

      {/* Opening Hours */}
      <OpeningHoursComponent openingHours={library.opening_hours} />

      {/* Additional Information */}
      <AdditionalInfo 
        url={library.url}
        subLocations={library.sub_locations}
      />
    </ScrollView>
  );
}
