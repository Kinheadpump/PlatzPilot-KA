import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Library } from '../types/library';
import { LibraryDataService } from '../services/LibraryDataService';
import { useTheme } from '../contexts/ThemeContext';

interface LibraryDetailProps {
  library: Library;
  onClose: () => void;
}

const LibraryDetail: React.FC<LibraryDetailProps> = ({ library }) => {
  const { colors } = useTheme();
  
  const formatOpeningHours = () => {
    const days = [
      { key: 'Monday', label: 'Montag' },
      { key: 'Tuesday', label: 'Dienstag' },
      { key: 'Wednesday', label: 'Mittwoch' },
      { key: 'Thursday', label: 'Donnerstag' },
      { key: 'Friday', label: 'Freitag' },
      { key: 'Saturday', label: 'Samstag' },
      { key: 'Sunday', label: 'Sonntag' },
    ];

    return days.map(day => {
      const hours = library.opening_hours[day.key as keyof typeof library.opening_hours];
      const hoursText = LibraryDataService.formatOpeningHours(hours);
      
      return { day: day.label, hours: hoursText };
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 20,
      backgroundColor: colors.primary,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: 8,
    },
    url: {
      fontSize: 14,
      color: '#e3f2fd',
    },
    section: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    infoGrid: {
      gap: 8,
    },
    infoItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    infoLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 14,
      color: colors.text,
    },
    seatsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
    },
    seatsInfo: {
      alignItems: 'center',
    },
    seatsNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
    },
    seatsLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    openingHoursRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    dayLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
      width: 80,
    },
    hoursText: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
      textAlign: 'right',
    },
    subLocation: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{library.long_name}</Text>
        {library.url && (
          <Text style={styles.url}>{library.url}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Standort</Text>
        <View style={styles.infoGrid}>
          {library.building && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Gebäude:</Text>
              <Text style={styles.infoValue}>{library.building}</Text>
            </View>
          )}
          {library.level && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Ebene:</Text>
              <Text style={styles.infoValue}>{library.level}</Text>
            </View>
          )}
          {library.room && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Raum:</Text>
              <Text style={styles.infoValue}>{library.room}</Text>
            </View>
          )}
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Koordinaten:</Text>
            <Text style={styles.infoValue}>{library.geo_coordinates}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Platzverfügbarkeit</Text>
        <View style={styles.seatsContainer}>
          <View style={styles.seatsInfo}>
            <Text style={styles.seatsNumber}>{library.free_seats_currently}</Text>
            <Text style={styles.seatsLabel}>Freie Plätze</Text>
          </View>
          <View style={styles.seatsInfo}>
            <Text style={styles.seatsNumber}>{library.available_seats}</Text>
            <Text style={styles.seatsLabel}>Gesamt</Text>
          </View>
          <View style={styles.seatsInfo}>
            <Text style={styles.seatsNumber}>{LibraryDataService.getLibraryOccupancyPercentage(library)}%</Text>
            <Text style={styles.seatsLabel}>Belegt</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Öffnungszeiten</Text>
        {formatOpeningHours().map((dayInfo, index) => (
          <View key={index} style={styles.openingHoursRow}>
            <Text style={styles.dayLabel}>{dayInfo.day}:</Text>
            <Text style={styles.hoursText}>{dayInfo.hours}</Text>
          </View>
        ))}
      </View>

      {library.sub_locations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Unterbereiche</Text>
          {library.sub_locations.map((location, index) => (
            <Text key={index} style={styles.subLocation}>• {location}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default LibraryDetail;
