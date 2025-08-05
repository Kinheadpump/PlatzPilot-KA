import { SafeAreaView, StatusBar, StyleSheet, Platform } from 'react-native';
import React from 'react';
import BottomTabBar from '../components/BottomTabBar';

export default function RootLayout() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <BottomTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
});
