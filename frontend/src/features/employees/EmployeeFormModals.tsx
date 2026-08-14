import type {
  Dispatch,
  FormEvent,
  SetStateAction,
} from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import type { CreateEmployeeDto, Employee } from "../../types";
import { WEEKDAYS } from "./employee-data";

interface Props {
  createOpen: boolean;
  editEmployee: Employee | null;
  form: CreateEmployeeDto;
  saving: boolean;
  setForm: Dispatch<SetStateAction<CreateEmployeeDto>>;
  setEditEmployee: Dispatch<SetStateAction<Employee | null>>;
  onCloseCreate: () => void;
  onCpfChange: (value: string) => void;
  onToggleCreateWorkday: (day: number) => void;
  onToggleEditWorkday: (day: number) => void;
  onCreate: (event: FormEvent) => Promise<void>;
  onUpdate: (event: FormEvent) => Promise<void>;
}

export default function EmployeeFormModals({
  createOpen,
  editEmployee,
  form,
  saving,
  setForm,
  setEditEmployee,
  onCloseCreate,
  onCpfChange,
  onToggleCreateWorkday,
  onToggleEditWorkday,
  onCreate,
  onUpdate,
}: Props) {
  return (
    <>
      <Modal
        open={createOpen}
        onClose={onCloseCreate}
        title="Novo funcionário"
        size="lg"
      >
        <form onSubmit={(event) => void onCreate(event)} className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-[#070707]/80 p-4 sm:p-5">
            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-200">
                Dados principais
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Preencha as informações iniciais do funcionário.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="col-span-1 sm:col-span-2">
                <Input
                  label="Nome completo"
                  required
                  value={form.fullName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      fullName: event.target.value,
                    }))
                  }
                  placeholder="João Silva"
                />
              </div>

              <Input
                label="CPF"
                required
                value={form.cpf}
                onChange={(event) => onCpfChange(event.target.value)}
                placeholder="12345678900"
              />

              <Input
                label="Cargo"
                required
                value={form.position}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    position: event.target.value,
                  }))
                }
                placeholder="Atendente"
              />

              <Input
                label="Telefone (opcional)"
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                placeholder="(35) 9 9999-0000"
              />

              <Input
                label="Senha inicial"
                required
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                placeholder="Mín. 6 caracteres"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#070707]/80 p-4 sm:p-5">
            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-200">
                Dias de trabalho <span className="text-red-400">*</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Selecione os dias em que o funcionário deve aparecer na escala.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day, weekday) => (
                <button
                  key={day}
                  type="button"
                  aria-pressed={form.workDays.includes(weekday)}
                  onClick={() => onToggleCreateWorkday(weekday)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    form.workDays.includes(weekday)
                      ? "border border-orange-500/30 bg-orange-500/16 text-orange-300"
                      : "border border-transparent bg-[#121212] text-slate-500 hover:border-white/10 hover:text-slate-300"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={onCloseCreate}>
              Cancelar
            </Button>

            <Button type="submit" loading={saving}>
              Cadastrar funcionário
            </Button>
          </div>
        </form>
      </Modal>

      {editEmployee && (
        <Modal
          open
          onClose={() => setEditEmployee(null)}
          title={`Editar — ${editEmployee.fullName}`}
          size="lg"
        >
          <form onSubmit={(event) => void onUpdate(event)} className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-[#070707]/80 p-4 sm:p-5">
              <div className="mb-4">
                <p className="text-sm font-semibold text-slate-200">
                  Dados do funcionário
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Atualize as informações principais do cadastro.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="col-span-1 sm:col-span-2">
                  <Input
                    label="Nome completo"
                    value={editEmployee.fullName}
                    onChange={(event) =>
                      setEditEmployee((employee) =>
                        employee
                          ? { ...employee, fullName: event.target.value }
                          : null,
                      )
                    }
                  />
                </div>

                <Input
                  label="Cargo"
                  value={editEmployee.position}
                  onChange={(event) =>
                    setEditEmployee((employee) =>
                      employee
                        ? { ...employee, position: event.target.value }
                        : null,
                      )
                  }
                />

                <Input
                  label="Telefone"
                  value={editEmployee.phone ?? ""}
                  onChange={(event) =>
                    setEditEmployee((employee) =>
                      employee
                        ? { ...employee, phone: event.target.value }
                        : null,
                    )
                  }
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#070707]/80 p-4 sm:p-5">
              <div className="mb-4">
                <p className="text-sm font-semibold text-slate-200">
                  Dias de trabalho
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Ajuste a regra semanal utilizada na escala.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day, weekday) => {
                  const active = editEmployee.weeklyRules.some(
                    (rule) => rule.weekday === weekday && rule.shouldWork,
                  );

                  return (
                    <button
                      key={day}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onToggleEditWorkday(weekday)}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                        active
                          ? "border border-orange-500/30 bg-orange-500/16 text-orange-300"
                          : "border border-transparent bg-[#121212] text-slate-500 hover:border-white/10 hover:text-slate-300"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditEmployee(null)}
              >
                Cancelar
              </Button>

              <Button type="submit" loading={saving}>
                Salvar alterações
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
