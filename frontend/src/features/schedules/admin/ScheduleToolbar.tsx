import type { ReactNode } from "react";
import {
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Users,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import type { Employee } from "../../../types";

interface Metrics {
  records: number;
  employees: number;
  scheduled: number;
  changes: number;
}

interface Props {
  monthLabel: string;
  employees: Employee[];

  filterEmployeeId: string;
  onFilterChange: (employeeId: string) => void;

  loading: boolean;
  error: boolean;
  generating: boolean;

  metrics: Metrics;

  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onRefresh: () => void;
  onGenerate: () => void;
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
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          {label}
        </p>

        <p className="mt-0.5 text-sm font-semibold leading-none text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function ScheduleToolbar({
  monthLabel,
  employees,
  filterEmployeeId,
  onFilterChange,
  loading,
  error,
  generating,
  metrics,
  onPreviousMonth,
  onNextMonth,
  onRefresh,
  onGenerate,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[#070707]/90 shadow-[0_16px_60px_rgba(0,0,0,0.34)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

      <div className="pointer-events-none absolute -right-14 top-0 h-28 w-28 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-2.5 p-3">
        <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
            <div className="flex h-11 items-center gap-1 rounded-2xl border border-white/10 bg-[#0A0A0A] p-1">
              <button
                type="button"
                onClick={onPreviousMonth}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-white/5 hover:text-white"
                aria-label="Mês anterior"
              >
                <ChevronLeft size={15} />
              </button>

              <div className="min-w-[170px] px-2.5 text-center sm:min-w-[210px]">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Competência
                </p>

                <p className="mt-0.5 text-sm font-semibold capitalize leading-none text-white">
                  {monthLabel}
                </p>
              </div>

              <button
                type="button"
                onClick={onNextMonth}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-white/5 hover:text-white"
                aria-label="Próximo mês"
              >
                <ChevronRight size={15} />
              </button>
            </div>

            <select
              aria-label="Filtrar funcionário"
              value={filterEmployeeId}
              onChange={(event) =>
                onFilterChange(event.target.value)
              }
              className="h-11 min-w-[230px] rounded-2xl border border-white/10 bg-[#0A0A0A] px-4 text-sm text-slate-200 outline-none transition-all hover:border-white/15 focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/15"
            >
              <option value="">
                Todos os funcionários
              </option>

              {employees.map((employee) => (
                <option
                  key={employee.id}
                  value={employee.id}
                >
                  {employee.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw size={12} />}
              onClick={onRefresh}
            >
              Atualizar
            </Button>

            {!error && (
              <Button
                type="button"
                size="sm"
                leftIcon={<CalendarPlus size={13} />}
                onClick={onGenerate}
                loading={generating}
              >
                Gerar escala
              </Button>
            )}
          </div>
        </div>

        {!loading && !error && (
          <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
            <CompactStat
              icon={<CalendarDays size={15} />}
              label="Registros"
              value={metrics.records}
            />

            <CompactStat
              icon={<Users size={15} />}
              label="Funcionários"
              value={metrics.employees}
            />

            <CompactStat
              icon={<CalendarDays size={15} />}
              label="Agendados"
              value={metrics.scheduled}
            />

            <CompactStat
              icon={<CalendarDays size={15} />}
              label="Alterações"
              value={metrics.changes}
            />
          </div>
        )}
      </div>
    </section>
  );
}
