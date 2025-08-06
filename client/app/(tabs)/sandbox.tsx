import React from 'react';
import { SafeAreaView, StyleSheet, View, Button } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LibraryCard from '../../components/LibraryCard';
import { Library, LibraryCategory } from '../../types/library';


export default function Sandbox() {
  const sampleLibrary: Library = {
    "long_name": "KIT-Bibliothek S\u00fcd, Lesesaal Medienzentrum, 3. OG Altbau",
    "url": "https://www.bibliothek.kit.edu/lage-anschrift.php#BIB-S",
    "building": "30.50",
    "level": "3",
    "room": null,
    "geo_coordinates": "49.01125;8.41638",
    "available_seats": 72,
    "opening_hours": {
      "Monday": [
        [
          "00:00",
          "23:59"
        ]
      ],
      "Tuesday": [
        [
          "00:00",
          "23:59"
        ]
      ],
      "Wednesday": [
        [
          "00:00",
          "23:59"
        ]
      ],
      "Thursday": [
        [
          "00:00",
          "23:59"
        ]
      ],
      "Friday": [
        [
          "00:00",
          "23:59"
        ]
      ],
      "Saturday": [
        [
          "00:00",
          "23:59"
        ]
      ],
      "Sunday": [
        [
          "00:00",
          "23:59"
        ]
      ]
    },
    "sub_locations": [],
    "free_seats_currently": 19
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <LibraryCard library={sampleLibrary} />
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
