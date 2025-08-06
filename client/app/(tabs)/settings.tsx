import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeMode } from '../../contexts/ThemeContext';

export default function Settings() {
  const { colors, themeMode, setThemeMode } = useTheme();

  const themeOptions: { mode: ThemeMode; label: string; icon: string; description: string }[] = [
    {
      mode: 'light',
      label: 'Hell',
      icon: 'sunny',
      description: 'Immer helles Design verwenden'
    },
    {
      mode: 'dark',
      label: 'Dunkel',
      icon: 'moon',
      description: 'Immer dunkles Design verwenden'
    },
    {
      mode: 'auto',
      label: 'Automatisch',
      icon: 'phone-portrait',
      description: 'Systemeinstellung folgen'
    }
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerContainer: {
      backgroundColor: colors.background,
      height: 50,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      textAlign: 'center',
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    scrollContent: {
      flex: 1,
    },
    section: {
      marginTop: 24,
      marginHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    optionCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedOption: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    optionIcon: {
      marginRight: 12,
    },
    optionTextContainer: {
      flex: 1,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    checkIcon: {
      marginLeft: 8,
    },
    infoSection: {
      marginTop: 32,
      marginHorizontal: 16,
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Einstellungen</Text>
      </View>
      
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Design</Text>
          {themeOptions.map((option) => (
            <Pressable
              key={option.mode}
              style={[
                styles.optionCard,
                themeMode === option.mode && styles.selectedOption
              ]}
              onPress={() => setThemeMode(option.mode)}
            >
              <View style={styles.optionContent}>
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={colors.primary}
                  style={styles.optionIcon}
                />
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>{option.label}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                {themeMode === option.mode && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.primary}
                    style={styles.checkIcon}
                  />
                )}
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Über Dark Mode</Text>
          <Text style={styles.infoText}>
            Der automatische Modus passt das App-Design an Ihre Systemeinstellungen an. 
            Bei &quot;Hell&quot; wird immer das helle Design verwendet, bei &quot;Dunkel&quot; immer das dunkle Design. 
            Das dunkle Design schont bei OLED-Displays den Akku und ist bei schwachem Licht angenehmer für die Augen.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
