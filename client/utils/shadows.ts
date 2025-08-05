import { Platform, ViewStyle } from 'react-native';

interface ShadowStyle {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}

export const createShadow = (
  elevation: number = 3,
  shadowColor: string = '#000',
  shadowOpacity: number = 0.1,
  shadowRadius: number = 5
): ShadowStyle => {
  if (Platform.OS === 'ios') {
    return {
      shadowColor,
      shadowOffset: {
        width: 0,
        height: Math.ceil(elevation / 2),
      },
      shadowOpacity,
      shadowRadius,
    };
  } else {
    return {
      elevation,
    };
  }
};

// Predefined shadow styles
export const shadows = {
  small: createShadow(2, '#000', 0.1, 3),
  medium: createShadow(4, '#000', 0.1, 5),
  large: createShadow(8, '#000', 0.15, 10),
};
