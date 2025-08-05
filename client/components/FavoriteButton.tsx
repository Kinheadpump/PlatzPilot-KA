import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Library } from '../types/library';
import { FavoritesService } from '../services/FavoritesService';

interface FavoriteButtonProps {
  library: Library;
  onFavoriteChange?: (library: Library, isFavorite: boolean) => void;
  size?: number;
  style?: any;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  library, 
  onFavoriteChange, 
  size = 28, 
  style 
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const favoriteStatus = await FavoritesService.isFavorite(library);
      setIsFavorite(favoriteStatus);
    };
    checkFavoriteStatus();
  }, [library]);

  const handleFavoritePress = async () => {
    try {
      const newFavoriteStatus = await FavoritesService.toggleFavorite(library);
      setIsFavorite(newFavoriteStatus);
      onFavoriteChange?.(library, newFavoriteStatus);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <Pressable
      style={[styles.favoriteButton, style]}
      onPress={handleFavoritePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={size}
        color={isFavorite ? '#ff4757' : '#666'}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  favoriteButton: {
    paddingHorizontal: 24,
  },
});

export default FavoriteButton;
