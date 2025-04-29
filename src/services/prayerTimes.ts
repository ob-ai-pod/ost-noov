import { PrayerTimesResponse, Coordinates, PrayerTimesCache, CachedPrayerTimes, SegmentCalculationResult, TimeSegment } from '../types';
import { TimeSegmentImpl } from './TimeSegment';
import { LocationService } from './LocationService';

export class PrayerTimesService {
  private static instance: PrayerTimesService;
  private static readonly CACHE_KEY = 'noov_prayer_times_cache';
  private cache: PrayerTimesCache = {};

  private locationService: LocationService;

  private constructor() {
    this.loadCache();
    this.locationService = LocationService.getInstance();
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

  private getCacheKey(date: string, coordinates: Coordinates): string {
    return `${date}|${coordinates.latitude},${coordinates.longitude}`;
  }

  private isValidCache(cached: CachedPrayerTimes): boolean {
    const now = new Date();
    const cacheDate = new Date(cached.date);
    
    // Cache is valid if it's from today
    return cacheDate.toDateString() === now.toDateString();
  }

  async getPrayerTimes(coordinates?: Coordinates): Promise<PrayerTimesResponse> {
    // If no coordinates provided, use location service
    const location = coordinates || await this.locationService.getCurrentLocation();
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = this.getCacheKey(today, location);

    // Check cache first
    const cached = this.cache[cacheKey];
    if (cached && this.isValidCache(cached)) {
      console.log('Using cached prayer times');
      return cached.response;
    }

    // If not in cache or invalid, fetch from API
    const url = `http://api.aladhan.com/v1/timings/${today}?latitude=${location.latitude}&longitude=${location.longitude}&method=2`; // method 2 is ISNA

    try {
      const response = await fetch(url);
      const data: PrayerTimesResponse = await response.json();
      
      if (data.code !== 200) {
        throw new Error('Failed to fetch prayer times');
      }

      // Cache the response
      this.cache[cacheKey] = {
        date: today,
        coordinates: `${location.latitude},${location.longitude}`,
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

  async calculateSegments(coordinates?: Coordinates, currentTime: Date = new Date()): Promise<SegmentCalculationResult> {
    const prayerTimes = await this.getPrayerTimes(coordinates);
    const timings = prayerTimes.data.timings;
    const today = new Date(currentTime);
    today.setHours(0, 0, 0, 0);

    // Create base times for today
    const fajrTime = this.parseTime(timings.Fajr, today);
    const sunriseTime = this.parseTime(timings.Sunrise, today);
    const dhuhrTime = this.parseTime(timings.Dhuhr, today);
    const asrTime = this.parseTime(timings.Asr, today);
    const maghribTime = this.parseTime(timings.Maghrib, today);
    const ishaTime = this.parseTime(timings.Isha, today);

    // Create midnight markers for proper Isha/Layl boundaries
    const midnight = new Date(today);
    midnight.setHours(0, 0, 0, 0);
    const nextMidnight = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    nextMidnight.setHours(0, 0, 0, 0);

    // Create segments with fixed midnight boundaries for Isha and Layl
    const segments: TimeSegment[] = [
      new TimeSegmentImpl('Layl', midnight, fajrTime),
      new TimeSegmentImpl('Fajr', fajrTime, sunriseTime),
      new TimeSegmentImpl('Subuh', sunriseTime, dhuhrTime),
      new TimeSegmentImpl('Dhuhr', dhuhrTime, asrTime),
      new TimeSegmentImpl('Asr', asrTime, maghribTime),
      new TimeSegmentImpl('Maghrib', maghribTime, ishaTime),
      new TimeSegmentImpl('Isha', ishaTime, nextMidnight),
    ];

    // Find current segment
    const currentSegment = segments.find(s => s.contains(currentTime));
    if (!currentSegment) {
      // If no segment contains the current time (shouldn't happen with our setup)
      // find the next starting segment
      const futureSegments = segments.filter(s => s.startTime > currentTime);
      return {
        currentSegment: futureSegments[0] || segments[0],
        nextSegment: futureSegments[1] || segments[1] || segments[0],
        segments
      };
    }

    // Find next segment
    const currentIndex = segments.indexOf(currentSegment);
    const nextSegment = segments[(currentIndex + 1) % segments.length];

    return {
      currentSegment,
      nextSegment,
      segments
    };
  }
}