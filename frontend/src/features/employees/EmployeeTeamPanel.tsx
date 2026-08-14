import {
  AlertTriangle,
  ArrowRight,
  Edit2,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import type { Employee } from "../../types";
import { Avatar } from "./EmployeeDialogs";
import { WEEKDAYS } from "./employee-data";

interface Props {
  employees: Employee[];
  search: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
  onMarkAbsence: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onToggle: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onPhotoError: (message: string) => void;
}

export default function EmployeeTeamPanel({
  employees,
  search,
  onSearchChange,
  onCreate,
  onMarkAbsence,
  onEdit,
  onToggle,
  onDelete,
  onPhotoError,
}: Props) {
  return (
    <div className="relative flex h-full min-h-140 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#050505]/90 shadow-[0_28px_70px_rgba(0,0,0,0.42)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-orange-300/28 to-transparent" />
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl" />

      <div className="relative border-b border-white/8 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Gestão da equipe
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
              Funcionários cadastrados
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Controle completo da equipe, regras semanais e ações rápidas.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 lg:max-w-105">
            <div className="group flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-[#0A0A0A] px-4 transition-all hover:border-white/15 focus-within:border-orange-400/30 focus-within:ring-4 focus-within:ring-orange-400/10">
              <Search size={15} className="shrink-0 text-slate-500" />
              <input
                aria-label="Buscar funcionário"
                placeholder="Buscar por nome ou cargo..."
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-slate-200 outline-none placeholder:text-slate-600"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                {employees.length} resultado{employees.length !== 1 ? "s" : ""}{" "}
                encontrado{employees.length !== 1 ? "s" : ""}
              </p>

              <button
                type="button"
                onClick={onCreate}
                className="inline-flex items-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-xs font-semibold text-orange-300 transition-all hover:border-orange-400/30 hover:bg-orange-500/15 hover:text-orange-200"
              >
                Novo funcionário
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex-1 px-5 py-5 sm:px-6">
        {employees.length === 0 ? (
          <div className="flex h-full min-h-80 items-center justify-center rounded-3xl border border-white/8 bg-[#070707]/70 px-6 py-10">
            <EmptyState
              icon="👥"
              title="Nenhum funcionário encontrado"
              description="Cadastre o primeiro funcionário da equipe."
              action={
                <Button size="sm" onClick={onCreate}>
                  Cadastrar agora
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-3">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="group rounded-3xl border border-white/8 bg-[#070707]/78 p-4 transition-all hover:border-orange-500/15 hover:bg-[#0A0A0A]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <Avatar
                      employee={employee}
                      size="md"
                      editable
                      onPhotoError={onPhotoError}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-white">
                          {employee.fullName}
                        </p>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            employee.isActive
                              ? "bg-orange-500/14 text-orange-300"
                              : "bg-white/6 text-slate-400"
                          }`}
                        >
                          {employee.isActive ? "● Ativo" : "○ Inativo"}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {employee.position} · CPF: {employee.cpf}
                      </p>

                      {employee.weeklyRules.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {WEEKDAYS.map((day, weekday) => {
                            const works = employee.weeklyRules.some(
                              (rule) =>
                                rule.weekday === weekday && rule.shouldWork,
                            );

                            return (
                              <span
                                key={day}
                                className={`rounded-lg px-2 py-1 text-[11px] font-semibold ${
                                  works
                                    ? "border border-orange-500/20 bg-orange-500/12 text-orange-300"
                                    : "bg-[#121212] text-slate-600"
                                }`}
                              >
                                {day}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1 self-end lg:self-center">
                    <button
                      type="button"
                      onClick={() => onMarkAbsence(employee)}
                      title="Marcar falta"
                      aria-label={`Marcar falta de ${employee.fullName}`}
                      className="rounded-xl p-2.5 text-slate-500 transition-all hover:bg-red-500/10 hover:text-red-400"
                    >
                      <AlertTriangle size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit(employee)}
                      title="Editar"
                      aria-label={`Editar ${employee.fullName}`}
                      className="rounded-xl p-2.5 text-slate-500 transition-all hover:bg-white/6 hover:text-slate-200"
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggle(employee)}
                      title={employee.isActive ? "Desativar" : "Ativar"}
                      role="switch"
                      aria-checked={employee.isActive}
                      aria-label={`${employee.isActive ? "Desativar" : "Ativar"} ${employee.fullName}`}
                      className={`rounded-xl p-2.5 transition-all ${
                        employee.isActive
                          ? "text-orange-300 hover:bg-orange-500/10"
                          : "text-slate-500 hover:bg-white/6 hover:text-slate-300"
                      }`}
                    >
                      {employee.isActive ? (
                        <ToggleRight size={18} />
                      ) : (
                        <ToggleLeft size={18} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(employee)}
                      title="Excluir funcionário"
                      aria-label={`Excluir ${employee.fullName}`}
                      className="rounded-xl p-2.5 text-slate-600 transition-all hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
