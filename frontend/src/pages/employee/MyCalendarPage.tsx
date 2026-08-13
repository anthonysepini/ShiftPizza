import { useEffect, useMemo, useReducer, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import RequestError from "../../components/ui/RequestError";
import { schedulesService } from "../../services/schedules.service";
import {
  getScheduleStatusPresentation,
  SCHEDULE_STATUS_VALUES,
} from "../../features/schedules/status";
import {
  getCivilDateKey,
  getLocalDateInputValue,
  parseCivilDate,
} from "../../utils/civil-date";
import type { ScheduleDay } from "../../types";

const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type State = {
  loading: boolean;
  days: ScheduleDay[];
  error: boolean;
};

type Action =
  | { type: "loading" }
  | { type: "success"; payload: ScheduleDay[] }
  | { type: "error" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "loading":
      return { ...state, loading: true, error: false };
    case "success":
      return { loading: false, days: action.payload, error: false };
    case "error":
      return { loading: false, days: [], error: true };
    default:
      return state;
  }
}

export default function MyCalendarPage() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const todayKey = getLocalDateInputValue();
  const [{ loading, days, error }, dispatch] = useReducer(reducer, {
    loading: true,
    days: [],
    error: false,
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    dispatch({ type: "loading" });

    schedulesService
      .getMySchedule(year, month)
      .then((data) => {
        if (!cancelled) {
          dispatch({ type: "success", payload: data });
        }
      })
      .catch(() => {
        if (!cancelled) {
          dispatch({ type: "error" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [year, month, reloadKey]);

  const prevMonth = () => {
    if (month === 1) {
      setYear((currentYear) => currentYear - 1);
      setMonth(12);
      return;
    }

    setMonth((currentMonth) => currentMonth - 1);
  };

  const nextMonth = () => {
    if (month === 12) {
      setYear((currentYear) => currentYear + 1);
      setMonth(1);
      return;
    }

    setMonth((currentMonth) => currentMonth + 1);
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const monthLabel = new Date(year, month - 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const sortedDays = useMemo(() => {
    return [...days].sort((a, b) =>
      getCivilDateKey(a.date).localeCompare(getCivilDateKey(b.date)),
    );
  }, [days]);

  const dayMap = useMemo(() => {
    return new Map(
      sortedDays.map((day) => [getCivilDateKey(day.date), day]),
    );
  }, [sortedDays]);

  const summary = useMemo(() => {
    return sortedDays.reduce(
      (acc, day) => {
        if (day.status === "SCHEDULED") {
          acc.scheduled += 1;
        }

        if (day.status === "ABSENT") {
          acc.absent += 1;
        }

        if (
          getCivilDateKey(day.date) >= todayKey &&
          (day.status === "SCHEDULED" || day.status === "EXTRA_SHIFT")
        ) {
          acc.upcoming += 1;
        }

        return acc;
      },
      { scheduled: 0, absent: 0, upcoming: 0 },
    );
  }, [sortedDays, todayKey]);

  return (
    <div className="animate-in w-full space-y-6">
      <PageHeader title="Minha Escala" subtitle="Visualize seu mês aqui." />

      {!loading && !error && <section className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[#070707] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.42)] sm:p-6">
        <div className="pointer-events-none absolute -right-16 top-[-88px] h-44 w-44 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-72px] left-[-36px] h-32 w-32 rounded-full bg-amber-500/6 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-orange-400/15 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300">
              Escala mensal
            </span>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
              Acompanhe seus turnos, faltas e alterações.
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Os status abaixo refletem exatamente os registros da sua escala:
              escalado, falta, turno extra, folga ou removido.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[520px]">
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Mês
              </p>
              <p className="mt-2 text-sm font-semibold capitalize text-white">
                {monthLabel}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Escalados
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                {summary.scheduled}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Faltas
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                {summary.absent}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Próximos
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                {summary.upcoming}
              </p>
            </div>
          </div>
        </div>
      </section>}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex w-fit items-center gap-1 rounded-2xl border border-white/8 bg-[#090909] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
          <button
            type="button"
            onClick={prevMonth}
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
            onClick={nextMonth}
            aria-label="Próximo mês"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-white/[0.04] hover:text-orange-300"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {SCHEDULE_STATUS_VALUES.map((status) => {
            const item = getScheduleStatusPresentation(status);
            return (
              <div
                key={status}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${item.chipClass}`}
              >
                <span className={`h-2 w-2 rounded-full ${item.dotClass}`} />
                {item.label}
              </div>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-[28px] border border-white/8 bg-[#090909]">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <RequestError
          title="Não foi possível carregar sua escala"
          onRetry={() => setReloadKey((key) => key + 1)}
        />
      ) : days.length === 0 ? (
        <div className="rounded-[28px] border border-white/8 bg-[#090909] p-4 sm:p-6">
          <EmptyState
            icon="📅"
            title="Escala ainda não gerada"
            description="O admin ainda não gerou sua escala para este mês."
          />
        </div>
      ) : (
        <>
          <section className="overflow-hidden rounded-[28px] border border-white/8 bg-[#090909] shadow-[0_18px_50px_rgba(0,0,0,0.32)]">
            <div className="grid grid-cols-7 border-b border-white/8 bg-white/[0.02]">
              {WEEKDAYS_SHORT.map((weekday) => (
                <div
                  key={weekday}
                  className="py-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500"
                >
                  {weekday}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {Array.from({ length: firstWeekday }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="min-h-[88px] border-b border-r border-white/6 bg-white/[0.015] sm:min-h-[108px]"
                />
              ))}

              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const date = new Date(year, month - 1, day);
                const dateKey = getLocalDateInputValue(date);
                const entry = dayMap.get(dateKey);
                const isToday = dateKey === todayKey;
                const column = (firstWeekday + index) % 7;
                const display = entry
                  ? getScheduleStatusPresentation(entry.status)
                  : null;

                return (
                  <div
                    key={day}
                    className={`min-h-[88px] border-b border-white/6 p-2 sm:min-h-[108px] sm:p-3 ${
                      column < 6 ? "border-r" : ""
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
                      {day}
                    </div>

                    {display && (
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${display.dotClass}`}
                          />
                          <span className="hidden text-[11px] font-medium text-slate-400 sm:block">
                            {display.label}
                          </span>
                          <span className="text-[10px] font-medium text-slate-500 sm:hidden">
                            {display.shortLabel}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="overflow-hidden rounded-[28px] border border-white/8 bg-[#090909] shadow-[0_18px_50px_rgba(0,0,0,0.32)]">
            <div className="flex flex-col gap-3 border-b border-white/8 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Detalhamento do mês
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Lista completa dos dias registrados na sua escala.
                </p>
              </div>

              <div className="inline-flex w-fit items-center rounded-full border border-orange-400/15 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
                {sortedDays.length} registro{sortedDays.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="p-2 sm:p-3">
              <div className="space-y-2">
                {sortedDays.map((day) => {
                  const date = parseCivilDate(day.date);
                  const isToday = getCivilDateKey(day.date) === todayKey;
                  const display = getScheduleStatusPresentation(day.status);
                  const note = day.note?.trim() || display.defaultNote;

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

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3 sm:w-[200px] sm:shrink-0">
                          <div
                            className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border ${
                              isToday
                                ? "border-orange-400/20 bg-[#140D08]"
                                : "border-white/8 bg-white/[0.03]"
                            }`}
                          >
                            <span
                              className={`text-base font-bold leading-none ${
                                isToday ? "text-orange-300" : "text-white"
                              }`}
                            >
                              {date.getDate()}
                            </span>
                            <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                              {date
                                .toLocaleDateString("pt-BR", {
                                  weekday: "short",
                                })
                                .replace(".", "")}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white">
                              {date.toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {isToday
                                ? "Dia atual da escala"
                                : "Dia da escala"}
                            </p>
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-slate-300">{note}</p>
                        </div>

                        <div className="flex items-center gap-2 sm:shrink-0">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${display.badgeClass}`}
                          >
                            {display.label}
                          </span>

                          {isToday && (
                            <span className="rounded-full border border-orange-400/15 bg-orange-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-300">
                              Hoje
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
