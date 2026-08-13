import { describe, expect, it } from 'vitest';
import type { ScheduleStatus } from '../../types';
import {
  SCHEDULE_STATUS_PRESENTATION,
  SCHEDULE_STATUS_VALUES,
  getScheduleStatusPresentation,
  parseScheduleStatus,
} from './status';

const expectedStatuses: ScheduleStatus[] = [
  'SCHEDULED',
  'ABSENT',
  'EXTRA_SHIFT',
  'DAY_OFF',
  'REMOVED_SHIFT',
];

describe('schedule status presentation', () => {
  it('maps every server ScheduleStatus exactly once', () => {
    expect(SCHEDULE_STATUS_VALUES).toEqual(expectedStatuses);
    expect(Object.keys(SCHEDULE_STATUS_PRESENTATION)).toEqual(expectedStatuses);

    expectedStatuses.forEach((status) => {
      const presentation = getScheduleStatusPresentation(status);
      expect(presentation.label).not.toBe('');
      expect(presentation.defaultNote).not.toBe('');
    });
  });

  it('does not create synthetic attendance or vacation statuses', () => {
    expect(parseScheduleStatus('PRESENT')).toBeNull();
    expect(parseScheduleStatus('VACATION')).toBeNull();
    expect(getScheduleStatusPresentation('SCHEDULED').label).toBe('Escalado');
    expect(getScheduleStatusPresentation('ABSENT').label).toBe('Falta');
  });

  it('parses only server-supported status values', () => {
    expectedStatuses.forEach((status) => {
      expect(parseScheduleStatus(status)).toBe(status);
    });
    expect(parseScheduleStatus('UNKNOWN')).toBeNull();
  });
});
