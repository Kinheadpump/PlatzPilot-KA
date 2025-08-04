import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Library } from '../types/library';
import { LibraryDataService } from '../services/LibraryDataService';

interface LibraryCardProps {
  library: Library;
  onPress?: () => void;
}

const LibraryCard: React.FC<LibraryCardProps> = ({ library, onPress }) => {
  const isLibraryOpen = () => {
    const now = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[now.getDay()];
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    const todayHours = library.opening_hours[currentDay as keyof typeof library.opening_hours];

    if (!todayHours || todayHours.length === 0) {
      return false; // Closed if no hours defined
    }

    // Check if current time falls within any of the opening periods
    return todayHours.some(([start, end]) => {
      return currentTime >= start && currentTime <= end;
    });
  };

  const isOpen = isLibraryOpen();

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <Text style={styles.title} numberOfLines={2}>
            {library.long_name}
          </Text>
          <Text style={styles.subTitle}>
            {library.level ? `${library.level}. Stock` : 'Ebene: N/A'}
          </Text>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.freeSeatsNumber}>
            {library.free_seats_currently}
          </Text>
          <Text style={styles.freeSeatsLabel}>
            Freie Plätze
          </Text>
        </View>
      </View>

      <View style={styles.statusSection}>
        <View style={styles.statusRow}>
          <View style={[
            styles.statusDot,
            isOpen ? styles.openDot : styles.closedDot
          ]} />
          <Text style={
            isOpen ? styles.openLabel : styles.closedLabel
          }>
            {isOpen ? 'Geöffnet' : 'Geschlossen'}
          </Text>
        </View>
        <Text style={styles.hoursText}>
          {LibraryDataService.getCurrentDayHours(library)}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'flex-start',
  },
  leftSection: {
    flex: 1,
    marginRight: 12,
  },
  rightSection: {
    alignItems: 'center',
    minWidth: 80,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '300',
    color: "#747474ff",
  },
  freeSeatsNumber: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  freeSeatsLabel: {
    fontSize: 14,
    textAlign: 'center',
    color: "#747474ff",
  },
  statusSection: {
    marginTop: 12,
    paddingTop: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  openLabel: {
    color: '#2e7d32',
    fontSize: 14,
    fontWeight: '600',
  },
  closedLabel: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: '600',
  },
  openDot: {
    backgroundColor: '#2e7d32',
  },
  closedDot: {
    backgroundColor: '#d32f2f',
  },
  hoursText: {
    fontSize: 13,
    color: '#666',
  },
});

export default LibraryCard;
