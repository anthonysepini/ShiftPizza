import { getLocalDateInputValue } from "../../utils/civil-date";

export interface CalendarPeriod {
  year: number;
  month: number;
}

export interface CalendarGridMeta {
  daysInMonth: number;
  firstWeekday: number;
  trailingEmptyCells: number;
}

export function getCurrentPeriod(date = new Date()): CalendarPeriod {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  };
}

export function getPreviousPeriod(
  period: CalendarPeriod,
): CalendarPeriod {
  if (period.month === 1) {
    return {
      year: period.year - 1,
      month: 12,
    };
  }

  return {
    year: period.year,
    month: period.month - 1,
  };
}

export function getNextPeriod(
  period: CalendarPeriod,
): CalendarPeriod {
  if (period.month === 12) {
    return {
      year: period.year + 1,
      month: 1,
    };
  }

  return {
    year: period.year,
    month: period.month + 1,
  };
}

export function getMonthLabel(
  year: number,
  month: number,
): string {
  return new Date(year, month - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

export function getCalendarGridMeta(
  year: number,
  month: number,
): CalendarGridMeta {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();

  const trailingEmptyCells =
    (7 - ((firstWeekday + daysInMonth) % 7)) % 7;

  return {
    daysInMonth,
    firstWeekday,
    trailingEmptyCells,
  };
}

export function getCalendarDateKey(
  year: number,
  month: number,
  day: number,
): string {
  return getLocalDateInputValue(
    new Date(year, month - 1, day),
  );
}
