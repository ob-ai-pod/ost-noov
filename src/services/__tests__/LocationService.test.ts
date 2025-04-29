import { LocationService } from '../LocationService';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    length: 0,
    key: (index: number) => Object.keys(store)[index] || null
  };
})();

global.localStorage = localStorageMock;

// Mock navigator and geolocation
const mockGetCurrentPosition = jest.fn();
Object.defineProperty(global, 'navigator', {
  value: {
    geolocation: {
      getCurrentPosition: mockGetCurrentPosition
    }
  },
  writable: true
});

describe('LocationService', () => {
  const service = LocationService.getInstance();
  const testCoordinates = { latitude: 43.6532, longitude: -79.3832 }; // Toronto coordinates

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('saves and retrieves location', () => {
    service.saveLocation(testCoordinates);
    const saved = service.getSavedLocation();
    expect(saved).toEqual(testCoordinates);
  });

  test('returns null for no saved location', () => {
    const saved = service.getSavedLocation();
    expect(saved).toBeNull();
  });

  test('clears saved location', () => {
    service.saveLocation(testCoordinates);
    service.clearSavedLocation();
    const saved = service.getSavedLocation();
    expect(saved).toBeNull();
  });

  test('validates coordinates', () => {
    // Invalid latitude
    service.saveLocation({ latitude: -91, longitude: 0 });
    expect(service.getSavedLocation()).toBeNull();

    // Invalid longitude
    service.saveLocation({ latitude: 0, longitude: 181 });
    expect(service.getSavedLocation()).toBeNull();

    // Valid coordinates
    service.saveLocation(testCoordinates);
    expect(service.getSavedLocation()).toEqual(testCoordinates);
  });

  describe('getCurrentLocation', () => {
    test('returns saved location if available', async () => {
      service.saveLocation(testCoordinates);
      const location = await service.getCurrentLocation();
      expect(location).toEqual(testCoordinates);
      expect(mockGetCurrentPosition).not.toHaveBeenCalled();
    });

    test('uses geolocation if no saved location', async () => {
      const geoPosition = {
        coords: {
          latitude: 35.6762,
          longitude: 139.6503
        }
      };

      mockGetCurrentPosition.mockImplementation((success: PositionCallback) => 
        success(geoPosition as GeolocationPosition)
      );

      const location = await service.getCurrentLocation();
      expect(location).toEqual({
        latitude: geoPosition.coords.latitude,
        longitude: geoPosition.coords.longitude
      });
      expect(mockGetCurrentPosition).toHaveBeenCalled();
    });

    test('falls back to default location on error', async () => {
      const positionError = {
        code: 2, // POSITION_UNAVAILABLE
        message: 'Geolocation error',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      } as GeolocationPositionError;

      mockGetCurrentPosition.mockImplementation((_: PositionCallback, error: PositionErrorCallback) => 
        error(positionError)
      );

      const location = await service.getCurrentLocation();
      expect(location).toEqual(testCoordinates); // Default to Toronto
      expect(mockGetCurrentPosition).toHaveBeenCalled();
    });
  });
});
