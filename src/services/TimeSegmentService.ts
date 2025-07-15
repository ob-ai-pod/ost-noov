import { PrayerTimesService } from './prayerTimes';
import { SegmentCalculationResult, TimeSegment } from '../types';
import { TimeSegmentImpl } from './TimeSegment';

export class TimeSegmentService {
  private prayerTimesService: PrayerTimesService;

  constructor() {
    this.prayerTimesService = PrayerTimesService.getInstance();
  }

  async fetchPrayerTimes(city: string, country: string) {
    try {
      const prayerTimes = await this.prayerTimesService.getPrayerTimesByCity(city, country);
      return prayerTimes;
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      throw error;
    }
  }

  async calculateSegments(city: string, country: string, currentTime: Date = new Date()): Promise<SegmentCalculationResult> {
    const prayerTimes = await this.fetchPrayerTimes(city, country);
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

  parseTime(time: string, date: Date): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const parsedDate = new Date(date);
    parsedDate.setHours(hours, minutes, 0, 0);
    return parsedDate;
  }
}
