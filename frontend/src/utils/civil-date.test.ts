import { describe, expect, it } from 'vitest';
import {
  formatCivilDate,
  getCivilDateKey,
  getLocalDateInputValue,
  parseCivilDate,
} from './civil-date';

describe('civil-date helpers', () => {
  it('keeps a UTC-midnight API date on the same civil day in UTC-03', () => {
    const value = '2026-08-13T00:00:00.000Z';
    const parsed = parseCivilDate(value);

    expect(getCivilDateKey(value)).toBe('2026-08-13');
    expect([
      parsed.getFullYear(),
      parsed.getMonth() + 1,
      parsed.getDate(),
    ]).toEqual([2026, 8, 13]);
    expect(
      formatCivilDate(value, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    ).toBe('13/08/2026');
  });

  it('builds a date input value from local fields instead of UTC', () => {
    const lateLocalTime = new Date(2026, 7, 13, 23, 30);

    expect(getLocalDateInputValue(lateLocalTime)).toBe('2026-08-13');
  });

  it('rejects an impossible civil date', () => {
    expect(() => parseCivilDate('2026-02-30')).toThrow(RangeError);
  });

  it('rejects a date followed by an invalid datetime suffix', () => {
    expect(() => getCivilDateKey('2026-08-13Trash')).toThrow(RangeError);
  });
});
