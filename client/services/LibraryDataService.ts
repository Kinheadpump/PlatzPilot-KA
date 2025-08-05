import { Library, LibraryCategory, LibraryData, categoryDisplayNames } from '../types/library';
import libraryDataJson from '../assets/example.json';

export class LibraryDataService {
    private static libraryData: LibraryData = libraryDataJson as LibraryData;

    // Get all library data
    static getAllLibraryData(): LibraryData {
        return this.libraryData;
    }

    // Get libraries for a specific category
    static getLibrariesByCategory(category: LibraryCategory): Library[] {
        if (category === 'ALL') {
            // Return all libraries from all categories
            return Object.values(this.libraryData).flat();
        }
        return this.libraryData[category as keyof LibraryData] || [];
    }

    // Calculate category counts
    static getCategoryCounts(): Record<LibraryCategory, number> {
        const counts = {} as Record<LibraryCategory, number>;
        Object.keys(categoryDisplayNames).forEach(category => {
            const categoryKey = category as LibraryCategory;
            if (categoryKey === 'ALL') {
                // Count all libraries from all categories
                counts[categoryKey] = Object.values(this.libraryData).flat().length;
            } else {
                counts[categoryKey] = this.libraryData[categoryKey as keyof LibraryData]?.length || 0;
            }
        });
        return counts;
    }

    // Calculate total seats for a category
    static getTotalSeats(category: LibraryCategory): number {
        const libraries = this.getLibrariesByCategory(category);
        return libraries.reduce((sum, lib) => sum + lib.available_seats, 0);
    }

    // Calculate total free seats for a category
    static getTotalFreeSeats(category: LibraryCategory): number {
        const libraries = this.getLibrariesByCategory(category);
        return libraries.reduce((sum, lib) => sum + lib.free_seats_currently, 0);
    }

    // Get category statistics
    static getCategoryStats(category: LibraryCategory) {
        const libraries = this.getLibrariesByCategory(category);
        const totalSeats = this.getTotalSeats(category);
        const totalFreeSeats = this.getTotalFreeSeats(category);

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
