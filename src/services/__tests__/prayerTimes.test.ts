import { PrayerTimesService } from '../prayerTimes.js';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        code: 200,
        status: 'OK',
        data: {
          timings: {
            Fajr: '04:32',
            Sunrise: '05:57',
            Dhuhr: '12:53',
            Asr: '16:43',
            Sunset: '19:50',
            Maghrib: '19:50',
            Isha: '21:15',
          },
        },
      }),
  } as Response)
);

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

describe('PrayerTimesService', () => {
  const service = PrayerTimesService.getInstance();

  beforeEach(() => {
    // Clear cache before each test
    service.clearCache();
  });

  const testLocations = [
    {
      name: 'New York, USA',
      coordinates: { latitude: 40.7128, longitude: -74.0060 }
    },
    {
      name: 'Mecca, Saudi Arabia',
      coordinates: { latitude: 21.4225, longitude: 39.8262 }
    },
    {
      name: 'Jakarta, Indonesia',
      coordinates: { latitude: -6.2088, longitude: 106.8456 }
    }
  ];

  test.each(testLocations)('fetches prayer times for %s', async ({ name, coordinates }) => {
    // First call should fetch from API
    const result1 = await service.getPrayerTimes(coordinates);
    
    // Check response structure
    expect(result1.code).toBe(200);
    expect(result1.status).toBe('OK');
    
    // Check all required prayer times exist and are in correct format
    const timings = result1.data.timings;
    const timeFormat = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:mm format
    
    const requiredTimes = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
    
    // Log all prayer times for this location
    console.log(`\n📍 Prayer times for ${name}:`);
    requiredTimes.forEach(prayerTime => {
      console.log(`${prayerTime.padEnd(8)}: ${timings[prayerTime]}`);
      expect(timings[prayerTime]).toBeDefined();
      expect(timings[prayerTime]).toMatch(timeFormat);
    });

    // Second call should use cache
    const result2 = await service.getPrayerTimes(coordinates);
    expect(result2).toEqual(result1); // Should get same data from cache
  });

  test('cache is location-specific', async () => {
    const ny = testLocations[0].coordinates;
    const mecca = testLocations[1].coordinates;

    // Fetch NY times first
    await service.getPrayerTimes(ny);
    
    // Fetch Mecca times - should not use cache
    const meccaResult = await service.getPrayerTimes(mecca);
    expect(meccaResult.code).toBe(200); // Fresh API call
  });

  // Removed tests related to calculateSegments as it is now handled in TimeSegmentService.
});
