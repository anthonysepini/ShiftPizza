import { useRef, useState, type ChangeEvent } from 'react';
import { Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import type { ToastItem } from '../../components/ui/Toast';
import { employeesService } from '../../services/employees.service';
import { schedulesService } from '../../services/schedules.service';
import type { Employee } from '../../types';
import { getCivilDateKey, getLocalDateInputValue } from '../../utils/civil-date';
import { getEmployeePhoto } from './employee-data';
import { validateEmployeePhoto } from './photo';

const saveEmployeePhoto = (id: string, base64: string) =>
  localStorage.setItem(`sp_photo_${id}`, base64);

type Toast = (message: string, type?: ToastItem['type']) => void;

export function Avatar({
  employee,
  size = 'md',
  editable = false,
  onPhotoError,
}: {
  employee: Employee;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  onPhotoError?: (message: string) => void;
}) {
  const [photo, setPhoto] = useState<string | null>(() =>
    getEmployeePhoto(employee.id),
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const dim = {
    sm: 'h-10 w-10 text-sm',
    md: 'h-12 w-12 text-base',
    lg: 'h-20 w-20 text-3xl',
  }[size];

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateEmployeePhoto(file);
    if (validationError) {
      event.target.value = '';
      onPhotoError?.(validationError);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      saveEmployeePhoto(employee.id, base64);
      setPhoto(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`relative shrink-0 ${dim}`}>
      {photo ? (
        <img
          src={photo}
          alt={employee.fullName}
          className={`${dim} rounded-full border-2 border-orange-500/25 object-cover shadow-[0_10px_25px_rgba(0,0,0,0.18)]`}
        />
      ) : (
        <div
          className={`${dim} flex items-center justify-center rounded-full border-2 border-orange-500/25 bg-orange-500/12 font-bold text-orange-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]`}
        >
          {employee.fullName.charAt(0).toUpperCase()}
        </div>
      )}

      {editable && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 text-[10px] font-bold uppercase tracking-[0.14em] text-white opacity-0 transition-opacity hover:opacity-100"
          >
            foto
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </>
      )}
    </div>
  );
}

export function MarkAbsenceModal({
  employee,
  open,
  onClose,
  onSuccess,
  toast,
}: {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  toast: Toast;
}) {
  const [date, setDate] = useState(() => getLocalDateInputValue());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!employee) return;

    setSaving(true);
    try {
      const [year, month] = date.split('-').map(Number);
      const scheduleDays = await schedulesService.getMonthSchedule(
        year,
        month,
        employee.id,
      );

      const target = scheduleDays.find(
        (day) => getCivilDateKey(day.date) === date,
      );

      if (!target) {
        toast(
          'Este dia não está na escala. Gere a escala do mês primeiro.',
          'error',
        );
        setSaving(false);
        return;
      }

      await schedulesService.updateDay(target.id, {
        status: 'ABSENT',
        note: note || undefined,
      });

      toast(`Falta registrada para ${employee.fullName}`, 'success');
      onSuccess();
      onClose();
    } catch {
      toast('Erro ao registrar falta.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Marcar falta" size="sm">
      {employee && (
        <div className="space-y-4">
          <div className="rounded-[22px] border border-white/10 bg-[#070707]/80 p-4">
            <div className="flex items-center gap-3">
              <Avatar employee={employee} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-200">
                  {employee.fullName}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {employee.position}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-[#070707]/80 p-4 sm:p-5">
            <div className="space-y-4">
              <Input
                label="Data da falta"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
              <Input
                label="Observação (opcional)"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Ex: atestado médico"
              />
            </div>
          </div>

          <p className="rounded-xl border border-orange-500/15 bg-orange-500/8 px-3 py-2.5 text-xs text-slate-400">
            ⚠️ A escala do mês selecionado precisa ter sido gerada.
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => void handleSave()}
              loading={saving}
            >
              Registrar falta
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export function DeleteConfirmModal({
  employee,
  open,
  onClose,
  onSuccess,
  toast,
}: {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  toast: Toast;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!employee) return;

    setDeleting(true);
    try {
      await employeesService.remove(employee.id);
      localStorage.removeItem(`sp_photo_${employee.id}`);
      toast(`${employee.fullName} foi removido do sistema.`, 'info');
      onSuccess();
      onClose();
    } catch {
      toast('Erro ao remover funcionário.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Confirmar exclusão" size="sm">
      {employee && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-[22px] border border-red-500/20 bg-red-500/6 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/15">
              <Trash2 size={16} className="text-red-400" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-200">
                {employee.fullName}
              </p>
              <p className="mt-1 text-xs text-slate-500">{employee.position}</p>
            </div>
          </div>

          <div className="space-y-2 rounded-[22px] border border-white/10 bg-[#070707]/80 p-4">
            <p className="text-sm font-medium text-slate-300">
              Esta ação é irreversível.
            </p>
            <p className="text-xs leading-relaxed text-slate-500">
              Ao confirmar, serão removidos permanentemente:
            </p>

            <ul className="ml-1 space-y-1.5 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <span className="text-red-400">✕</span> Credenciais de acesso
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">✕</span> Todos os dias de escala
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">✕</span> Regras de escala semanal
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">✕</span> Histórico de ações
              </li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => void handleDelete()}
              loading={deleting}
            >
              Sim, excluir permanentemente
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
