import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { ScheduleDay } from "../../../types";
import {
  getCalendarDateKey,
  getCalendarGridMeta,
} from "../calendar";
import {
  getScheduleStatusPresentation,
  SCHEDULE_STATUS_VALUES,
} from "../status";

const WEEKDAYS_SHORT = [
  "Dom",
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb",
];

interface Props {
  year: number;
  month: number;
  monthLabel: string;

  todayKey: string;

  dayMap: Map<
    string,
    ScheduleDay
  >;

  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export default function EmployeeScheduleCalendar({
  year,
  month,
  monthLabel,
  todayKey,
  dayMap,
  onPreviousMonth,
  onNextMonth,
}: Props) {
  const {
    daysInMonth,
    firstWeekday,
  } = getCalendarGridMeta(
    year,
    month,
  );

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex w-fit items-center gap-1 rounded-2xl border border-white/8 bg-[#090909] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
          <button
            type="button"
            onClick={
              onPreviousMonth
            }
            aria-label="Mês anterior"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-white/[0.04] hover:text-orange-300"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="min-w-[188px] px-4 text-center text-sm font-semibold capitalize text-white">
            {monthLabel}
          </span>

          <button
            type="button"
            onClick={
              onNextMonth
            }
            aria-label="Próximo mês"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-white/[0.04] hover:text-orange-300"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {SCHEDULE_STATUS_VALUES.map(
            (status) => {
              const presentation =
                getScheduleStatusPresentation(
                  status,
                );

              return (
                <div
                  key={status}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${presentation.chipClass}`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${presentation.dotClass}`}
                  />

                  {
                    presentation.label
                  }
                </div>
              );
            },
          )}
        </div>
      </div>

      <section className="overflow-hidden rounded-[28px] border border-white/8 bg-[#090909] shadow-[0_18px_50px_rgba(0,0,0,0.32)]">
        <div className="grid grid-cols-7 border-b border-white/8 bg-[#0C0C0C]">
          {WEEKDAYS_SHORT.map(
            (weekday) => (
              <div
                key={weekday}
                className="px-1 py-3 text-center text-xs font-semibold text-slate-500"
              >
                {weekday}
              </div>
            ),
          )}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({
            length: firstWeekday,
          }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="min-h-[88px] border-b border-r border-white/6 bg-[#050505] sm:min-h-[108px]"
            />
          ))}

          {Array.from({
            length: daysInMonth,
          }).map((_, index) => {
            const dayNumber =
              index + 1;

            const key =
              getCalendarDateKey(
                year,
                month,
                dayNumber,
              );

            const schedule =
              dayMap.get(key);

            const display =
              schedule
                ? getScheduleStatusPresentation(
                    schedule.status,
                  )
                : null;

            const isToday =
              key === todayKey;

            const column =
              (firstWeekday +
                index) %
              7;

            return (
              <div
                key={key}
                className={`min-h-[88px] border-b border-white/6 p-2 sm:min-h-[108px] sm:p-3 ${
                  column < 6
                    ? "border-r"
                    : ""
                } ${
                  isToday
                    ? "bg-orange-500/[0.06] ring-1 ring-inset ring-orange-500/30"
                    : "bg-transparent"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold sm:h-9 sm:w-9 ${
                    isToday
                      ? "bg-orange-700 text-white shadow-[0_10px_24px_rgba(249,115,22,0.25)]"
                      : "text-slate-400"
                  }`}
                >
                  {dayNumber}
                </div>

                {display && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${display.dotClass}`}
                      />

                      <span className="hidden text-xs font-medium text-slate-400 sm:block">
                        {
                          display.label
                        }
                      </span>

                      <span className="text-[11px] font-medium text-slate-500 sm:hidden">
                        {
                          display.shortLabel
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
