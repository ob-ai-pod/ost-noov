import { PrayerTimesResponse, PrayerTimesCache, CachedPrayerTimes } from '../types';

export class PrayerTimesService {
  private static instance: PrayerTimesService;
  private static readonly CACHE_KEY = 'noov_prayer_times_cache';
  private cache: PrayerTimesCache = {};

  private constructor() {
    this.loadCache();
  }

  static getInstance(): PrayerTimesService {
    if (!PrayerTimesService.instance) {
      PrayerTimesService.instance = new PrayerTimesService();
    }
    return PrayerTimesService.instance;
  }

  private loadCache(): void {
    const cached = localStorage.getItem(PrayerTimesService.CACHE_KEY);
    if (cached) {
      this.cache = JSON.parse(cached);
    }
  }

  private saveCache(): void {
    localStorage.setItem(PrayerTimesService.CACHE_KEY, JSON.stringify(this.cache));
  }

  private getCacheKey(date: string, coordinates: string): string {
    return `${date}|${coordinates}`;
  }

  private isValidCache(cached: CachedPrayerTimes): boolean {
    const now = new Date();
    const cacheDate = new Date(cached.date);
    
    // Cache is valid if it's from today
    return cacheDate.toDateString() === now.toDateString();
  }

  async getPrayerTimesByCity(city: string, country: string): Promise<PrayerTimesResponse> {
    const today = new Date().toISOString().split('T')[0].split('-').reverse().join('-');
    const cacheKey = `${today}|${city},${country}`;

    // Check cache first
    const cached = this.cache[cacheKey];
    if (cached && this.isValidCache(cached)) {
      console.log('Using cached prayer times');
      return cached.response;
    }

    const url = `https://api.aladhan.com/v1/timingsByCity/${today}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2`;
    console.log('API URL:', url);

    try {
      const response = await fetch(url);
      const data: PrayerTimesResponse = await response.json();
      console.log('API Response:', data);

      if (data.code !== 200) {
        throw new Error('Failed to fetch prayer times by city');
      }

      // Cache the response
      this.cache[cacheKey] = {
        date: today,
        coordinates: `${city},${country}`,
        response: data,
        timestamp: Date.now()
      };
      this.saveCache();

      return data;
    } catch (error) {
      console.error('Error fetching prayer times by city:', error);
      throw error;
    }
  }

  async getPrayerTimes(coordinates?: string): Promise<PrayerTimesResponse> {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = this.getCacheKey(today, coordinates || '');

    // Check cache first
    const cached = this.cache[cacheKey];
    if (cached && this.isValidCache(cached)) {
      console.log('Using cached prayer times');
      return cached.response;
    }

    // If not in cache or invalid, fetch from API
    const url = `http://api.aladhan.com/v1/timings/${today}?latitude=0&longitude=0&method=2`; // method 2 is ISNA

    console.log('API URL:', url); // Log the API URL

    try {
      const response = await fetch(url);
      const data: PrayerTimesResponse = await response.json();
      
      console.log('API Response:', data); // Log the API response

      if (data.code !== 200) {
        throw new Error('Failed to fetch prayer times');
      }

      // Cache the response
      this.cache[cacheKey] = {
        date: today,
        coordinates: '0,0',
        response: data,
        timestamp: Date.now()
      };
      this.saveCache();

      return data;
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      throw error;
    }
  }

  clearCache(): void {
    this.cache = {};
    localStorage.removeItem(PrayerTimesService.CACHE_KEY);
  }

  private parseTime(timeStr: string, baseDate: Date): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const time = new Date(baseDate);
    time.setHours(hours, minutes, 0, 0);
    return time;
  }

  // Removed calculateSegments function as it is now handled in TimeSegmentService.ts
}