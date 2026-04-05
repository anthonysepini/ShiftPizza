import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { auditService } from '../../services/audit.service';
import type { AuditLog } from '../../types';

type ActionConfig = {
  label: string;
  icon: string;
  color: string;
  pillClass: string;
  iconClass: string;
  description: (log: AuditLog) => string;
};

const ACTION_CONFIG: Record<string, ActionConfig> = {
  GENERATE_MONTH: {
    label: 'Escala gerada',
    icon: '📅',
    color: 'text-orange-300',
    pillClass: 'border-orange-500/20 bg-orange-500/10 text-orange-200',
    iconClass: 'border-orange-500/15 bg-orange-500/10 text-orange-200',
    description: (log) => {
      const meta = log.metadata as { year?: number; month?: number; created?: number } | null;

      if (meta?.year && meta?.month) {
        const monthName = new Date(meta.year, meta.month - 1).toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric',
        });

        return `${meta.created ?? 0} dias criados para ${monthName}`;
      }

      return 'Escala mensal gerada automaticamente';
    },
  },
  UPDATE_DAY: {
    label: 'Dia alterado',
    icon: '✏️',
    color: 'text-amber-300',
    pillClass: 'border-amber-500/20 bg-amber-500/10 text-amber-200',
    iconClass: 'border-amber-500/15 bg-amber-500/10 text-amber-200',
    description: (log) => {
      const meta = log.metadata as { from?: string; to?: string; note?: string } | null;

      const statusLabel: Record<string, string> = {
        SCHEDULED: 'Agendado',
        ABSENT: 'Falta',
        EXTRA_SHIFT: 'Turno Extra',
        DAY_OFF: 'Folga',
        REMOVED_SHIFT: 'Removido',
      };

      if (meta?.from && meta?.to) {
        const from = statusLabel[meta.from] ?? meta.from;
        const to = statusLabel[meta.to] ?? meta.to;

        return `Status alterado de ${from} para ${to}${meta.note ? ` · ${meta.note}` : ''}`;
      }

      return 'Status de um dia foi alterado';
    },
  },
  CREATE_EMPLOYEE: {
    label: 'Funcionário cadastrado',
    icon: '👤',
    color: 'text-emerald-300',
    pillClass: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
    iconClass: 'border-emerald-500/15 bg-emerald-500/10 text-emerald-200',
    description: () => 'Novo funcionário adicionado ao sistema',
  },
};

