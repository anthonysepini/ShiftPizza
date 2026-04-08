import { useState, useEffect, useCallback, type ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CalendarPlus,
  CalendarDays,
  Users,
} from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import ToastContainer from "../../components/ui/Toast";
import { useToast } from "../../hooks/useToast";
import { schedulesService } from "../../services/schedules.service";
import { employeesService } from "../../services/employees.service";
import type { ScheduleDay, ScheduleStatus, Employee } from "../../types";

const WEEKDAYS_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];

const STATUS_OPTIONS: { value: ScheduleStatus; label: string }[] = [
  { value: "SCHEDULED", label: "ㅤ✅ Agendado" },
  { value: "ABSENT", label: "ㅤ❌ Falta" },
  { value: "EXTRA_SHIFT", label: "ㅤ➕ Turno Extra" },
  { value: "DAY_OFF", label: "ㅤ🌴 Folga" },
  { value: "REMOVED_SHIFT", label: "ㅤ🗑️ Removido" },
];

const STATUS_COLOR: Record<
  ScheduleStatus,
  { bg: string; text: string; border: string }
> = {
  SCHEDULED: {
    bg: "rgba(34,197,94,0.10)",
    text: "#86efac",
    border: "rgba(34,197,94,0.22)",
  },
  ABSENT: {
    bg: "rgba(239,68,68,0.10)",
    text: "#fca5a5",
    border: "rgba(239,68,68,0.22)",
  },
  EXTRA_SHIFT: {
    bg: "rgba(59,130,246,0.10)",
    text: "#93c5fd",
    border: "rgba(59,130,246,0.22)",
  },
  DAY_OFF: {
    bg: "rgba(234,179,8,0.10)",
    text: "#fde047",
    border: "rgba(234,179,8,0.22)",
  },
  REMOVED_SHIFT: {
    bg: "rgba(100,116,139,0.10)",
    text: "#cbd5e1",
    border: "rgba(100,116,139,0.22)",
  },
};

function getDateKey(date: string | Date) {
  return new Date(date).toISOString().split("T")[0];
}

function CompactStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex h-[52px] items-center gap-2.5 rounded-2xl border border-white/10 bg-[#0A0A0A] px-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-orange-500/15 bg-orange-500/10 text-orange-300">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-[0.22em] text-slate-500">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-semibold leading-none text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function SchedulePage() {
  const { toasts, toast, remove } = useToast();
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filterEmp, setFilterEmp] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState<ScheduleDay | null>(null);
  const [editStatus, setEditStatus] = useState<ScheduleStatus>("SCHEDULED");
  const [editNote, setEditNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, e] = await Promise.all([
        schedulesService.getMonthSchedule(year, month, filterEmp || undefined),
        employeesService.findAll(),
      ]);
      setDays(d);
      setEmployees(e);
    } finally {
      setLoading(false);
    }
  }, [year, month, filterEmp]);

  useEffect(() => {
    void load();
  }, [load]);

  const prevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
      return;
    }
    setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
      return;
    }
    setMonth((m) => m + 1);
  };

  const monthLabel = new Date(year, month - 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const r = await schedulesService.generateMonth({ year, month });
      toast(`✅ ${r.created} dias criados para ${monthLabel}`, "success");
      await load();
    } catch {
      toast("Escala já gerada ou erro ao gerar.", "info");
    } finally {
      setGenerating(false);
    }
  };

  const openEdit = (day: ScheduleDay) => {
    setSelected(day);
    setEditStatus(day.status);
    setEditNote(day.note ?? "");
  };

  const handleSave = async () => {
    if (!selected) return;

    setSaving(true);
    try {
      await schedulesService.updateDay(selected.id, {
        status: editStatus,
        note: editNote,
      });
      toast("Dia atualizado com sucesso!", "success");
      setSelected(null);
      await load();
    } catch {
      toast("Erro ao atualizar dia.", "error");
    } finally {
      setSaving(false);
    }
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const trailingEmptyCells = (7 - ((firstWeekday + daysInMonth) % 7)) % 7;

  const dayMap = new Map<string, ScheduleDay[]>();
  days.forEach((d) => {
    const key = getDateKey(d.date);
    dayMap.set(key, [...(dayMap.get(key) ?? []), d]);
  });

  const totalScheduled = days.filter((d) => d.status === "SCHEDULED").length;
  const totalChanges = days.filter((d) => d.status !== "SCHEDULED").length;
  const visibleEmployees = filterEmp
    ? employees.find((e) => String(e.id) === filterEmp)
      ? 1
      : 0
    : employees.length;

  return (
    <div className="animate-in flex h-[calc(100vh-1rem)] flex-col gap-0.5">
      <PageHeader
        title="Escala mensal"
        subtitle="Visualize e edite a agenda da equipe."
      />

      <section className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[#070707]/90 shadow-[0_16px_60px_rgba(0,0,0,0.34)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
        <div className="pointer-events-none absolute -right-14 top-0 h-28 w-28 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-2.5 p-3">
          <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
              <div className="flex h-11 items-center gap-1 rounded-2xl border border-white/10 bg-[#0A0A0A] p-1">
                <button
                  onClick={prevMonth}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-white/5 hover:text-white"
                  aria-label="Mês anterior"
                >
                  <ChevronLeft size={15} />
                </button>

                <div className="min-w-[170px] px-2.5 text-center sm:min-w-[210px]">
                  <p className="text-[9px] uppercase tracking-[0.22em] text-slate-500">
                    Competência
                  </p>
                  <p className="mt-0.5 text-sm font-semibold capitalize leading-none text-white">
                    {monthLabel}
                  </p>
                </div>

                <button
                  onClick={nextMonth}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-white/5 hover:text-white"
                  aria-label="Próximo mês"
                >
                  <ChevronRight size={15} />
                </button>
              </div>

              <select
                value={filterEmp}
                onChange={(e) => setFilterEmp(e.target.value)}
                className="h-11 min-w-[230px] rounded-2xl border border-white/10 bg-[#0A0A0A] px-4 text-sm text-slate-200 outline-none transition-all hover:border-white/15 focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/15"
              >
                <option value="">Todos os funcionários</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<RefreshCw size={12} />}
                onClick={() => void load()}
              >
                Atualizar
              </Button>

              <Button
                size="sm"
                leftIcon={<CalendarPlus size={13} />}
                onClick={() => void handleGenerate()}
                loading={generating}
              >
                Gerar escala
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
            <CompactStat
              icon={<CalendarDays size={15} />}
              label="Registros"
              value={days.length}
            />
            <CompactStat
              icon={<Users size={15} />}
              label="Funcionários"
              value={visibleEmployees}
            />
            <CompactStat
              icon={<CalendarDays size={15} />}
              label="Agendados"
              value={totalScheduled}
            />
            <CompactStat
              icon={<CalendarDays size={15} />}
              label="Alterações"
              value={totalChanges}
            />
          </div>
        </div>
      </section>

      {loading ? (
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[26px] border border-white/10 bg-[#070707]/90 shadow-[0_18px_70px_rgba(0,0,0,0.38)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
          <Spinner size="lg" />
        </div>
      ) : days.length === 0 ? (
        <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-[26px] border border-white/10 bg-[#070707]/90 shadow-[0_18px_70px_rgba(0,0,0,0.38)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
          <div className="pointer-events-none absolute -right-20 top-0 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative flex w-full items-center justify-center p-6">
            <EmptyState
              icon="📅"
              title="Escala não gerada para este período"
              description={`Clique em "Gerar escala" para criar automaticamente os dias de ${monthLabel} com base nas regras semanais de cada funcionário.`}
              action={
                <Button
                  leftIcon={<CalendarPlus size={14} />}
                  onClick={() => void handleGenerate()}
                  loading={generating}
                >
                  Gerar escala de {monthLabel}
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[#070707]/90 shadow-[0_20px_80px_rgba(0,0,0,0.42)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
          <div className="pointer-events-none absolute -right-20 top-0 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative flex items-center justify-between gap-3 border-b border-white/8 px-4 py-2.5">
            <div>
              <p className="text-[9px] uppercase tracking-[0.22em] text-orange-300">
                ㅤㅤAgenda operacional
              </p>
              <h2 className="mt-0.5 text-base font-semibold leading-none text-white sm:text-lg">
                Calendário de escala
              </h2>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] px-3 py-1.5 text-right">
              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500">
                Períodoㅤ
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
                className="px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-7 auto-rows-fr">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div
                key={`empty-start-${i}`}
                className="border-b border-r border-white/8 bg-[#050505]"
              />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(year, month - 1, day);
              const key = getDateKey(date);
              const cellDays = dayMap.get(key) ?? [];
              const isToday = date.toDateString() === now.toDateString();
              const col = (firstWeekday + i) % 7;
              const isLastCol = col === 6;
              const isWeekend = col === 0 || col === 6;

              return (
                <div
                  key={day}
                  className={[
                    "group relative min-h-0 overflow-hidden px-1.5 py-1.5",
                    "border-b border-white/8 transition-colors duration-200",
                    !isLastCol ? "border-r border-white/8" : "",
                    isWeekend ? "bg-[#060606]" : "bg-[#080808]",
                    "hover:bg-[#0B0B0B]",
                  ].join(" ")}
                >
                  <div className="mb-1.5 flex items-start justify-between gap-1">
                    <div
                      className={[
                        "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold transition-all duration-200 sm:h-7 sm:w-7 sm:text-[11px]",
                        isToday
                          ? "bg-orange-500 text-white shadow-[0_10px_24px_rgba(249,115,22,0.32)]"
                          : "bg-white/[0.03] text-slate-400 group-hover:bg-white/[0.05] group-hover:text-slate-200",
                      ].join(" ")}
                    >
                      {day}
                    </div>

                    {isToday && (
                      <span className="hidden rounded-full border border-orange-500/20 bg-orange-500/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-orange-300 lg:block">
                        Hoje
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {cellDays.slice(0, 3).map((schedule) => {
                      const sc = STATUS_COLOR[schedule.status];

                      return (
                        <button
                          key={schedule.id}
                          onClick={() => openEdit(schedule)}
                          className="block w-full overflow-hidden rounded-lg px-1.5 py-1 text-left text-[9px] font-medium leading-tight transition-all duration-200 hover:opacity-95 sm:rounded-xl sm:text-[10px]"
                          style={{
                            background: sc.bg,
                            color: sc.text,
                            boxShadow: `inset 0 0 0 1px ${sc.border}`,
                          }}
                        >
                          <span className="block truncate">
                            {schedule.employee?.fullName ?? "—"}
                          </span>
                        </button>
                      );
                    })}

                    {cellDays.length > 3 && (
                      <div className="px-1 text-[8px] font-medium text-slate-500 sm:text-[9px]">
                        +{cellDays.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {Array.from({ length: trailingEmptyCells }).map((_, i) => (
              <div
                key={`empty-end-${i}`}
                className="border-b border-white/8 bg-[#050505]"
              />
            ))}
          </div>

          <div className="border-t border-white/8 px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              {STATUS_OPTIONS.map((status) => (
                <Badge key={status.value} status={status.value} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="ㅤEditar dia:"
        size="sm"
      >
        {selected && (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0A0A0A] p-4">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/45 to-transparent" />
              <div className="pointer-events-none absolute -right-16 top-0 h-28 w-28 rounded-full bg-orange-500/8 blur-3xl" />

              <div className="relative">
                <p className="text-[10px] uppercase tracking-[0.2em] text-orange-300">
                  ㅤㅤRegistro selecionado
                </p>

                <p className="mt-2 text-base font-semibold text-white">
                  {selected.employee?.fullName ?? "—"}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                  {new Date(selected.date).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                <div className="mt-3">
                  <Badge status={selected.status} />
                </div>
              </div>
            </div>

            <Select
              label="Novo status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as ScheduleStatus)}
              options={STATUS_OPTIONS}
            />

            <Input
              label="Observação (opcional)"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder="Ex: atestado médico, troca de turno, hora extra..."
            />

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Cancelar
              </Button>

              <Button onClick={() => void handleSave()} loading={saving}>
                Salvar alteração
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ToastContainer toasts={toasts} remove={remove} />
    </div>
  );
}
