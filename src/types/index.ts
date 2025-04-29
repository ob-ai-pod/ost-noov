// Basic types for prayer times API response
export interface PrayerTimesResponse {
  code: number;
  status: string;
  data: {
    timings: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Maghrib: string;
      Isha: string;
    };
  };
}

// Simple coordinates type for location
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Cache types
export interface CachedPrayerTimes {
  date: string;          // YYYY-MM-DD format
  coordinates: string;   // "lat,lng" format
  response: PrayerTimesResponse;
  timestamp: number;     // When this cache entry was created
}

export interface PrayerTimesCache {
  [key: string]: CachedPrayerTimes;  // key is `${date}|${coordinates}`
}

// Segment types
export type SegmentName = 'Layl' | 'Fajr' | 'Subuh' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface TimeSegment {
  name: SegmentName;
  startTime: Date;
  endTime: Date;
  // Duration in minutes
  getDuration(): number;
  // Progress as percentage (0-100)
  getProgress(currentTime?: Date): number;
  // Whether a given time falls within this segment
  contains(time: Date): boolean;
}

export interface SegmentCalculationResult {
  currentSegment: TimeSegment;
  nextSegment: TimeSegment;
  segments: TimeSegment[];
}
