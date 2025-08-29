import React from 'react';
import { SafeAreaView, StyleSheet, View, Button } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LibraryCard from '../../components/LibraryCard';
import { Library, LibraryCategory } from '../../types/library';
import AdditionalInfo from '@/components/AdditionalInfo';


export default function Sandbox() {
  // Sample data for AdditionalInfo component
  const sampleUrl = "https://www.bibliothek.kit.edu/cms/bib-sued.php";
  const sampleSubLocations = [
    "Lesesaal Erdgeschoss",
    "Gruppenarbeitsräume 1. OG",
    "Stille Zone 2. OG",
    "Computer-Arbeitsplätze",
    "Zeitschriften-Bereich"
  ];

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <AdditionalInfo 
            url={sampleUrl}
            subLocations={sampleSubLocations}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
});
