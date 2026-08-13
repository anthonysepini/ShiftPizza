const CIVIL_DATE_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})(?:$|T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$)/;

function formatLocalDateParts(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    throw new RangeError('Invalid date');
  }

  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCivilDateKey(value: string | Date): string {
  if (value instanceof Date) return formatLocalDateParts(value);

  const match = CIVIL_DATE_PATTERN.exec(value);
  if (!match) throw new RangeError('Invalid civil date');

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    throw new RangeError('Invalid civil date');
  }

  return `${yearText}-${monthText}-${dayText}`;
}

export function parseCivilDate(value: string): Date {
  const [year, month, day] = getCivilDateKey(value).split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatCivilDate(
  value: string,
  options: Intl.DateTimeFormatOptions,
  locale = 'pt-BR',
): string {
  return new Intl.DateTimeFormat(locale, options).format(parseCivilDate(value));
}

export function getLocalDateInputValue(date = new Date()): string {
  return formatLocalDateParts(date);
}
