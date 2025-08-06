import { SafeAreaView, StatusBar, StyleSheet, Platform } from 'react-native';
import React from 'react';
import BottomTabBar from '../components/BottomTabBar';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

function RootLayoutContent() {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
      <BottomTabBar />
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}
