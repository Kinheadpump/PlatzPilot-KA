import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Settings() {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Einstellungen</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.subtitle}>App-Konfiguration und Preferences</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    backgroundColor: '#ffffff',
    height: 50,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
