import { Library, LibraryCategory, LibraryData, categoryDisplayNames } from '../types/library';
import ApiService from './ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'PlatzPilot_LibraryData';
const CACHE_EXPIRY_KEY = 'PlatzPilot_LibraryData_Expiry';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const AUTO_REFRESH_INTERVAL = 2 * 60 * 1000; // 2 minutes

type DataChangeListener = (data: LibraryData) => void;

export class LibraryDataService {
    private static libraryData: LibraryData | null = null;
    private static lastFetchTime: number = 0;
    private static isFetching: boolean = false;
    private static listeners: DataChangeListener[] = [];
    private static refreshInterval: ReturnType<typeof setInterval> | null = null;
    private static isInitialized: boolean = false;

    /**
     * Initialize the service - loads cached data and starts auto-refresh
     */
    static async initialize(): Promise<void> {
        if (this.isInitialized) return;
        
        try {
            // Try to load cached data first
            await this.loadFromCache();
            
            // Fetch fresh data in background
            this.fetchFreshData();
            
            // Start auto-refresh
            this.startAutoRefresh();
            
            this.isInitialized = true;
            console.log('✅ LibraryDataService initialized');
        } catch (error) {
            console.error('❌ Failed to initialize LibraryDataService:', error);
            throw error;
        }
    }

    /**
     * Add a listener for data changes
     */
    static addChangeListener(listener: DataChangeListener): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Notify all listeners of data changes
     */
    private static notifyListeners(data: LibraryData): void {
        this.listeners.forEach(listener => listener(data));
    }

    /**
     * Get all library data - ensures data is available
     */
    static async getAllLibraryData(): Promise<LibraryData> {
        await this.ensureDataAvailable();
        return this.libraryData!;
    }

    /**
     * Get libraries for a specific category
     */
    static async getLibrariesByCategory(category: LibraryCategory): Promise<Library[]> {
        const data = await this.getAllLibraryData();
        
        if (category === 'ALL') {
            return Object.values(data).flat();
        }
        return data[category as keyof LibraryData] || [];
    }

    /**
     * Calculate category counts
     */
    static async getCategoryCounts(): Promise<Record<LibraryCategory, number>> {
        const data = await this.getAllLibraryData();
        const counts = {} as Record<LibraryCategory, number>;
        
        Object.keys(categoryDisplayNames).forEach(category => {
            const categoryKey = category as LibraryCategory;
            if (categoryKey === 'ALL') {
                counts[categoryKey] = Object.values(data).flat().length;
            } else {
                counts[categoryKey] = data[categoryKey as keyof LibraryData]?.length || 0;
            }
        });
        return counts;
    }

    /**
     * Force refresh data from server
     */
    static async refreshData(): Promise<LibraryData> {
        return this.fetchFreshData(true);
    }

    /**
     * Check if server is reachable
     */
    static async isServerAvailable(): Promise<boolean> {
        return ApiService.isServerReachable();
    }

    /**
     * Get metadata about current data
     */
    static getDataMetadata(): { lastFetch: number; hasData: boolean; isStale: boolean } {
        const now = Date.now();
        const isStale = (now - this.lastFetchTime) > CACHE_DURATION;
        
        return {
            lastFetch: this.lastFetchTime,
            hasData: this.libraryData !== null,
            isStale
        };
    }

    /**
     * Ensure data is available, fetch if needed
     */
    private static async ensureDataAvailable(): Promise<void> {
        if (this.libraryData !== null) {
            return; // Data already available
        }

        if (this.isFetching) {
            // Wait for ongoing fetch
            while (this.isFetching) {
                await this.delay(100);
            }
            return;
        }

        // Try to load from cache first, then fetch from server
        await this.loadFromCache();
        if (this.libraryData === null) {
            await this.fetchFreshData(true);
        }
    }

