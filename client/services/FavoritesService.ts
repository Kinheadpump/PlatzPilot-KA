import AsyncStorage from '@react-native-async-storage/async-storage';
import { Library } from '../types/library';

const FAVORITES_STORAGE_KEY = 'PlatzPilot_Favorites';

type FavoritesChangeListener = () => void;

export class FavoritesService {
  private static favorites: Library[] = [];
  private static isInitialized = false;
  private static listeners: FavoritesChangeListener[] = [];

  // Add a listener for favorites changes
  static addChangeListener(listener: FavoritesChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of changes
  private static notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  // Initialize the service by loading favorites from storage
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        this.favorites = JSON.parse(stored);
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Error loading favorites:', error);
      this.favorites = [];
      this.isInitialized = true;
    }
  }

  // Get all favorite libraries
  static async getFavorites(): Promise<Library[]> {
    await this.initialize();
    return [...this.favorites];
  }

  // Check if a library is favorited
  static async isFavorite(library: Library): Promise<boolean> {
    await this.initialize();
    return this.favorites.some(fav => this.isSameLibrary(fav, library));
  }

  // Add a library to favorites
  static async addFavorite(library: Library): Promise<void> {
    await this.initialize();
    
    if (!await this.isFavorite(library)) {
      this.favorites.push(library);
      await this.saveFavorites();
      this.notifyListeners();
    }
  }

  // Remove a library from favorites
  static async removeFavorite(library: Library): Promise<void> {
    await this.initialize();
    
    this.favorites = this.favorites.filter(fav => !this.isSameLibrary(fav, library));
    await this.saveFavorites();
    this.notifyListeners();
  }

  // Toggle favorite status of a library
  static async toggleFavorite(library: Library): Promise<boolean> {
    await this.initialize();
    
    const isCurrentlyFavorite = await this.isFavorite(library);
    if (isCurrentlyFavorite) {
      await this.removeFavorite(library);
      return false;
    } else {
      await this.addFavorite(library);
      return true;
    }
  }

  // Get the count of favorite libraries
  static async getFavoriteCount(): Promise<number> {
    await this.initialize();
    return this.favorites.length;
  }

  // Save favorites to persistent storage
  private static async saveFavorites(): Promise<void> {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(this.favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }

  // Helper method to compare libraries (using name and coordinates as unique identifiers)
  private static isSameLibrary(lib1: Library, lib2: Library): boolean {
    return lib1.long_name === lib2.long_name && 
           lib1.geo_coordinates === lib2.geo_coordinates;
  }

  // Clear all favorites (useful for testing or user preference)
  static async clearAllFavorites(): Promise<void> {
    await this.initialize();
    this.favorites = [];
    await this.saveFavorites();
    this.notifyListeners();
  }
}
