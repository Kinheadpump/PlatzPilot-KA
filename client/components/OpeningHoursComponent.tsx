import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { OpeningHours } from '../types/library';
import Section from './Section';

interface OpeningHoursProps {
  openingHours: OpeningHours;
}

export default function OpeningHoursComponent({ openingHours }: OpeningHoursProps) {
  const { colors } = useTheme();

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

  const formattedHours = formatOpeningHours(openingHours);

  const styles = StyleSheet.create({
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
  });

  return (
    <Section title="Öffnungszeiten">
      {formattedHours.map((item, index) => (
        <View key={index} style={styles.openingHoursRow}>
          <Text style={styles.dayLabel}>{item.day}:</Text>
          <Text style={styles.hoursValue}>{item.hours}</Text>
        </View>
      ))}
    </Section>
  );
}
