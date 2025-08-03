import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Library } from '../types/library';
import { LibraryDataService } from '../services/LibraryDataService';

interface LibraryCardProps {
  library: Library;
  onPress?: () => void;
}

const LibraryCard: React.FC<LibraryCardProps> = ({ library, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {library.long_name}
        </Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Gebäude:</Text>
        <Text style={styles.value}>
          {library.building || 'N/A'} 
          {library.level && ` - Ebene ${library.level}`}
          {library.room && ` - Raum ${library.room}`}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Plätze:</Text>
        <Text style={styles.value}>
          {library.free_seats_currently} / {library.available_seats} frei
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Heute:</Text>
        <Text style={styles.value}>{LibraryDataService.getCurrentDayHours(library)}</Text>
      </View>

      {library.url && (
        <Text style={styles.url} numberOfLines={1}>
          {library.url}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  occupancyIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  url: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default LibraryCard;
