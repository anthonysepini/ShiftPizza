import {
  createCivilDate,
  getCivilDateInTimeZone,
  getCivilDateKey,
  getCivilWeekday,
} from './civil-date';

describe('civil date helpers', () => {
  it('creates March 1 at UTC midnight in every process timezone', () => {
    expect(createCivilDate(2026, 3, 1).toISOString()).toBe(
      '2026-03-01T00:00:00.000Z',
    );
  });

  it('reads a PostgreSQL date without shifting its calendar fields', () => {
    const marchFirst = new Date('2026-03-01');

    expect(getCivilDateKey(marchFirst)).toBe('2026-03-01');
    expect(getCivilWeekday(marchFirst)).toBe(0);
  });

  it('normalizes month overflow for half-open month ranges', () => {
    expect(createCivilDate(2026, 13, 1).toISOString()).toBe(
      '2027-01-01T00:00:00.000Z',
    );
  });

  it('maps an instant to the explicit business civil date', () => {
    const instant = new Date('2026-03-01T01:00:00.000Z');

    expect(
      getCivilDateInTimeZone(instant, 'America/Sao_Paulo').toISOString(),
    ).toBe('2026-02-28T00:00:00.000Z');
  });
});
