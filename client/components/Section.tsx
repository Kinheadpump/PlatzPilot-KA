import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Section({ title, children, style }: SectionProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
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
  });

  return (
    <View style={[styles.section, style]}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      {children}
    </View>
  );
}
