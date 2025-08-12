import React from 'react';
import { StyleSheet, Text, View, ScrollView, Linking, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { LibraryDataService } from '../../services/LibraryDataService';
import { Library, OpeningHours } from '../../types/library';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function LibraryDetail() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const allLibraries = LibraryDataService.getLibrariesByCategory('ALL');
  
  // Find the library by its index
  const libraryIndex = parseInt(id || '0', 10);
  const library = allLibraries[libraryIndex];

  // Format opening hours for display
  const formatOpeningHours = (openingHours: OpeningHours) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    
    return days.map((day, index) => {
      const hours = openingHours[day as keyof OpeningHours];
      const formattedHours = hours.length === 0 
        ? 'Geschlossen' 
        : hours.map(([start, end]) => `${start}-${end}`).join(', ');
      
      return { day: dayNames[index], hours: formattedHours };
    });
  };

  // Create chart data for predictions
  const createChartData = () => {
    if (!library) return null;

    // Start with current free seats
    const currentTime = new Date();
    const data = [library.free_seats_currently, ...library.predictions];
    
    // Create labels for time intervals (5-minute intervals)
    const labels = [];
    for (let i = 0; i < data.length; i++) {
      const time = new Date(currentTime.getTime() + i * 5 * 60000); // 5 minutes intervals
      labels.push(time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
    }

    return {
      labels: labels.filter((_, index) => index % 2 === 0), // Show every other label to avoid crowding
      datasets: [{
        data: data,
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // Green color
        strokeWidth: 2
      }]
    };
  };

  const chartData = createChartData();

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
    section: {
      marginBottom: 25,
      padding: 15,
      backgroundColor: colors.surface,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 10,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    infoLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
    },
    infoValue: {
      fontSize: 14,
      color: colors.text,
      flex: 2,
      textAlign: 'right',
    },
    link: {
      fontSize: 14,
      color: colors.primary,
      textDecorationLine: 'underline',
    },
    openingHoursRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    dayLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      width: 30,
    },
    hoursValue: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
      textAlign: 'right',
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      alignSelf: 'flex-start',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    openBadge: {
      backgroundColor: '#E8F5E8',
    },
    closedBadge: {
      backgroundColor: '#FEE8E8',
    },
    openText: {
      color: '#2E7D32',
    },
    closedText: {
      color: '#C62828',
    },
    chartContainer: {
      alignItems: 'center',
      marginTop: 10,
    },
    chartTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 10,
    },
    notFound: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 50,
    },
    currentSeats: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 10,
    },
    totalSeats: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  if (!library) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Library not found</Text>
      </View>
    );
  }

  const openingHours = formatOpeningHours(library.opening_hours);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>{library.long_name}</Text>

      {/* Status Badge */}
      <View style={[styles.statusBadge, library.is_closed ? styles.closedBadge : styles.openBadge]}>
        <Text style={[styles.statusText, library.is_closed ? styles.closedText : styles.openText]}>
          {library.is_closed ? 'Geschlossen' : 'Geöffnet'}
        </Text>
      </View>

      {/* Current Availability */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aktuelle Verfügbarkeit</Text>
        <Text style={styles.currentSeats}>{library.free_seats_currently} freie Plätze</Text>
        <Text style={styles.totalSeats}>von {library.available_seats} Plätzen insgesamt</Text>
      </View>

      {/* Predictions Chart */}
      {chartData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vorhersage (nächste Stunden)</Text>
          <Text style={styles.chartTitle}>Freie Plätze über Zeit</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={screenWidth - 70}
              height={200}
              chartConfig={{
                backgroundColor: colors.surface,
                backgroundGradientFrom: colors.surface,
                backgroundGradientTo: colors.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                labelColor: (opacity = 1) => colors.textSecondary,
                style: {
                  borderRadius: 10,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#4CAF50'
                }
              }}
              bezier
              style={{
                borderRadius: 10,
              }}
            />
          </View>
        </View>
      )}

      {/* Location Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Standort</Text>
        {library.building && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gebäude:</Text>
            <Text style={styles.infoValue}>{library.building}</Text>
          </View>
        )}
        {library.level && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Etage:</Text>
            <Text style={styles.infoValue}>{library.level}</Text>
          </View>
        )}
        {library.room && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Raum:</Text>
            <Text style={styles.infoValue}>{library.room}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Koordinaten:</Text>
          <Text style={styles.infoValue}>{library.geo_coordinates}</Text>
        </View>
      </View>

      {/* Opening Hours */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Öffnungszeiten</Text>
        {openingHours.map((item, index) => (
          <View key={index} style={styles.openingHoursRow}>
            <Text style={styles.dayLabel}>{item.day}:</Text>
            <Text style={styles.hoursValue}>{item.hours}</Text>
          </View>
        ))}
      </View>

      {/* Additional Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weitere Informationen</Text>
        {library.url && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Website:</Text>
            <TouchableOpacity onPress={() => Linking.openURL(library.url!)}>
              <Text style={styles.link}>Zur Website</Text>
            </TouchableOpacity>
          </View>
        )}
        {library.sub_locations.length > 0 && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teilbereiche:</Text>
            <Text style={styles.infoValue}>{library.sub_locations.join(', ')}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