    /**
     * Fetch fresh data from server
     */
    private static async fetchFreshData(force: boolean = false): Promise<LibraryData> {
        if (this.isFetching && !force) {
            console.log('📡 Data fetch already in progress, skipping...');
            return this.libraryData || {
                ALLBIBS: [], FBIB: [], LAFAS: [], BIBN: [],
                KITBIBS_A: [], KITBIBS_N: [], INFOKOM: [], BLBIB: []
            } as LibraryData;
        }

        const now = Date.now();
        if (!force && (now - this.lastFetchTime) < CACHE_DURATION) {
            console.log('📋 Using cached data (still fresh)');
            return this.libraryData || {
                ALLBIBS: [], FBIB: [], LAFAS: [], BIBN: [],
                KITBIBS_A: [], KITBIBS_N: [], INFOKOM: [], BLBIB: []
            } as LibraryData;
        }

        this.isFetching = true;
        
        try {
            console.log('📡 Fetching fresh library data from server...');
            const response = await ApiService.fetchLibraryData();
            
            this.libraryData = response.data;
            this.lastFetchTime = now;
            
            // Cache the data
            await this.saveToCache(response.data);
            
            // Notify listeners
            this.notifyListeners(response.data);
            
            console.log('✅ Fresh library data loaded successfully');
            return response.data;
            
        } catch (error) {
            console.error('❌ Failed to fetch fresh data from server:', error);
            
            // If we have cached data, use it
            if (this.libraryData !== null) {
                console.log('📋 Using cached data as fallback');
                return this.libraryData;
            }
            
            throw new Error(`Failed to fetch library data: ${error}`);
        } finally {
            this.isFetching = false;
        }
    }

    /**
     * Load data from AsyncStorage cache
     */
    private static async loadFromCache(): Promise<void> {
        try {
            const [cachedData, cachedExpiry] = await Promise.all([
                AsyncStorage.getItem(CACHE_KEY),
                AsyncStorage.getItem(CACHE_EXPIRY_KEY)
            ]);

            if (cachedData && cachedExpiry) {
                const expiry = parseInt(cachedExpiry, 10);
                const now = Date.now();

                if (now < expiry) {
                    this.libraryData = JSON.parse(cachedData);
                    this.lastFetchTime = expiry - CACHE_DURATION;
                    console.log('📋 Loaded library data from cache');
                } else {
                    console.log('📋 Cached data expired, will fetch fresh data');
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to load from cache:', error);
        }
    }

    /**
     * Save data to AsyncStorage cache
     */
    private static async saveToCache(data: LibraryData): Promise<void> {
        try {
            const expiry = Date.now() + CACHE_DURATION;
            await Promise.all([
                AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data)),
                AsyncStorage.setItem(CACHE_EXPIRY_KEY, expiry.toString())
            ]);
            console.log('💾 Library data cached successfully');
        } catch (error) {
            console.warn('⚠️ Failed to cache data:', error);
        }
    }

    /**
     * Start auto-refresh interval
     */
    private static startAutoRefresh(): void {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        this.refreshInterval = setInterval(async () => {
            try {
                const { isStale } = this.getDataMetadata();
                if (isStale) {
                    console.log('🔄 Auto-refreshing library data...');
                    await this.fetchFreshData();
                }
            } catch (error) {
                console.warn('⚠️ Auto-refresh failed:', error);
            }
        }, AUTO_REFRESH_INTERVAL);

        console.log('🔄 Auto-refresh started');
    }

    /**
     * Stop auto-refresh
     */
    static stopAutoRefresh(): void {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
            console.log('⏹️ Auto-refresh stopped');
        }
    }

    /**
     * Utility delay function
     */
    private static delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Calculate total seats for a category
    static async getTotalSeats(category: LibraryCategory): Promise<number> {
        const libraries = await this.getLibrariesByCategory(category);
        return libraries.reduce((sum: number, lib: Library) => sum + lib.available_seats, 0);
    }

    // Calculate total free seats for a category
    static async getTotalFreeSeats(category: LibraryCategory): Promise<number> {
        const libraries = await this.getLibrariesByCategory(category);
        return libraries.reduce((sum: number, lib: Library) => sum + lib.free_seats_currently, 0);
    }

    // Get category statistics
    static async getCategoryStats(category: LibraryCategory) {
        const libraries = await this.getLibrariesByCategory(category);
        const totalSeats = await this.getTotalSeats(category);
        const totalFreeSeats = await this.getTotalFreeSeats(category);

        return {
            libraryCount: libraries.length,
            totalSeats,
            totalFreeSeats,
            occupancyRate: totalSeats > 0 ? Math.round(((totalSeats - totalFreeSeats) / totalSeats) * 100) : 0
        };
    }

    // Format opening hours for display
    static formatOpeningHours(day: string[][]): string {
        if (day.length === 0) return 'Geschlossen';
        return day.map(hours => `${hours[0]} - ${hours[1]}`).join(', ');
    }

    // Get current day opening hours for a library
    static getCurrentDayHours(library: Library): string {
        const today = new Date().getDay();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[today] as keyof typeof library.opening_hours;
        return this.formatOpeningHours(library.opening_hours[dayName]);
    }

    // Get occupancy percentage for a library
    static getLibraryOccupancyPercentage(library: Library): number {
        if (library.available_seats === 0) return 0;
        return Math.round(((library.available_seats - library.free_seats_currently) / library.available_seats) * 100);
    }
}
