import { CalendarDays, Users } from "lucide-react";

interface DayLoad {
  label: string;
  count: number;
}

interface Props {
  total: number;
  active: number;
  inactive: number;
  weekdayLoad: DayLoad[];
  strongestDay: DayLoad;
}

export default function EmployeeInsights({
  total,
  active,
  inactive,
  weekdayLoad,
  strongestDay,
}: Props) {
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#050505]/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.38)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-orange-300/28 to-transparent" />
        <div className="pointer-events-none absolute -right-8 top-0 h-24 w-24 rounded-full bg-orange-500/8 blur-2xl" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10">
              <CalendarDays size={18} className="text-orange-300" />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-semibold tracking-tight text-white">
                Resumo da equipe
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Estado atual dos cadastros e da operação
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/8 bg-[#070707]/78 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Total
              </p>
              <p className="mt-2 text-2xl font-black tracking-tight text-white">
                {total}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-[#070707]/78 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Ativos
              </p>
              <p className="mt-2 text-2xl font-black tracking-tight text-white">
                {active}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-[#070707]/78 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Inativos
              </p>
              <p className="mt-2 text-2xl font-black tracking-tight text-white">
                {inactive}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[22px] border border-orange-500/15 bg-orange-500/8 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
              Destaque semanal
            </p>
            <p className="mt-2 text-sm text-slate-200">
              {strongestDay.count > 0
                ? `${strongestDay.label} é o dia com mais funcionários trabalhando.`
                : "Ainda não há dias de trabalho configurados na equipe."}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {strongestDay.count > 0
                ? `${strongestDay.count} funcionário${strongestDay.count > 1 ? "s" : ""} escalado${strongestDay.count > 1 ? "s" : ""}`
                : "Configure as regras semanais para visualizar a distribuição."}
            </p>
          </div>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-[#050505]/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.38)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-orange-300/28 to-transparent" />
        <div className="pointer-events-none absolute -right-8 bottom-0 h-24 w-24 rounded-full bg-orange-500/8 blur-2xl" />

        <div className="relative flex h-full flex-col">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10">
              <Users size={18} className="text-orange-300" />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-semibold tracking-tight text-white">
                Cobertura semanal
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Distribuição dos dias de trabalho da equipe
              </p>
            </div>
          </div>

          <div className="mt-5 flex-1 space-y-3">
            {weekdayLoad.map((day) => (
              <div
                key={day.label}
                className="rounded-[20px] border border-white/8 bg-[#070707]/78 p-3.5"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-200">
                    {day.label}
                  </span>
                  <span className="text-xs text-slate-500">
                    {day.count} funcionário{day.count !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="h-1.5 w-full rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-orange-500 to-amber-400"
                    style={{
                      width: `${Math.min(
                        Math.max(
                          total > 0 ? (day.count / total) * 100 : 0,
                          day.count > 0 ? 12 : 0,
                        ),
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
