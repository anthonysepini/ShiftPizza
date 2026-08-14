import Card from "../../components/ui/Card";

interface Props {
  total: number;
  today: number;
  generatedMonths: number;
}

export default function AuditMetrics({
  total,
  today,
  generatedMonths,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="relative overflow-hidden border border-white/10 bg-[#000000] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_18px_50px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/35 to-transparent" />

        <div className="p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Total de registros
          </p>

          <div className="mt-3 flex items-end justify-between gap-3">
            <p className="text-3xl font-semibold tracking-tight text-white">
              {total}
            </p>

            <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-200">
              Últimos 100
            </span>
          </div>
        </div>
      </Card>

      <Card className="relative overflow-hidden border border-white/10 bg-[#080808] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_18px_50px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/35 to-transparent" />

        <div className="p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Ações de hoje
          </p>

          <div className="mt-3 flex items-end justify-between gap-3">
            <p className="text-3xl font-semibold tracking-tight text-white">
              {today}
            </p>

            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-300">
              Tempo real
            </span>
          </div>
        </div>
      </Card>

      <Card className="relative overflow-hidden border border-white/10 bg-[#080808] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_18px_50px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/35 to-transparent" />

        <div className="p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Escalas geradas
          </p>

          <div className="mt-3 flex items-end justify-between gap-3">
            <p className="text-3xl font-semibold tracking-tight text-white">
              {
                generatedMonths
              }
            </p>

            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-300">
              Histórico
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
