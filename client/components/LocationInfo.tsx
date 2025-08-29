import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Section from './Section';

interface LocationInfoProps {
  building?: string | null;
  level?: string | null;
  room?: string | null;
  geoCoordinates: string;
}

export default function LocationInfo({ building, level, room, geoCoordinates }: LocationInfoProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
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
  });

  return (
    <Section title="Standort">
      {building && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Gebäude:</Text>
          <Text style={styles.infoValue}>{building}</Text>
        </View>
      )}
      {level && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Etage:</Text>
          <Text style={styles.infoValue}>{level}</Text>
        </View>
      )}
      {room && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Raum:</Text>
          <Text style={styles.infoValue}>{room}</Text>
        </View>
      )}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Koordinaten:</Text>
        <Text style={styles.infoValue}>{geoCoordinates}</Text>
      </View>
    </Section>
  );
}
