import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface LibraryStatusBadgeProps {
  isClosed: boolean;
}

export default function LibraryStatusBadge({ isClosed }: LibraryStatusBadgeProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
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
  });

  return (
    <View style={[styles.statusBadge, isClosed ? styles.closedBadge : styles.openBadge]}>
      <Text style={[styles.statusText, isClosed ? styles.closedText : styles.openText]}>
        {isClosed ? 'Geschlossen' : 'Geöffnet'}
      </Text>
    </View>
  );
}
