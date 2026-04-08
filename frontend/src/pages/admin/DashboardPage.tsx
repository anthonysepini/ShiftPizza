import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  CalendarDays,
  Activity,
} from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { employeesService } from "../../services/employees.service";
import { schedulesService } from "../../services/schedules.service";
import { auditService } from "../../services/audit.service";
import type { Employee, AuditLog, ScheduleDay } from "../../types";

// Definido fora do componente — não muda entre renders
const NOW = new Date();
const CURRENT_YEAR = NOW.getFullYear();
const CURRENT_MONTH = NOW.getMonth() + 1;
const MONTH_NAME = NOW.toLocaleDateString("pt-BR", {
  month: "long",
  year: "numeric",
});

const ACTION_LABEL: Record<string, { label: string; icon: string }> = {
  GENERATE_MONTH: { label: "Escala gerada", icon: "📅" },
  UPDATE_DAY: { label: "Dia alterado", icon: "✏️" },
  CREATE_EMPLOYEE: { label: "Funcionário cadastrado", icon: "👤" },
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genMsg, setGenMsg] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [e, l, d] = await Promise.all([
        employeesService.findAll(),
        auditService.findAll(6),
        schedulesService.getMonthSchedule(CURRENT_YEAR, CURRENT_MONTH),
      ]);
      setEmployees(e);
      setLogs(l);
      setDays(d);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenMsg("");
    try {
      const r = await schedulesService.generateMonth({
        year: CURRENT_YEAR,
        month: CURRENT_MONTH,
      });
      setGenMsg(
        `✅ ${r.created} dias criados para ${NOW.toLocaleDateString("pt-BR", { month: "long" })}`,
      );
      const [d, l] = await Promise.all([
        schedulesService.getMonthSchedule(CURRENT_YEAR, CURRENT_MONTH),
        auditService.findAll(6),
      ]);
      setDays(d);
      setLogs(l);
    } catch {
      setGenMsg("❌ Erro ao gerar escala.");
    } finally {
      setGenerating(false);
    }
  };

  const active = employees.filter((e) => e.isActive).length;
  const inactive = employees.filter((e) => !e.isActive).length;
  const absents = days.filter((d) => d.status === "ABSENT").length;
  const today = days.filter((d) => {
    const dt = new Date(d.date);
    return (
      dt.getUTCDate() === NOW.getDate() &&
      dt.getUTCMonth() === NOW.getMonth() &&
      d.status === "SCHEDULED"
    );
  }).length;

  const activePercent =
    employees.length > 0 ? (active / employees.length) * 100 : 0;
  const absentPercent = days.length > 0 ? (absents / days.length) * 100 : 0;
  const todayPercent =
    employees.length > 0 ? Math.min((today / employees.length) * 100, 100) : 0;

  if (loading) {
    return (
      <div className="flex min-h-[42vh] items-center justify-center">
        <div className="flex min-w-55 items-center justify-center rounded-[28px] border border-white/10 bg-[#050505]/90 px-8 py-10 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in w-full space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle={`Visão geral — ${MONTH_NAME}`}
        action={
          <Button
            onClick={() => void handleGenerate()}
            loading={generating}
            size="sm"
          >
            Gerar escala do mês
          </Button>
        }
      />

      {genMsg && (
        <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-linear-to-r from-orange-500/10 to-amber-500/5 px-4 py-3.5 text-sm text-orange-100 shadow-[0_14px_30px_rgba(249,115,22,0.08)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-orange-300/35 to-transparent" />
          <span className="relative">{genMsg}</span>
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <div className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-[#050505]/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.38)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-orange-300/30 to-transparent" />
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                ㅤEquipe
              </p>
              <h3 className="mt-2 text-sm font-medium text-slate-300">
                ㅤFuncionários ativos
              </h3>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10">
              <Users size={18} className="text-orange-300" />
            </div>
          </div>

          <div className="relative mt-6">
            <p className="text-4xl font-black tracking-tight text-white">
              ㅤ{active}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {inactive > 0
                ? `${inactive} inativo${inactive > 1 ? "s" : ""} • ${employees.length} total`
                : `ㅤTodos ativos • ${employees.length} total`}
            </p>
          </div>

          <div className="relative mt-5 h-1.5 w-full rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-linear-to-r from-orange-500 to-amber-400"
              style={{
                width: `${Math.min(Math.max(activePercent, employees.length ? 10 : 0), 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-[#050505]/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.38)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-orange-300/30 to-transparent" />
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                ㅤOcorrências
              </p>
              <h3 className="mt-2 text-sm font-medium text-slate-300">
                ㅤFaltas no mês
              </h3>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10">
              <AlertTriangle size={18} className="text-orange-300" />
            </div>
          </div>

          <div className="relative mt-6">
            <p className="text-4xl font-black tracking-tight text-white">
              ㅤ{absents}
            </p>
            <p className="mt-2 text-sm capitalize leading-6 text-slate-500">
              ㅤ{MONTH_NAME}
            </p>
          </div>

          <div className="relative mt-5 h-1.5 w-full rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-linear-to-r from-orange-500 to-orange-300"
              style={{
                width: `${Math.min(Math.max(absentPercent, absents > 0 ? 10 : 0), 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-[#050505]/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.38)] sm:col-span-2 xl:col-span-1">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-orange-300/30 to-transparent" />
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-400/10 blur-2xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                ㅤHoje
              </p>
              <h3 className="mt-2 text-sm font-medium text-slate-300">
                ㅤTrabalhando hoje
              </h3>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10">
              <CheckCircle size={18} className="text-orange-300" />
            </div>
          </div>

          <div className="relative mt-6">
            <p className="text-4xl font-black tracking-tight text-white">
              ㅤ{today}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              ㅤTurnos agendados para o dia
            </p>
          </div>

          <div className="relative mt-5 h-1.5 w-full rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-linear-to-r from-amber-400 to-orange-500"
              style={{
                width: `${Math.min(Math.max(todayPercent, today > 0 ? 10 : 0), 100)}%`,
              }}
            />
          </div>
        </div>
      </section>

      <section className="mt-2 grid grid-cols-1 gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Card>
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10">
                  <Activity size={18} className="text-orange-300" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-base font-semibold tracking-tight text-white">
                    Atividade recente
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Últimas ações registradas no sistema
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/admin/audit")}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3.5 py-2 text-xs font-semibold text-orange-300 transition-all hover:border-orange-400/30 hover:bg-orange-500/15 hover:text-orange-200"
              >
                Ver tudo
                <ArrowRight size={13} />
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="rounded-3xl border border-white/8 bg-[#070707]/70 px-6 py-12 text-center">
                <p className="text-3xl">📋</p>
                <p className="mt-3 text-sm font-medium text-slate-300">
                  Nenhuma atividade ainda
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  As ações recentes aparecerão aqui assim que forem registradas.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => {
                  const cfg = ACTION_LABEL[log.action] ?? {
                    label: log.action,
                    icon: "⚙️",
                  };

                  return (
                    <div
                      key={log.id}
                      className="group flex items-center gap-3 rounded-[22px] border border-white/8 bg-[#070707]/75 px-4 py-3.5 transition-all hover:border-orange-500/15 hover:bg-[#0A0A0A]"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-[#111111] text-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                        {cfg.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-200">
                          {cfg.label}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {log.actor?.employee?.fullName ?? "—"}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-full border border-white/8 bg-white/3 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {new Date(log.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="space-y-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10">
                <TrendingUp size={18} className="text-orange-300" />
              </div>

              <div className="min-w-0">
                <h3 className="text-base font-semibold tracking-tight text-white">
                  Acesso rápido
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Navegação direta para as áreas mais usadas
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: "Gerenciar funcionários",
                  icon: <Users size={18} className="text-orange-300" />,
                  sub: `${employees.length} cadastrados`,
                  to: "/admin/employees",
                },
                {
                  label: "Ver escala do mês",
                  icon: <CalendarDays size={18} className="text-orange-300" />,
                  sub: `${days.length} dias gerados`,
                  to: "/admin/schedule",
                },
                {
                  label: "Ver histórico de ações",
                  icon: <Activity size={18} className="text-orange-300" />,
                  sub: `${logs.length} ações recentes`,
                  to: "/admin/audit",
                },
              ].map(({ label, icon, sub, to }) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className="group flex w-full items-center gap-4 rounded-[22px] border border-white/8 bg-[#070707]/75 px-4 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-500/20 hover:bg-[#0A0A0A]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-500/15 bg-orange-500/10">
                    {icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">
                      {label}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {sub}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/3 transition-colors group-hover:border-orange-500/20 group-hover:bg-orange-500/10">
                    <ArrowRight
                      size={14}
                      className="text-slate-500 transition-colors group-hover:text-orange-300"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