const FALLBACK_ACTION_CONFIG: ActionConfig = {
  label: 'Ação do sistema',
  icon: '⚙️',
  color: 'text-slate-300',
  pillClass: 'border-white/10 bg-white/[0.04] text-slate-200',
  iconClass: 'border-white/10 bg-white/[0.04] text-slate-200',
  description: () => 'Ação do sistema',
};

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFullDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isToday(value: string) {
  const date = new Date(value);
  const now = new Date();

  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditService.findAll(100).then(setLogs).finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => {
    const total = logs.length;
    const today = logs.filter((log) => isToday(log.createdAt)).length;
    const generatedMonths = logs.filter((log) => log.action === 'GENERATE_MONTH').length;

    const latest = logs.reduce<AuditLog | null>((latestLog, currentLog) => {
      if (!latestLog) return currentLog;

      return new Date(currentLog.createdAt).getTime() > new Date(latestLog.createdAt).getTime()
        ? currentLog
        : latestLog;
    }, null);

    return {
      total,
      today,
      generatedMonths,
      latest,
    };
  }, [logs]);

  return (
    <div className="animate-in w-full min-h-full bg-[#050505] text-white">
      <div className="space-y-6 rounded-[28px] border border-white/6 bg-[#050505] p-0">
        <PageHeader
          title="Histórico"
          subtitle="Todas as ações realizadas no sistema"
        />

        {loading ? (
          <Card className="relative overflow-hidden border border-white/10 bg-[#080808] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_22px_70px_rgba(0,0,0,0.45)]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/35 to-transparent" />
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          </Card>
        ) : logs.length === 0 ? (
          <Card className="relative overflow-hidden border border-white/10 bg-[#080808] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_22px_70px_rgba(0,0,0,0.45)]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/35 to-transparent" />
            <div className="p-3 sm:p-5">
              <EmptyState
                icon="📋"
                title="Nenhuma ação registrada"
                description="As ações do admin aparecem aqui."
              />
            </div>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="relative overflow-hidden border border-white/10 bg-[#080808] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_18px_50px_rgba(0,0,0,0.35)]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/35 to-transparent" />
                <div className="p-4 sm:p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Total de registros
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <h3 className="text-3xl font-semibold tracking-tight text-white">
                      {metrics.total}
                    </h3>
                    <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-[11px] font-medium text-orange-200">
                      Últimos 100
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="relative overflow-hidden border border-white/10 bg-[#080808] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_18px_50px_rgba(0,0,0,0.35)]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/35 to-transparent" />
                <div className="p-4 sm:p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Ações de hoje
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <h3 className="text-3xl font-semibold tracking-tight text-white">
                      {metrics.today}
                    </h3>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-slate-300">
                      Tempo real
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="relative overflow-hidden border border-white/10 bg-[#080808] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_18px_50px_rgba(0,0,0,0.35)]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/35 to-transparent" />
                <div className="p-4 sm:p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Escalas geradas
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <h3 className="text-3xl font-semibold tracking-tight text-white">
                      {metrics.generatedMonths}
                    </h3>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-slate-300">
                      Histórico
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <Card className="relative overflow-hidden border border-white/10 bg-[#070707] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_24px_80px_rgba(0,0,0,0.42)]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/35 to-transparent" />

                <div className="border-b border-white/8 px-4 py-4 sm:px-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Timeline do sistema
                      </p>
                      <h2 className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-xl">
                        Últimas ações registradas
                      </h2>
                    </div>

                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300">
                      <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.45)]" />
                      {logs.length} evento{logs.length > 1 ? 's' : ''} carregado{logs.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-3 sm:p-4">
                  {logs.map((log) => {
                    const cfg = ACTION_CONFIG[log.action] ?? {
                      ...FALLBACK_ACTION_CONFIG,
                      label: log.action,
                    };

                    return (
                      <div
                        key={log.id}
                        className="group relative overflow-hidden rounded-[22px] border border-white/10 bg-[#101010] px-4 py-4 transition-all duration-200 hover:border-orange-500/20 hover:bg-[#131313]"
                      >
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-200 group-hover:via-orange-500/30" />

                        <div className="flex items-start gap-4">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${cfg.iconClass}`}
                          >
                            {cfg.icon}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${cfg.pillClass}`}
                                  >
                                    {cfg.label}
                                  </span>

                                  <span className="hidden text-slate-600 sm:inline">•</span>

                                  <p className="truncate text-sm font-medium text-slate-200">
                                    {log.actor?.employee?.fullName ?? 'Sistema'}
                                  </p>
                                </div>

                                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                                  {cfg.description(log)}
                                </p>
                              </div>

                              <div className="shrink-0">
                                <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-right">
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    {formatShortDate(log.createdAt)}
                                  </p>
                                  <p className="mt-1 text-sm font-medium text-slate-300">
                                    {formatTime(log.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <div className="space-y-4">
                <Card className="relative overflow-hidden border border-white/10 bg-[#080808] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_18px_55px_rgba(0,0,0,0.34)]">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/35 to-transparent" />
                  <div className="p-4 sm:p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Última movimentação
                    </p>

                    {metrics.latest ? (
                      <div className="mt-3 space-y-3">
                        <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
                          <p className="text-sm font-medium text-white">
                            {(ACTION_CONFIG[metrics.latest.action] ?? FALLBACK_ACTION_CONFIG).label}
                          </p>
                          <p className="mt-1 text-sm text-slate-400">
                            {formatFullDateTime(metrics.latest.createdAt)}
                          </p>
                          <p className="mt-3 text-xs leading-relaxed text-slate-500">
                            {(ACTION_CONFIG[metrics.latest.action] ?? FALLBACK_ACTION_CONFIG).description(metrics.latest)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-400">
                        Nenhuma movimentação recente.
                      </p>
                    )}
                  </div>
                </Card>

                <Card className="relative overflow-hidden border border-white/10 bg-[#080808] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_18px_55px_rgba(0,0,0,0.34)]">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/35 to-transparent" />
                  <div className="p-4 sm:p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Tipos de ação
                    </p>

                    <div className="mt-4 space-y-3">
                      {Object.entries(ACTION_CONFIG).map(([key, cfg]) => (
                        <div
                          key={key}
                          className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.03] p-3"
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-base ${cfg.iconClass}`}
                          >
                            {cfg.icon}
                          </div>

                          <div className="min-w-0">
                            <p className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
