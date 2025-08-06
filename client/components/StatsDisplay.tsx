import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DonutChart from './DonutChart';
import { useTheme } from '../contexts/ThemeContext';

interface StatsDisplayProps {
  libraryCount: number;
  totalFreeSeats: number;
  totalSeats: number;
}

export default function StatsDisplay({ libraryCount, totalFreeSeats, totalSeats }: StatsDisplayProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 16,
    },
    statItem: {
      alignItems: 'center',
      padding: 16,
      borderRadius: 8,
      justifyContent: 'center',
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    statItemContent: {
      marginHorizontal: 16,
      alignItems: 'center',
    }
  });

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{libraryCount}</Text>
        <Text style={styles.statLabel}>Bibliotheken</Text>
      </View>

      <View style={[styles.statItem, { flexDirection: 'row' }]}>
        <View style={styles.statItemContent}>
            <Text style={styles.statNumber}>{totalSeats}</Text>
            <Text style={styles.statLabel}>Gesamt Plätze</Text>
        </View>
        <DonutChart 
        freeSeats={totalFreeSeats}
        totalSeats={totalSeats}
      />
      </View>
    </View>
  );
}
