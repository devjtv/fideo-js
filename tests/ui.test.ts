import { describe, expect, it } from 'vitest';
import { formatTime } from '../src/ui';

describe('formatTime', () => {
  it('formats sub-hour durations as m:ss', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(9)).toBe('0:09');
    expect(formatTime(75)).toBe('1:15');
    expect(formatTime(3599)).toBe('59:59');
  });

  it('formats hour-long durations as h:mm:ss', () => {
    expect(formatTime(3600)).toBe('1:00:00');
    expect(formatTime(3904)).toBe('1:05:04');
    expect(formatTime(7325)).toBe('2:02:05');
  });

  it('falls back to 0:00 for unusable values', () => {
    expect(formatTime(Number.NaN)).toBe('0:00');
    expect(formatTime(Number.POSITIVE_INFINITY)).toBe('0:00');
    expect(formatTime(-10)).toBe('0:00');
  });
});
