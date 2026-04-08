import { useEffect, useMemo, useReducer, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import { schedulesService } from "../../services/schedules.service";
import type { ScheduleDay } from "../../types";

const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

type State = {
  loading: boolean;
  days: ScheduleDay[];
};

type Action =
  | { type: "loading" }
  | { type: "success"; payload: ScheduleDay[] }
  | { type: "error" };

type DisplayStatusKey =
  | "PRESENT"
  | "SCHEDULED"
  | "ABSENT"
  | "EXTRA"
  | "DAY_OFF";

type DisplayStatus = {
  key: DisplayStatusKey;
  label: string;
  shortLabel: string;
  dotClass: string;
  badgeClass: string;
  chipClass: string;
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "loading":
      return { ...state, loading: true };
    case "success":
      return { loading: false, days: action.payload };
    case "error":
      return { loading: false, days: [] };
    default:
      return state;
  }
}

function parseLocalDate(value: string) {
  const normalized = value.split("T")[0];
  const [year, month, day] = normalized.split("-").map(Number);

  if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
    return new Date(year, month - 1, day);
  }

  const fallback = new Date(value);
  fallback.setHours(0, 0, 0, 0);
  return fallback;
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function normalizeText(value?: string | null) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function hasVacationSignal(day: ScheduleDay) {
  const rawStatus = String(day.status).toUpperCase();
  const note = normalizeText(day.note);

  return (
    rawStatus.includes("VACATION") ||
    rawStatus.includes("VACATIONS") ||
    rawStatus.includes("VACACAO") ||
    rawStatus.includes("FERIAS") ||
    note.includes("ferias") ||
    note.includes("vacation")
  );
}

function getDisplayStatus(day: ScheduleDay): DisplayStatus {
  const dayDate = parseLocalDate(day.date);
  const isPast = dayDate < TODAY;
  const rawStatus = String(day.status).toUpperCase();

  if (
    rawStatus === "ABSENT" ||
    rawStatus === "REMOVED_SHIFT" ||
    hasVacationSignal(day)
  ) {
    return {
      key: "ABSENT",
      label: "Ausente",
      shortLabel: "Aus.",
      dotClass: "bg-red-400",
      badgeClass: "border-red-500/20 bg-red-500/10 text-red-300",
      chipClass: "border-red-500/15 bg-red-500/8 text-red-300",
    };
  }

  if (rawStatus === "DAY_OFF") {
    return {
      key: "DAY_OFF",
      label: "Folga",
      shortLabel: "Folga",
      dotClass: "bg-zinc-400",
      badgeClass: "border-white/10 bg-white/[0.04] text-zinc-300",
      chipClass: "border-white/10 bg-white/[0.03] text-zinc-300",
    };
  }

  if (rawStatus === "EXTRA_SHIFT") {
    return {
      key: "EXTRA",
      label: "Extra",
      shortLabel: "Extra",
      dotClass: "bg-amber-300",
      badgeClass: "border-amber-500/20 bg-amber-500/10 text-amber-300",
      chipClass: "border-amber-500/15 bg-amber-500/8 text-amber-300",
    };
  }

  if (isPast && rawStatus === "SCHEDULED") {
    return {
      key: "PRESENT",
      label: "Presente",
      shortLabel: "Pres.",
      dotClass: "bg-emerald-400",
      badgeClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
      chipClass: "border-emerald-500/15 bg-emerald-500/8 text-emerald-300",
    };
  }

  return {
    key: "SCHEDULED",
    label: "Escalado",
    shortLabel: "Ag.",
    dotClass: "bg-orange-400",
    badgeClass: "border-orange-500/20 bg-orange-500/10 text-orange-300",
    chipClass: "border-orange-500/15 bg-orange-500/8 text-orange-300",
  };
}

function getDefaultNote(day: ScheduleDay, display: DisplayStatus) {
  if (day.note?.trim()) {
    return day.note.trim();
  }

  switch (display.key) {
    case "PRESENT":
      return "Turno concluído com presença registrada.";
    case "ABSENT":
      return "Registro de ausência, remoção ou férias neste dia.";
    case "EXTRA":
      return "Turno extra registrado na sua escala.";
    case "DAY_OFF":
      return "Dia livre sem turno programado.";
    case "SCHEDULED":
    default:
      return "Turno programado na sua escala atual.";
  }
}

