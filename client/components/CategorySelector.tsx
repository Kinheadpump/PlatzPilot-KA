import React, { useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LibraryCategory, categoryDisplayNames } from '../types/library';
import { useTheme } from '../contexts/ThemeContext';

interface CategorySelectorProps {
  selectedCategory: LibraryCategory;
  onCategoryChange: (category: LibraryCategory) => void;
  categoryCounts: Record<LibraryCategory, number>;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange,
  categoryCounts,
}) => {
  const { colors } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const categories = (Object.keys(categoryDisplayNames) as LibraryCategory[])
    .sort((a, b) => categoryDisplayNames[a].localeCompare(categoryDisplayNames[b]));

  // Responsive Height basierend auf Bildschirmgröße
  const screenHeight = Dimensions.get('window').height;
  const maxDropdownHeight = Math.min(screenHeight * 0.4, categories.length * 60); // 40% der Bildschirmhöhe oder 60px pro Item

  const toggleDropdown = () => {
    if (isDropdownOpen) {
      // Schließen: animiere zu Höhe 0
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setIsDropdownOpen(false));
    } else {
      // Öffnen: setze erst auf offen, dann animiere zu voller Höhe
      setIsDropdownOpen(true);
      Animated.timing(animatedHeight, {
        toValue: maxDropdownHeight, // Responsive Höhe basierend auf Bildschirmgröße
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleCategorySelect = (category: LibraryCategory) => {
    onCategoryChange(category);
    // Dropdown schließen
    Animated.timing(animatedHeight, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setIsDropdownOpen(false));
  };

  const styles = StyleSheet.create({
    container: {
      zIndex: 1000,
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
    },
    // Dropdown Button Styles
    dropdownButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      backgroundColor: colors.background,
      height: 50,
      paddingHorizontal: 16,
    },
    textContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    categoryText: {
      textAlign: 'center',
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    arrowText: {
      right: 0,
      fontSize: 16,
      color: colors.text,
    },
    arrowTextOpen: {
      transform: [{ rotate: '180deg' }],
    },
    // Dropdown Styles (ersetzt Modal)
    dropdownContainer: {
      position: 'absolute',
      top: 50,
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      elevation: 10,
      overflow: 'hidden',
      zIndex: 1001,
    },
    dropdownShadow: {
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    scrollContainer: {
      flex: 1,
    },
    categoryItem: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    selectedCategoryItem: {
      backgroundColor: colors.border,
    },
    categoryItemContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    categoryItemText: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    selectedCategoryText: {
      fontWeight: 'bold',
      color: colors.text,
    },
    checkmark: {
      fontSize: 18,
      color: colors.primary,
      marginLeft: 10,
    },
  });

  return (
    <>
      <View style={styles.container}>
        {/* Dropdown Button */}
        <Pressable onPress={toggleDropdown}>
          <View style={styles.dropdownButton}>
            <View style={styles.textContainer}>
              <Text numberOfLines={1} style={styles.categoryText}>
                {categoryDisplayNames[selectedCategory]}
              </Text>
            </View>
            <Text style={[styles.arrowText, isDropdownOpen && styles.arrowTextOpen]}>▼</Text>
          </View>
        </Pressable>
      </View>

      {/* Backdrop for closing dropdown */}
      {isDropdownOpen && (
        <Pressable
          style={styles.backdrop}
          onPress={() => {
            Animated.timing(animatedHeight, {
              toValue: 0,
              duration: 300,
              useNativeDriver: false,
            }).start(() => setIsDropdownOpen(false));
          }}
        />
      )}

      {/* Animated Dropdown - positioned absolutely but outside container */}
      <Animated.View
        style={[
          styles.dropdownContainer,
          { height: animatedHeight },
          isDropdownOpen && styles.dropdownShadow
        ]}
      >
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          scrollEnabled={isDropdownOpen}
        >
          {categories.map((category) => (
            <Pressable
              key={category}
              style={[
                styles.categoryItem,
                selectedCategory === category && styles.selectedCategoryItem
              ]}
              onPress={() => handleCategorySelect(category)}
            >
              <View style={styles.categoryItemContent}>
                <Text
                  style={[
                    styles.categoryItemText,
                    selectedCategory === category && styles.selectedCategoryText
                  ]}
                  numberOfLines={1}
                >
                  {categoryDisplayNames[category]}
                </Text>
                {selectedCategory === category && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>
    </>
  );
};

export default CategorySelector;
