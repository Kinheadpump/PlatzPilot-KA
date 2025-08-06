import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Library } from '../types/library';
import { LibraryDataService } from '../services/LibraryDataService';
import FavoriteButton from './FavoriteButton';
import { useTheme } from '../contexts/ThemeContext';

interface LibraryCardProps {
  library: Library;
  onPress?: () => void;
  onFavoriteChange?: (library: Library, isFavorite: boolean) => void;
}

const LibraryCard: React.FC<LibraryCardProps> = ({ library, onPress, onFavoriteChange }) => {
  const { colors } = useTheme();
  
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

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 16,
      marginVertical: 8,
      marginHorizontal: 16,
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
    favoriteButtonContainer: {
      marginBottom: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    subTitle: {
      fontSize: 14,
      fontWeight: '300',
      color: colors.textSecondary,
    },
    freeSeatsNumber: {
      fontSize: 24,
      fontWeight: '600',
      textAlign: 'center',
      color: colors.text,
    },
    freeSeatsLabel: {
      fontSize: 14,
      textAlign: 'center',
      color: colors.textSecondary,
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
      color: colors.success,
      fontSize: 14,
      fontWeight: '600',
    },
    closedLabel: {
      color: colors.error,
      fontSize: 14,
      fontWeight: '600',
    },
    openDot: {
      backgroundColor: colors.success,
    },
    closedDot: {
      backgroundColor: colors.error,
    },
    hoursText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    bottomPart: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: 'flex-start',
      marginTop: 12,
      paddingTop: 12,
    },
  });

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

      <View style={styles.bottomPart}>
        <View>
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
        <View>
          <FavoriteButton
            library={library}
            onFavoriteChange={onFavoriteChange}
            size={32}
            style={styles.favoriteButtonContainer}
          />
        </View>
      </View>
    </Pressable>
  );
};

export default LibraryCard;
