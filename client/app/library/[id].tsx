import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { LibraryDataService } from '../../services/LibraryDataService';
import LibraryStatusBadge from '../../components/LibraryStatusBadge';
import CurrentAvailability from '../../components/CurrentAvailability';
import PredictionsChart from '../../components/PredictionsChart';
import LocationInfo from '../../components/LocationInfo';
import OpeningHoursComponent from '../../components/OpeningHoursComponent';
import AdditionalInfo from '../../components/AdditionalInfo';

export default function LibraryDetail() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const allLibraries = LibraryDataService.getLibrariesByCategory('ALL');
  
  // Find the library by its index
  const libraryIndex = parseInt(id || '0', 10);
  const library = allLibraries[libraryIndex];

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
    notFound: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 50,
    },
  });

  if (!library) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Library not found</Text>
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
