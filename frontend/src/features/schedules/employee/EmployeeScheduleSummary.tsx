interface Props {
  monthLabel: string;

  summary: {
    scheduled: number;
    absent: number;
    upcoming: number;
  };
}

export default function EmployeeScheduleSummary({
  monthLabel,
  summary,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[#070707] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.42)] sm:p-6">
      <div className="pointer-events-none absolute -right-16 top-[-88px] h-44 w-44 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="pointer-events-none absolute bottom-[-72px] left-[-36px] h-32 w-32 rounded-full bg-amber-500/6 blur-3xl" />

      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-orange-400/15 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
            Escala mensal
          </span>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
            Resumo de{" "}
            <span className="capitalize">
              {monthLabel}
            </span>
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
            Acompanhe seus turnos,
            faltas registradas e
            próximos dias de trabalho.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 xl:min-w-[420px]">
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Escalados
            </p>

            <p className="mt-2 text-2xl font-bold text-white">
              {summary.scheduled}
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Faltas
            </p>

            <p className="mt-2 text-2xl font-bold text-white">
              {summary.absent}
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Próximos
            </p>

            <p className="mt-2 text-2xl font-bold text-white">
              {summary.upcoming}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