export default function MyCalendarPage() {
  const [year, setYear] = useState(TODAY.getFullYear());
  const [month, setMonth] = useState(TODAY.getMonth() + 1);
  const [{ loading, days }, dispatch] = useReducer(reducer, {
    loading: true,
    days: [],
  });

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
  }, [year, month]);

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
    return [...days].sort(
      (a, b) =>
        parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime(),
    );
  }, [days]);

  const dayMap = useMemo(() => {
    return new Map(
      sortedDays.map((day) => [getDateKey(parseLocalDate(day.date)), day]),
    );
  }, [sortedDays]);

  const summary = useMemo(() => {
    return sortedDays.reduce(
      (acc, day) => {
        const display = getDisplayStatus(day);
        const date = parseLocalDate(day.date);

        if (display.key === "PRESENT") {
          acc.present += 1;
        }

        if (display.key === "ABSENT") {
          acc.absent += 1;
        }

        if (display.key === "EXTRA") {
          acc.extra += 1;
        }

        if (
          date >= TODAY &&
          (display.key === "SCHEDULED" || display.key === "EXTRA")
        ) {
          acc.upcoming += 1;
        }

        return acc;
      },
      { present: 0, absent: 0, upcoming: 0, extra: 0 },
    );
  }, [sortedDays]);

  return (
    <div className="animate-in w-full space-y-6">
      <PageHeader title="Minha Escala" subtitle="Visualize seu mês aqui." />

      <section className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[#070707] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.42)] sm:p-6">
        <div className="pointer-events-none absolute -right-16 top-[-88px] h-44 w-44 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-72px] left-[-36px] h-32 w-32 rounded-full bg-amber-500/6 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-orange-400/15 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300">
              ㅤEscala mensal
            </span>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
              Acompanhe seus turnos, presenças e ausências.
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              ㅤDias concluídos aparecem como presente apenas quando o turno foi
              concluído.ㅤㅤㅤㅤㅤ Falta, remoção e férias são exibidos como
              ausente.
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
                Presentes
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                {summary.present}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Ausências
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
      </section>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex w-fit items-center gap-1 rounded-2xl border border-white/8 bg-[#090909] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
          <button
            onClick={prevMonth}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-white/[0.04] hover:text-orange-300"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="min-w-[188px] px-4 text-center text-sm font-semibold capitalize text-white">
            {monthLabel}
          </span>

          <button
            onClick={nextMonth}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-white/[0.04] hover:text-orange-300"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            {
              label: "Presente",
              dotClass: "bg-emerald-400",
              chipClass:
                "border-emerald-500/15 bg-emerald-500/8 text-emerald-300",
            },
            {
              label: "Escalado",
              dotClass: "bg-orange-400",
              chipClass: "border-orange-500/15 bg-orange-500/8 text-orange-300",
            },
            {
              label: "Ausente",
              dotClass: "bg-red-400",
              chipClass: "border-red-500/15 bg-red-500/8 text-red-300",
            },
            {
              label: "Extra",
              dotClass: "bg-amber-300",
              chipClass: "border-amber-500/15 bg-amber-500/8 text-amber-300",
            },
            {
              label: "Folga",
              dotClass: "bg-zinc-400",
              chipClass: "border-white/10 bg-white/[0.03] text-zinc-300",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${item.chipClass}`}
            >
              <span className={`h-2 w-2 rounded-full ${item.dotClass}`} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-[28px] border border-white/8 bg-[#090909]">
          <Spinner size="lg" />
        </div>
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
                const entry = dayMap.get(getDateKey(date));
                const isToday = isSameDay(date, TODAY);
                const column = (firstWeekday + index) % 7;
                const display = entry ? getDisplayStatus(entry) : null;

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
                          ? "bg-orange-500 text-white shadow-[0_10px_24px_rgba(249,115,22,0.25)]"
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
                  ㅤDetalhamento do mês
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
                  const date = parseLocalDate(day.date);
                  const isToday = isSameDay(date, TODAY);
                  const display = getDisplayStatus(day);
                  const note = getDefaultNote(day, display);

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
