import { useMemo } from "react";
import Badge from "../../../components/ui/Badge";
import type { ScheduleDay } from "../../../types";
import {
  getCivilDateKey,
  getLocalDateInputValue,
} from "../../../utils/civil-date";
import {
  getCalendarDateKey,
  getCalendarGridMeta,
} from "../calendar";
import {
  getScheduleStatusPresentation,
  SCHEDULE_STATUS_VALUES,
} from "../status";

const WEEKDAYS_SHORT = [
  "D",
  "S",
  "T",
  "Q",
  "Q",
  "S",
  "S",
];

interface Props {
  year: number;
  month: number;
  monthLabel: string;
  days: ScheduleDay[];
  onSelectDay: (day: ScheduleDay) => void;
}

export default function ScheduleCalendarGrid({
  year,
  month,
  monthLabel,
  days,
  onSelectDay,
}: Props) {
  const {
    daysInMonth,
    firstWeekday,
    trailingEmptyCells,
  } = getCalendarGridMeta(year, month);

  const todayKey = getLocalDateInputValue();

  const dayMap = useMemo(() => {
    const map = new Map<string, ScheduleDay[]>();

    for (const schedule of days) {
      const key = getCivilDateKey(schedule.date);

      map.set(key, [
        ...(map.get(key) ?? []),
        schedule,
      ]);
    }

    return map;
  }, [days]);

  return (
    <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[#070707]/90 shadow-[0_20px_80px_rgba(0,0,0,0.42)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

      <div className="pointer-events-none absolute -right-20 top-0 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative flex items-center justify-between gap-3 border-b border-white/8 px-4 py-2.5">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-orange-300">
            Agenda operacional
          </p>

          <h2 className="mt-0.5 text-base font-semibold leading-none text-white sm:text-lg">
            Calendário de escala
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] px-3 py-1.5 text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Período
          </p>

          <p className="mt-0.5 text-sm font-semibold capitalize leading-none text-white">
            {monthLabel}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-white/8 bg-[#0C0C0C]">
        {WEEKDAYS_SHORT.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="px-1 py-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-7 auto-rows-fr">
        {Array.from({
          length: firstWeekday,
        }).map((_, index) => (
          <div
            key={`empty-start-${index}`}
            className="border-b border-r border-white/8 bg-[#050505]"
          />
        ))}

        {Array.from({
          length: daysInMonth,
        }).map((_, index) => {
          const dayNumber = index + 1;

          const key = getCalendarDateKey(
            year,
            month,
            dayNumber,
          );

          const cellDays = dayMap.get(key) ?? [];

          const isToday = key === todayKey;

          const column =
            (firstWeekday + index) % 7;

          const isLastColumn = column === 6;

          const isWeekend =
            column === 0 || column === 6;

          return (
            <div
              key={key}
              className={[
                "group relative min-h-0 overflow-hidden px-1.5 py-1.5",
                "border-b border-white/8 transition-colors duration-200",
                !isLastColumn
                  ? "border-r border-white/8"
                  : "",
                isWeekend
                  ? "bg-[#060606]"
                  : "bg-[#080808]",
                "hover:bg-[#0B0B0B]",
              ].join(" ")}
            >
              <div className="mb-1.5 flex items-start justify-between gap-1">
                <div
                  className={[
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200",
                    isToday
                      ? "bg-orange-700 text-white shadow-[0_10px_24px_rgba(249,115,22,0.32)]"
                      : "bg-white/[0.03] text-slate-400 group-hover:bg-white/[0.05] group-hover:text-slate-200",
                  ].join(" ")}
                >
                  {dayNumber}
                </div>

                {isToday && (
                  <span className="hidden rounded-full border border-orange-500/20 bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-orange-300 lg:block">
                    Hoje
                  </span>
                )}
              </div>

              <div className="space-y-1">
                {cellDays
                  .slice(0, 3)
                  .map((schedule) => {
                    const presentation =
                      getScheduleStatusPresentation(
                        schedule.status,
                      ).calendar;

                    const employeeName =
                      schedule.employee?.fullName ??
                      "Funcionário";

                    return (
                      <button
                        key={schedule.id}
                        type="button"
                        onClick={() =>
                          onSelectDay(schedule)
                        }
                        aria-label={`Editar ${employeeName} em ${key}`}
                        className="block w-full overflow-hidden rounded-xl px-1.5 py-1 text-left text-[11px] font-medium leading-tight transition-all duration-200 hover:opacity-95"
                        style={{
                          background:
                            presentation.background,
                          color:
                            presentation.color,
                          boxShadow: `inset 0 0 0 1px ${presentation.border}`,
                        }}
                      >
                        <span className="block truncate">
                          {employeeName}
                        </span>
                      </button>
                    );
                  })}

                {cellDays.length > 3 && (
                  <div className="px-1 text-[11px] font-medium text-slate-500">
                    +{cellDays.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {Array.from({
          length: trailingEmptyCells,
        }).map((_, index) => (
          <div
            key={`empty-end-${index}`}
            className="border-b border-white/8 bg-[#050505]"
          />
        ))}
      </div>

      <div className="border-t border-white/8 px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          {SCHEDULE_STATUS_VALUES.map((status) => (
            <Badge
              key={status}
              status={status}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
