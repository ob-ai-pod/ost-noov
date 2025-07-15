import { TimeSegmentService } from '../TimeSegmentService';
import { PrayerTimesService } from '../prayerTimes';
import fetch from 'node-fetch';

global.fetch = fetch as unknown as typeof globalThis.fetch;

jest.unmock('../prayerTimes');

const mockPrayerTimes = {
  code: 200,
  status: 'OK',
  data: {
    timings: {
      Fajr: '05:00',
      Sunrise: '06:30',
      Dhuhr: '12:00',
      Asr: '15:30',
      Maghrib: '18:00',
      Isha: '19:30',
    },
  },
};

describe('TimeSegmentService', () => {
  let timeSegmentService: TimeSegmentService;

  beforeEach(() => {
    timeSegmentService = new TimeSegmentService();
  });

  it('fetches prayer times correctly', async () => {
    const city = 'Toronto';
    const country = 'CA';
    const prayerTimes = await timeSegmentService.fetchPrayerTimes(city, country);
    expect(prayerTimes.data.timings.Fajr).toBe('04:06');
    expect(prayerTimes.data.timings.Dhuhr).toBe('13:24');
  });

  it('fetches prayer times for Markham, Ontario, Canada', async () => {
    const city = 'Markham';
    const country = 'CA';
    const prayerTimes = await timeSegmentService.fetchPrayerTimes(city, country);
    console.log('Prayer times for Markham, Ontario, Canada:', prayerTimes.data.timings);
    expect(prayerTimes.data.timings).toBeDefined();
  });

  it('fetches real prayer times for Markham, Ontario, Canada', async () => {
    const city = 'Markham';
    const country = 'CA';
    const prayerTimes = await timeSegmentService.fetchPrayerTimes(city, country);
    console.log('Real prayer times for Markham, Ontario, Canada:', prayerTimes.data.timings);
    expect(prayerTimes.data.timings).toBeDefined();
  });

  it('fetches prayer times for Markham, Ontario, Canada using city method', async () => {
    const city = 'Markham';
    const country = 'CA';
    const prayerTimesService = PrayerTimesService.getInstance();
    const prayerTimes = await prayerTimesService.getPrayerTimesByCity(city, country);
    console.log('Prayer times for Markham, Ontario, Canada:', prayerTimes.data.timings);
    expect(prayerTimes.data.timings).toBeDefined();
  });

  it('calculates time segments correctly', async () => {
    jest.mock('../prayerTimes', () => ({
      PrayerTimesService: jest.fn().mockImplementation(() => ({
        getPrayerTimesByCity: jest.fn(() => Promise.resolve({
          data: { 
            timings: {
              Fajr: '04:06',
              Sunrise: '05:50',
              Dhuhr: '13:24',
              Asr: '17:28',
              Maghrib: '20:57',
              Isha: '22:40'
            }
          }
        }))
      }))
    }));

    const city = 'Toronto';
    const country = 'CA';
    const result = await timeSegmentService.calculateSegments(city, country);

    expect(result.segments).toHaveLength(7);

    expect(result.segments[0].name).toBe('Layl');
    expect(result.segments[0].startTime.getHours()).toBe(0);
    expect(result.segments[0].endTime.getHours()).toBe(4);

    expect(result.segments[1].name).toBe('Fajr');
    expect(result.segments[1].startTime.getHours()).toBe(4);
    expect(result.segments[1].endTime.getHours()).toBe(5);

    expect(result.segments[2].name).toBe('Subuh');
    expect(result.segments[2].startTime.getHours()).toBe(5);
    expect(result.segments[2].endTime.getHours()).toBe(13);

    expect(result.segments[3].name).toBe('Dhuhr');
    expect(result.segments[3].startTime.getHours()).toBe(13);
    expect(result.segments[3].endTime.getHours()).toBe(17);

    expect(result.segments[4].name).toBe('Asr');
    expect(result.segments[4].startTime.getHours()).toBe(17);
    expect(result.segments[4].endTime.getHours()).toBe(20);

    expect(result.segments[5].name).toBe('Maghrib');
    expect(result.segments[5].startTime.getHours()).toBe(20);
    expect(result.segments[5].endTime.getHours()).toBe(22);

    expect(result.segments[6].name).toBe('Isha');
    expect(result.segments[6].startTime.getHours()).toBe(22);
    expect(result.segments[6].endTime.getHours()).toBe(0);
  });

  it('prints time segments with durations', async () => {
    const city = 'Toronto';
    const country = 'CA';
    const result = await timeSegmentService.calculateSegments(city, country);

    result.segments.forEach(segment => {
      const start = segment.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const end = segment.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      console.log(`${segment.name}: ${start}-${end}`);
    });
  });
});
