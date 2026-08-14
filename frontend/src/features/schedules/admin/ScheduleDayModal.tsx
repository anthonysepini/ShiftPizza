import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import Select from "../../../components/ui/Select";
import type {
  ScheduleDay,
  ScheduleStatus,
} from "../../../types";
import { formatCivilDate } from "../../../utils/civil-date";
import {
  getScheduleStatusPresentation,
  parseScheduleStatus,
  SCHEDULE_STATUS_VALUES,
} from "../status";

const STATUS_OPTIONS =
  SCHEDULE_STATUS_VALUES.map((status) => {
    const presentation =
      getScheduleStatusPresentation(status);

    return {
      value: status,
      label: `${presentation.icon} ${presentation.label}`,
    };
  });

interface Props {
  selected: ScheduleDay | null;

  status: ScheduleStatus;
  note: string;

  saving: boolean;

  onStatusChange: (
    status: ScheduleStatus,
  ) => void;

  onNoteChange: (note: string) => void;

  onClose: () => void;
  onSave: () => void;
}

export default function ScheduleDayModal({
  selected,
  status,
  note,
  saving,
  onStatusChange,
  onNoteChange,
  onClose,
  onSave,
}: Props) {
  return (
    <Modal
      open={selected !== null}
      onClose={onClose}
      title="Editar dia"
      size="sm"
    >
      {selected && (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0A0A0A] p-4">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/45 to-transparent" />

            <div className="pointer-events-none absolute -right-16 top-0 h-28 w-28 rounded-full bg-orange-500/8 blur-3xl" />

            <div className="relative">
              <p className="text-xs uppercase tracking-[0.18em] text-orange-300">
                Registro selecionado
              </p>

              <p className="mt-2 text-base font-semibold text-white">
                {selected.employee?.fullName ??
                  "Funcionário"}
              </p>

              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                {formatCivilDate(selected.date, {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>

              <div className="mt-3">
                <Badge
                  status={selected.status}
                />
              </div>
            </div>
          </div>

          <Select
            label="Novo status"
            value={status}
            onChange={(event) => {
              const nextStatus =
                parseScheduleStatus(
                  event.target.value,
                );

              if (nextStatus) {
                onStatusChange(nextStatus);
              }
            }}
            options={STATUS_OPTIONS}
          />

          <Input
            label="Observação (opcional)"
            value={note}
            onChange={(event) =>
              onNoteChange(event.target.value)
            }
            placeholder="Ex: atestado médico, troca de turno, hora extra..."
          />

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={onSave}
              loading={saving}
            >
              Salvar alteração
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
