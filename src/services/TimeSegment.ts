import { SegmentName, TimeSegment } from '../types';

export class TimeSegmentImpl implements TimeSegment {
  constructor(
    public name: SegmentName,
    public startTime: Date,
    public endTime: Date
  ) {}

  getDuration(): number {
    return (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60);
  }

  getProgress(currentTime: Date = new Date()): number {
    if (currentTime < this.startTime) return 0;
    if (currentTime > this.endTime) return 100;

    const total = this.endTime.getTime() - this.startTime.getTime();
    const elapsed = currentTime.getTime() - this.startTime.getTime();
    
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  }

  contains(time: Date): boolean {
    return time >= this.startTime && time <= this.endTime;
  }
}
