import { Coordinates } from '../types';

export class LocationService {
  private static instance: LocationService;
  private static readonly STORAGE_KEY = 'noov_default_location';

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async getCurrentLocation(): Promise<Coordinates> {
    // First try to get saved location
    const saved = this.getSavedLocation();
    if (saved) {
      return saved;
    }

    // If no saved location, try to get current location
    try {
      const position = await this.getCurrentPositionPromise();
      const coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      
      // Save this location for future use
      this.saveLocation(coordinates);
      return coordinates;
    } catch (error) {
      console.error('Error getting current location:', error);
      // Default to Toronto if no location available
      return { latitude: 43.6532, longitude: -79.3832 };
    }
  }

  saveLocation(coordinates: Coordinates): void {
    localStorage.setItem(
      LocationService.STORAGE_KEY,
      JSON.stringify(coordinates)
    );
  }

  getSavedLocation(): Coordinates | null {
    const saved = localStorage.getItem(LocationService.STORAGE_KEY);
    if (!saved) return null;

    try {
      const coordinates = JSON.parse(saved);
      if (this.isValidCoordinates(coordinates)) {
        return coordinates;
      }
      return null;
    } catch {
      return null;
    }
  }

  clearSavedLocation(): void {
    localStorage.removeItem(LocationService.STORAGE_KEY);
  }

  private getCurrentPositionPromise(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    });
  }

  private isValidCoordinates(coordinates: any): coordinates is Coordinates {
    return (
      typeof coordinates === 'object' &&
      coordinates !== null &&
      typeof coordinates.latitude === 'number' &&
      typeof coordinates.longitude === 'number' &&
      coordinates.latitude >= -90 &&
      coordinates.latitude <= 90 &&
      coordinates.longitude >= -180 &&
      coordinates.longitude <= 180
    );
  }
}
