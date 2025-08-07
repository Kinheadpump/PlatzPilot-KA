import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { LibraryDataService } from '../../services/LibraryDataService';
import { Library } from '../../types/library';

export default function LibraryDetail() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const allLibraries = LibraryDataService.getLibrariesByCategory('ALL');
  
  // Find the library by its index
  const libraryIndex = parseInt(id || '0', 10);
  const library = allLibraries[libraryIndex];
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginTop: 50,
    },
    notFound: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 50,
    },
  });

  if (!library) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Library not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{library.long_name}</Text>
    </View>
  );
}
