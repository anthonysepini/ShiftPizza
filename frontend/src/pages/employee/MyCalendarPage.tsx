import PageHeader from "../../components/layout/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import RequestError from "../../components/ui/RequestError";
import Spinner from "../../components/ui/Spinner";
import EmployeeScheduleCalendar from "../../features/schedules/employee/EmployeeScheduleCalendar";
import EmployeeScheduleSummary from "../../features/schedules/employee/EmployeeScheduleSummary";
import { useMySchedule } from "../../features/schedules/employee/useMySchedule";
import { getScheduleStatusPresentation } from "../../features/schedules/status";
import {
  getCivilDateKey,
  parseCivilDate,
} from "../../utils/civil-date";

export default function MyCalendarPage() {
  const {
    year,
    month,
    monthLabel,
    todayKey,

    loading,
    error,

    days,
    sortedDays,
    dayMap,
    summary,

    previousMonth,
    nextMonth,
    reload,
  } = useMySchedule();

  return (
    <div className="animate-in w-full space-y-6">
      <PageHeader
        title="Minha Escala"
        subtitle="Visualize seu mês aqui."
      />

      {!loading && !error && (
        <EmployeeScheduleSummary
          monthLabel={monthLabel}
          summary={summary}
        />
      )}

      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-[28px] border border-white/8 bg-[#090909]">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <RequestError
          title="Não foi possível carregar sua escala"
          onRetry={reload}
        />
      ) : days.length === 0 ? (
        <div className="rounded-[28px] border border-white/8 bg-[#090909] p-4 sm:p-6">
          <EmptyState
            icon="📅"
            title="Nenhum dia de escala neste período"
            description="Quando sua escala for gerada, os dias aparecerão aqui."
          />
        </div>
      ) : (
        <>
          <EmployeeScheduleCalendar
            year={year}
            month={month}
            monthLabel={
              monthLabel
            }
            todayKey={
              todayKey
            }
            dayMap={dayMap}
            onPreviousMonth={
              previousMonth
            }
            onNextMonth={
              nextMonth
            }
          />

          <section className="overflow-hidden rounded-[28px] border border-white/8 bg-[#090909] shadow-[0_18px_50px_rgba(0,0,0,0.32)]">
            <div className="flex flex-col gap-3 border-b border-white/8 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Detalhamento do mês
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Lista completa dos
                  dias registrados na
                  sua escala.
                </p>
              </div>

              <div className="inline-flex w-fit items-center rounded-full border border-orange-400/15 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
                {sortedDays.length}{" "}
                registro
                {sortedDays.length ===
                1
                  ? ""
                  : "s"}
              </div>
            </div>

            <div className="space-y-2 p-2 sm:p-3">
              {sortedDays.map(
                (day) => {
                  const date =
                    parseCivilDate(
                      day.date,
                    );

                  const isToday =
                    getCivilDateKey(
                      day.date,
                    ) === todayKey;

                  const display =
                    getScheduleStatusPresentation(
                      day.status,
                    );

                  const note =
                    day.note?.trim() ||
                    display.defaultNote;

                  return (
                    <div
                      key={day.id}
                      className={`relative overflow-hidden rounded-2xl border px-4 py-4 transition-all duration-200 sm:px-5 ${
                        isToday
                          ? "border-orange-500/25 bg-orange-500/[0.07]"
                          : "border-white/8 bg-white/[0.02] hover:border-orange-500/15 hover:bg-white/[0.03]"
                      }`}
                    >
                      {isToday && (
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-orange-400" />
                      )}

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold capitalize text-white">
                            {date.toLocaleDateString(
                              "pt-BR",
                              {
                                weekday:
                                  "long",
                                day: "2-digit",
                                month:
                                  "long",
                              },
                            )}
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            {note}
                          </p>
                        </div>

                        <div
                          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${display.chipClass}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${display.dotClass}`}
                          />

                          {
                            display.label
                          }
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
