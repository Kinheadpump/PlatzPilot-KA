import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Favorites() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favoriten</Text>
      <Text style={styles.subtitle}>Ihre gespeicherten Bibliotheken</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
