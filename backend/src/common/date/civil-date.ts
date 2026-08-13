export const DEFAULT_BUSINESS_TIME_ZONE = 'America/Sao_Paulo';

export function createCivilDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day));
}

export function validateTimeZone(timeZone: string) {
  const normalizedTimeZone = timeZone.trim();

  if (normalizedTimeZone === '') {
    throw new Error('Time zone must not be empty');
  }

  try {
    new Intl.DateTimeFormat('en-US', {
      timeZone: normalizedTimeZone,
    }).format(0);
  } catch {
    throw new Error(`Invalid IANA time zone: ${normalizedTimeZone}`);
  }

  return normalizedTimeZone;
}

export function getCivilDateInTimeZone(instant: Date, timeZone: string) {
  const normalizedTimeZone = validateTimeZone(timeZone);
  const parts = new Intl.DateTimeFormat('en-US', {
    calendar: 'gregory',
    numberingSystem: 'latn',
    timeZone: normalizedTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return createCivilDate(
    Number(values.year),
    Number(values.month),
    Number(values.day),
  );
}

export function getCivilDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getCivilWeekday(date: Date) {
  return date.getUTCDay();
}
