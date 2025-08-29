import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Section from './Section';

interface AdditionalInfoProps {
  url?: string | null;
  subLocations: string[];
}

export default function AdditionalInfo({ url, subLocations }: AdditionalInfoProps) {
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
    link: {
      fontSize: 14,
      color: colors.primary,
      textDecorationLine: 'underline',
    },
  });

  return (
    <Section title="Weitere Informationen">
      {url && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Website:</Text>
          <TouchableOpacity onPress={() => Linking.openURL(url)}>
            <Text style={styles.link}>Zur Website</Text>
          </TouchableOpacity>
        </View>
      )}
      {subLocations.length > 0 && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Teilbereiche:</Text>
          <Text style={styles.infoValue}>{subLocations.join(', ')}</Text>
        </View>
      )}
    </Section>
  );
}
