import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Section from './Section';

interface CurrentAvailabilityProps {
  freeSeats: number;
  totalSeats: number;
}

export default function CurrentAvailability({ freeSeats, totalSeats }: CurrentAvailabilityProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
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

  return (
    <Section title="Aktuelle Verfügbarkeit">
      <Text style={styles.currentSeats}>{freeSeats} freie Plätze</Text>
      <Text style={styles.totalSeats}>von {totalSeats} Plätzen insgesamt</Text>
    </Section>
  );
}
