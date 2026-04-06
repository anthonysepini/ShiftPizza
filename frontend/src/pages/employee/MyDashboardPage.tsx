import { useEffect, useState } from 'react';
import { Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader.tsx';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../features/auth/useAuth';
import { schedulesService } from '../../services/schedules.service';
import type { ScheduleDay } from '../../types';

const TODAY = new Date();
const START_OF_TODAY = new Date(
  TODAY.getFullYear(),
  TODAY.getMonth(),
  TODAY.getDate(),
);

function parseLocalDate(value: string) {
  const normalized = value.split('T')[0];
  const parts = normalized.split('-').map(Number);

  if (parts.length === 3 && parts.every((part) => Number.isFinite(part))) {
    const [year, month, day] = parts;
    return new Date(year, month - 1, day);
  }

  return new Date(value);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function MyDashboardPage() {
  const { user } = useAuth();
  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    schedulesService
      .getMySchedule(TODAY.getFullYear(), TODAY.getMonth() + 1)
      .then((data) => {
        if (!cancelled) {
          setDays(data);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const scheduled = days.filter((d) => d.status === 'SCHEDULED').length;
  const absents = days.filter((d) => d.status === 'ABSENT').length;
  const changed = days.filter((d) => d.source === 'MANUAL').length;

  const upcoming = days
    .filter((d) => {
      const date = parseLocalDate(d.date);
      return d.status === 'SCHEDULED' && date >= START_OF_TODAY;
    })
    .sort(
      (a, b) =>
        parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime(),
    )
    .slice(0, 5);

  const monthName = TODAY.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  const firstName = user?.fullName?.trim().split(' ')[0] ?? '';

  const stats = [
    {
      label: 'ㅤDias escalados',
      value: scheduled,
      icon: CheckCircle,
      helper: 'ㅤTurnos confirmados no mês',
      iconClass: 'text-orange-300',
      iconWrapClass: 'border border-orange-400/15 bg-orange-500/10',
      glowClass: 'bg-orange-500/10',
    },
    {
      label: 'ㅤFaltas',
      value: absents,
      icon: AlertTriangle,
      helper: 'ㅤRegistros de ausência',
      iconClass: 'text-red-300',
      iconWrapClass: 'border border-red-400/15 bg-red-500/10',
      glowClass: 'bg-red-500/10',
    },
    {
      label: 'ㅤAlterações',
      value: changed,
      icon: Calendar,
      helper: 'ㅤAjustes feitos manualmente',
      iconClass: 'text-amber-300',
      iconWrapClass: 'border border-amber-400/15 bg-amber-500/10',
      glowClass: 'bg-amber-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-in space-y-6">
      <PageHeader
        title={`Seja Bem-Vindo, ${firstName} 👋`}
        subtitle={`Confira a sua escala de ${monthName}`}
      />

      <section className="relative overflow-hidden rounded-3xl border border-white/8 bg-[#000000] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:p-6">
        <div className="pointer-events-none absolute -right-16 top-[-72px] h-44 w-44 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-[-64px] h-36 w-36 rounded-full bg-amber-500/5 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-orange-400/15 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300">
              ㅤMeu painel
            </span>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
              Sua rotina de trabalho em um só lugar
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              ㅤAcompanhe os próximos turnos, faltas e alterações da sua escala diretamente aqui, de forma rápida e ㅤorganizada.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Mês atual
              </p>
              <p className="mt-2 text-sm font-semibold text-white capitalize">
                {monthName}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Próximos turnos
              </p>
              <p className="mt-2 text-xl font-bold text-white">
                {upcoming.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Ajustes manuais
              </p>
              <p className="mt-2 text-xl font-bold text-white">{changed}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {stats.map(
          ({
            label,
            value,
            icon: Icon,
            helper,
            iconClass,
            iconWrapClass,
            glowClass,
          }) => (
            <div
              key={label}
              className="relative overflow-hidden rounded-3xl border border-white/8 bg-[#000000] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
            >
              <div
                className={`pointer-events-none absolute -right-8 top-[-28px] h-24 w-24 rounded-full blur-2xl ${glowClass}`}
              />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    {label}
                  </p>
                  <p className="mt-4 text-3xl font-bold tracking-tight text-white">
                    {value}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">{helper}</p>
                </div>

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconWrapClass}`}
                >
                  <Icon size={18} className={iconClass} />
                </div>
              </div>

              <div className="relative mt-5 h-px w-full bg-white/6" />
            </div>
          ),
        )}
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-white/6 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">
              Próximos dias de trabalho
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Veja os seus primeiros 5 turnos confirmados de forma
              organizada:
            </p>
          </div>

          <div className="inline-flex w-fit items-center rounded-full border border-orange-400/15 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
            {upcoming.length} próximo{upcoming.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="mt-5">
          {upcoming.length === 0 ? (
            <EmptyState
              icon="📅"
              title="Nenhum turno agendado"
              description="Aguarde o admin gerar a escala deste mês."
            />
          ) : (
            <div className="space-y-3">
              {upcoming.map((d) => {
                const date = parseLocalDate(d.date);
                const isToday = isSameDay(date, TODAY);

                return (
                  <div
                    key={d.id}
                    className={`relative overflow-hidden rounded-2xl border px-4 py-4 transition-all duration-200 ${
                      isToday
                        ? 'border-orange-500/25 bg-orange-500/10'
                        : 'border-white/8 bg-[#000000] hover:border-orange-500/15 hover:bg-[#000000]'
                    }`}
                  >
                    {isToday && (
                      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-orange-400" />
                    )}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div
                        className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border ${
                          isToday
                            ? 'border-orange-400/20 bg-[#000000]'
                            : 'border-white/8 bg-white/[0.02]'
                        }`}
                      >
                        <span
                          className={`text-lg font-bold leading-none ${
                            isToday ? 'text-orange-300' : 'text-white'
                          }`}
                        >
                          {date.getDate()}
                        </span>

                        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {date
                            .toLocaleDateString('pt-BR', { weekday: 'short' })
                            .replace('.', '')}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-white sm:text-[15px]">
                            {date.toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>

                          {isToday && (
                            <span className="rounded-full border border-orange-400/15 bg-orange-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-300">
                              Hoje
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          {d.note?.trim() ||
                            'Turno programado na sua escala atual.'}
                        </p>
                      </div>

                      <div className="sm:self-center">
                        <Badge status={d.status} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
