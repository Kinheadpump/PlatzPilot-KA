/**
 * API Service for fetching real-time library data from the PlatzPilot server
 */

import { LibraryData } from '../types/library';

// Configuration
const API_CONFIG = {
  // Default to localhost for development - should be configured for production
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

export interface ApiResponse<T> {
  data: T;
  metadata?: {
    last_update: string;
    server_time: string;
    total_locations: number;
  };
}

export interface ApiError {
  error: string;
  timestamp: string;
}

class ApiService {
  private static instance: ApiService;

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /**
   * Fetch library data from the server with retry logic
   */
  async fetchLibraryData(): Promise<ApiResponse<LibraryData>> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        const response = await fetch(`${API_CONFIG.BASE_URL}/api/libraries`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status >= 500) {
            // Server error - retry
            throw new Error(`Server error: ${response.status}`);
          } else {
            // Client error - don't retry
            const errorData: ApiError = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
          }
        }

        const data: ApiResponse<LibraryData> = await response.json();
        
        // Validate response structure
        if (!data.data) {
          throw new Error('Invalid response structure');
        }

        console.log('✅ Library data fetched successfully', {
          attempt,
          totalLocations: data.metadata?.total_locations,
          lastUpdate: data.metadata?.last_update,
        });

        return data;

      } catch (error) {
        lastError = error as Error;
        
        console.warn(`⚠️ API attempt ${attempt}/${API_CONFIG.RETRY_ATTEMPTS} failed:`, {
          error: lastError.message,
          url: `${API_CONFIG.BASE_URL}/api/libraries`,
        });

        // Don't retry on abort (timeout) or client errors
        if (lastError.name === 'AbortError' || lastError.message.includes('HTTP 4')) {
          break;
        }

        // Wait before retrying (except on last attempt)
        if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
          await this.delay(API_CONFIG.RETRY_DELAY * attempt); // Exponential backoff
        }
      }
    }

    throw new Error(`Failed to fetch library data after ${API_CONFIG.RETRY_ATTEMPTS} attempts: ${lastError?.message}`);
  }

  /**
   * Check server health status
   */
  async checkHealth(): Promise<{ status: string; data_available: boolean; last_data_update?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Shorter timeout for health check

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * Test if the API server is reachable
   */
  async isServerReachable(): Promise<boolean> {
    try {
      await this.checkHealth();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current API configuration
   */
  getConfig() {
    return { ...API_CONFIG };
  }

  /**
   * Update API base URL (useful for switching between dev/prod)
   */
  setBaseUrl(url: string) {
    API_CONFIG.BASE_URL = url.replace(/\/$/, ''); // Remove trailing slash
  }
}

// Export singleton instance
export default ApiService.getInstance();