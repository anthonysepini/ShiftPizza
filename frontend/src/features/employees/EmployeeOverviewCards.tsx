import { Camera, UserCheck, Users } from "lucide-react";

interface Props {
  total: number;
  active: number;
  inactive: number;
  withPhoto: number;
}

export default function EmployeeOverviewCards({
  total,
  active,
  inactive,
  withPhoto,
}: Props) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div className="relative flex min-h-36 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#050505]/90 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.38)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-orange-300/30 to-transparent" />
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Equipe
            </p>
            <h2 className="mt-1.5 text-sm font-medium text-slate-300">
              Total cadastrado
            </h2>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10">
            <Users size={17} className="text-orange-300" />
          </div>
        </div>

        <div className="relative mt-4">
          <p className="text-[2.15rem] font-black tracking-tight text-white">
            {total}
          </p>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            Funcionários registrados no sistema
          </p>
        </div>
      </div>

      <div className="relative flex min-h-36 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#050505]/90 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.38)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-orange-300/30 to-transparent" />
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-500/8 blur-2xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Status
            </p>
            <h2 className="mt-1.5 text-sm font-medium text-slate-300">
              Equipe ativa
            </h2>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10">
            <UserCheck size={17} className="text-orange-300" />
          </div>
        </div>

        <div className="relative mt-4">
          <p className="text-[2.15rem] font-black tracking-tight text-white">
            {active}
          </p>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            {inactive > 0
              ? `${inactive} inativo${inactive > 1 ? "s" : ""}`
              : "Nenhum funcionário inativo"}
          </p>
        </div>
      </div>

      <div className="relative flex min-h-36 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#050505]/90 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.38)] sm:col-span-2 xl:col-span-1">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-orange-300/30 to-transparent" />
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/8 blur-2xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Perfil
            </p>
            <h2 className="mt-1.5 text-sm font-medium text-slate-300">
              Fotos cadastradas
            </h2>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10">
            <Camera size={17} className="text-orange-300" />
          </div>
        </div>

        <div className="relative mt-4">
          <p className="text-[2.15rem] font-black tracking-tight text-white">
            {withPhoto}
          </p>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            {total > 0 ? `${total - withPhoto} sem foto` : "Nenhum cadastro ainda"}
          </p>
        </div>
      </div>
    </section>
  );
}
