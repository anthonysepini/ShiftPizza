import { useState, useEffect, useRef, type FormEvent } from 'react';
import {
  UserPlus,
  Search,
  ToggleLeft,
  ToggleRight,
  Edit2,
  AlertTriangle,
  Trash2,
  Users,
  UserCheck,
  Camera,
  CalendarDays,
  ArrowRight,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ToastContainer from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { employeesService } from '../../services/employees.service';
import { schedulesService } from '../../services/schedules.service';
import type { Employee, CreateEmployeeDto, UpdateEmployeeDto, ScheduleStatus } from '../../types';

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const NOW = new Date();
const CURRENT_YEAR = NOW.getFullYear();
const CURRENT_MONTH = NOW.getMonth() + 1;

const getPhoto = (id: string) => localStorage.getItem(`sp_photo_${id}`);
const savePhoto = (id: string, base64: string) => localStorage.setItem(`sp_photo_${id}`, base64);
const onlyDigits = (value: string) => value.replace(/\D/g, '');

function getApiErrorMessage(error: unknown, fallback = 'Erro ao cadastrar funcionário.'): string {
  if (typeof error === 'object' && error !== null) {
    const maybeError = error as {
      response?: {
        data?: {
          message?: unknown;
        };
      };
      message?: unknown;
    };

    const apiMessage = maybeError.response?.data?.message;

    if (Array.isArray(apiMessage) && apiMessage.length > 0) {
      const firstMessage = apiMessage[0];
      if (typeof firstMessage === 'string' && firstMessage.trim()) {
        return firstMessage;
      }
    }

    if (typeof apiMessage === 'string' && apiMessage.trim()) {
      return apiMessage;
    }

    if (typeof maybeError.message === 'string' && maybeError.message.trim()) {
      return maybeError.message;
    }
  }

  return fallback;
}

// ── Avatar ────────────────────────────────────────────────────
function Avatar({
  employee,
  size = 'md',
  editable = false,
}: {
  employee: Employee;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
}) {
  const [photo, setPhoto] = useState<string | null>(() => getPhoto(employee.id));
  const inputRef = useRef<HTMLInputElement>(null);

  const dim = {
    sm: 'h-10 w-10 text-sm',
    md: 'h-12 w-12 text-base',
    lg: 'h-20 w-20 text-3xl',
  }[size];

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      savePhoto(employee.id, base64);
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

// ── Marcar falta ──────────────────────────────────────────────
function MarkAbsenceModal({
  employee,
  open,
  onClose,
  onSuccess,
}: {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!employee) return;

    setSaving(true);
    try {
      const [y, m] = date.split('-').map(Number);
      const scheduleDays = await schedulesService.getMonthSchedule(y, m, employee.id);

      const target = scheduleDays.find(
        (d) => new Date(d.date).toISOString().split('T')[0] === date,
      );

      if (!target) {
        toast('Este dia não está na escala. Gere a escala do mês primeiro.', 'error');
        setSaving(false);
        return;
      }

      await schedulesService.updateDay(target.id, {
        status: 'ABSENT' as ScheduleStatus,
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
                <p className="truncate text-sm font-semibold text-slate-200">{employee.fullName}</p>
                <p className="mt-1 text-xs text-slate-500">{employee.position}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-[#070707]/80 p-4 sm:p-5">
            <div className="space-y-4">
              <Input
                label="Data da falta"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Input
                label="Observação (opcional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
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
            <Button variant="danger" onClick={() => void handleSave()} loading={saving}>
              Registrar falta
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ── Confirmar exclusão ────────────────────────────────────────
function DeleteConfirmModal({
  employee,
  open,
  onClose,
  onSuccess,
}: {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
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
              <p className="truncate text-sm font-semibold text-slate-200">{employee.fullName}</p>
              <p className="mt-1 text-xs text-slate-500">{employee.position}</p>
            </div>
          </div>

          <div className="space-y-2 rounded-[22px] border border-white/10 bg-[#070707]/80 p-4">
            <p className="text-sm font-medium text-slate-300">Esta ação é irreversível.</p>
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
            <Button variant="danger" onClick={() => void handleDelete()} loading={deleting}>
              Sim, excluir permanentemente
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ── Página principal ──────────────────────────────────────────
export default function EmployeesPage() {
  const { toasts, toast, remove } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalCreate, setModalCreate] = useState(false);
  const [modalEdit, setModalEdit] = useState<Employee | null>(null);
  const [modalAbsence, setModalAbsence] = useState<Employee | null>(null);
  const [modalDelete, setModalDelete] = useState<Employee | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreateEmployeeDto>({
    fullName: '',
    cpf: '',
    phone: '',
    position: '',
    password: '',
    workDays: [],
  });

  const load = async () => {
    try {
      const data = await employeesService.findAll();
      setEmployees(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = employees.filter(
    (e) =>
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.position.toLowerCase().includes(search.toLowerCase()),
  );

  const activeCount = employees.filter((e) => e.isActive).length;
  const inactiveCount = employees.length - activeCount;
  const photoCount = employees.filter((e) => Boolean(getPhoto(e.id))).length;

  const weekdayLoad = WEEKDAYS.map((label, weekday) => ({
    label,
    count: employees.filter((e) =>
      e.weeklyRules.some((rule) => rule.weekday === weekday && rule.shouldWork),
    ).length,
  }));

  const strongestDay = weekdayLoad.reduce(
    (best, current) => (current.count > best.count ? current : best),
    { label: WEEKDAYS[0], count: 0 },
  );

  const resetForm = () =>
    setForm({
      fullName: '',
      cpf: '',
      phone: '',
      position: '',
      password: '',
      workDays: [],
    });

  const autoGenerateSchedule = async () => {
    try {
      await schedulesService.generateMonth({
        year: CURRENT_YEAR,
        month: CURRENT_MONTH,
      });
    } catch {
      // silencioso por intenção
    }
  };

  const handleCpfChange = (value: string) => {
    const cpfDigits = onlyDigits(value).slice(0, 11);

    setForm((prev) => ({
      ...prev,
      cpf: cpfDigits,
    }));
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();

    const cpfDigits = onlyDigits(form.cpf);

    if (form.password.length < 6) {
      toast('A senha deve conter no mínimo 6 caracteres.', 'error');
      return;
    }

    if (cpfDigits.length !== 11) {
      toast('O CPF deve conter exatamente 11 dígitos.', 'error');
      return;
    }

    if (form.workDays.length === 0) {
      toast('Selecione ao menos um dia de trabalho.', 'error');
      return;
    }

    setSaving(true);
    try {
      await employeesService.create({
        ...form,
        cpf: cpfDigits,
      });

      toast('Funcionário cadastrado! Atualizando escala...', 'success');
      setModalCreate(false);
      resetForm();
      await load();
      await autoGenerateSchedule();
      toast('Escala do mês atualizada com o novo funcionário.', 'info');
    } catch (error) {
      toast(getApiErrorMessage(error), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!modalEdit) return;

    setSaving(true);
    const dto: UpdateEmployeeDto = {
      fullName: modalEdit.fullName,
      phone: modalEdit.phone,
      position: modalEdit.position,
      workDays: modalEdit.weeklyRules.filter((r) => r.shouldWork).map((r) => r.weekday),
    };

    try {
      await employeesService.update(modalEdit.id, dto);
      toast('Dados atualizados! Atualizando escala...', 'success');
      setModalEdit(null);
      await load();
      await autoGenerateSchedule();
      toast('Escala do mês sincronizada.', 'info');
    } catch (error) {
      toast(getApiErrorMessage(error, 'Erro ao atualizar.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (emp: Employee) => {
    try {
      await employeesService.toggleActive(emp.id, !emp.isActive);
      toast(
        `${emp.fullName} ${emp.isActive ? 'desativado' : 'ativado'}.`,
        emp.isActive ? 'info' : 'success',
      );
      await load();
    } catch (error) {
      toast(getApiErrorMessage(error, 'Erro ao alterar status.'), 'error');
    }
  };

  const toggleDay = (day: number) => {
    setForm((f) => ({
      ...f,
      workDays: f.workDays.includes(day)
        ? f.workDays.filter((d) => d !== day)
        : [...f.workDays, day],
    }));
  };

  return (
    <div className="animate-in mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-385 flex-col space-y-6 2xl:max-w-420]">
      <PageHeader
        title="Funcionários"
        subtitle="Gerencie a equipe e as escalas semanais"
        action={
          <Button leftIcon={<UserPlus size={14} />} size="sm" onClick={() => setModalCreate(true)}>
            Novo funcionário
          </Button>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="relative flex min-h-36 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#050505]/90 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.38)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-orange-300/30 to-transparent" />
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                ㅤEquipe
              </p>
              <h3 className="mt-1.5 text-sm font-medium text-slate-300">ㅤTotal cadastrado</h3>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10">
              <Users size={17} className="text-orange-300" />
            </div>
          </div>

          <div className="relative mt-4">
            <p className="text-[2.15rem] font-black tracking-tight text-white">ㅤ{employees.length}</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              ㅤFuncionários registrados no sistema
            </p>
          </div>
        </div>

        <div className="relative flex min-h-36 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#050505]/90 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.38)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-orange-300/30 to-transparent" />
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-500/8 blur-2xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                ㅤStatus
              </p>
              <h3 className="mt-1.5 text-sm font-medium text-slate-300">ㅤEquipe ativa</h3>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10">
              <UserCheck size={17} className="text-orange-300" />
            </div>
          </div>

          <div className="relative mt-4">
            <p className="text-[2.15rem] font-black tracking-tight text-white">ㅤ{activeCount}</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              {inactiveCount > 0
                ? `${inactiveCount} ㅤinativo${inactiveCount > 1 ? 's' : ''}`
                : 'ㅤNenhum funcionário inativo'}
            </p>
          </div>
        </div>

        <div className="relative flex min-h-36 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#050505]/90 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.38)] sm:col-span-2 xl:col-span-1">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-orange-300/30 to-transparent" />
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/8 blur-2xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                ㅤPerfil
              </p>
              <h3 className="mt-1.5 text-sm font-medium text-slate-300">ㅤFotos cadastradas</h3>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10">
              <Camera size={17} className="text-orange-300" />
            </div>
          </div>

          <div className="relative mt-4">
            <p className="text-[2.15rem] font-black tracking-tight text-white">ㅤ{photoCount}</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              ㅤ{employees.length > 0
                ? `${employees.length - photoCount} sem foto`
                : 'ㅤNenhum cadastro ainda'}
            </p>
          </div>
        </div>
      </section>

      <section className="grid flex-1 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] xl:items-stretch">
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
                    placeholder="Buscar por nome ou cargo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-slate-200 outline-none placeholder:text-slate-600"
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">
                    {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} encontrado
                    {filtered.length !== 1 ? 's' : ''}
                  </p>

                  <button
                    type="button"
                    onClick={() => setModalCreate(true)}
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
            {loading ? (
              <div className="flex h-full min-h-65 items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex h-full min-h-80 items-center justify-center rounded-3xl border border-white/8 bg-[#070707]/70 px-6 py-10">
                <EmptyState
                  icon="👥"
                  title="Nenhum funcionário encontrado"
                  description="Cadastre o primeiro funcionário da equipe."
                  action={
                    <Button size="sm" onClick={() => setModalCreate(true)}>
                      Cadastrar agora
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((emp) => (
                  <div
                    key={emp.id}
                    className="group rounded-3xl border border-white/8 bg-[#070707]/78 p-4 transition-all hover:border-orange-500/15 hover:bg-[#0A0A0A]"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                      <div className="flex min-w-0 flex-1 items-start gap-4">
                        <Avatar employee={emp} size="md" editable />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-white">{emp.fullName}</p>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                emp.isActive
                                  ? 'bg-orange-500/14 text-orange-300'
                                  : 'bg-white/6 text-slate-400'
                              }`}
                            >
                              {emp.isActive ? '● Ativo' : '○ Inativo'}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            {emp.position} · CPF: {emp.cpf}
                          </p>

                          {emp.weeklyRules.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {WEEKDAYS.map((d, i) => {
                                const works = emp.weeklyRules.some(
                                  (r) => r.weekday === i && r.shouldWork,
                                );

                                return (
                                  <span
                                    key={d}
                                    className={`rounded-lg px-2 py-1 text-[10px] font-semibold ${
                                      works
                                        ? 'border border-orange-500/20 bg-orange-500/12 text-orange-300'
                                        : 'bg-[#121212] text-slate-600'
                                    }`}
                                  >
                                    {d}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1 self-end lg:self-center">
                        <button
                          onClick={() => setModalAbsence(emp)}
                          title="Marcar falta"
                          className="rounded-xl p-2.5 text-slate-500 transition-all hover:bg-red-500/10 hover:text-red-400"
                        >
                          <AlertTriangle size={15} />
                        </button>

                        <button
                          onClick={() => setModalEdit(emp)}
                          title="Editar"
                          className="rounded-xl p-2.5 text-slate-500 transition-all hover:bg-white/6 hover:text-slate-200"
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          onClick={() => void handleToggle(emp)}
                          title={emp.isActive ? 'Desativar' : 'Ativar'}
                          className={`rounded-xl p-2.5 transition-all ${
                            emp.isActive
                              ? 'text-orange-300 hover:bg-orange-500/10'
                              : 'text-slate-500 hover:bg-white/6 hover:text-slate-300'
                          }`}
                        >
                          {emp.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>

                        <button
                          onClick={() => setModalDelete(emp)}
                          title="Excluir funcionário"
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
                  <h3 className="text-base font-semibold tracking-tight text-white">
                    Resumo da equipe
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Estado atual dos cadastros e da operação
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/8 bg-[#070707]/78 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Total
                  </p>
                  <p className="mt-2 text-2xl font-black tracking-tight text-white">{employees.length}</p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-[#070707]/78 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Ativos
                  </p>
                  <p className="mt-2 text-2xl font-black tracking-tight text-white">{activeCount}</p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-[#070707]/78 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Inativos
                  </p>
                  <p className="mt-2 text-2xl font-black tracking-tight text-white">{inactiveCount}</p>
                </div>
              </div>

              <div className="mt-5 rounded-[22px] border border-orange-500/15 bg-orange-500/8 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
                  ㅤDestaque semanal
                </p>
                <p className="mt-2 text-sm text-slate-200">
                  ㅤ{strongestDay.count > 0
                    ? `${strongestDay.label} é o dia com mais funcionários trabalhando.`
                    : 'Ainda não há dias de trabalho configurados na equipe.'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  ㅤㅤ{strongestDay.count > 0
                    ? `${strongestDay.count} funcionário${strongestDay.count > 1 ? 's' : ''} escalado${strongestDay.count > 1 ? 's' : ''}`
                    : 'Configure as regras semanais para visualizar a distribuição.'}
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
                  <h3 className="text-base font-semibold tracking-tight text-white">
                    Cobertura semanal
                  </h3>
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
                      <span className="text-sm font-medium text-slate-200">{day.label}</span>
                      <span className="text-xs text-slate-500">
                        {day.count} funcionário{day.count !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="h-1.5 w-full rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-orange-500 to-amber-400"
                        style={{
                          width: `${Math.min(
                            Math.max(
                              employees.length > 0 ? (day.count / employees.length) * 100 : 0,
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
      </section>

      <Modal
        open={modalCreate}
        onClose={() => {
          setModalCreate(false);
          resetForm();
        }}
        title="Novo funcionário"
        size="lg"
      >
        <form onSubmit={(e) => void handleCreate(e)} className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-[#070707]/80 p-4 sm:p-5">
            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-200">Dados principais</p>
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
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  placeholder="João Silva"
                />
              </div>

              <Input
                label="CPF"
                required
                value={form.cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                placeholder="12345678900"
              />

              <Input
                label="Cargo"
                required
                value={form.position}
                onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                placeholder="Atendente"
              />

              <Input
                label="Telefone (opcional)"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="(35) 9 9999-0000"
              />

              <Input
                label="Senha inicial"
                required
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
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
              {WEEKDAYS.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    form.workDays.includes(i)
                      ? 'border border-orange-500/30 bg-orange-500/16 text-orange-300'
                      : 'border border-transparent bg-[#121212] text-slate-500 hover:border-white/10 hover:text-slate-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setModalCreate(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>

            <Button type="submit" loading={saving}>
              Cadastrar funcionário
            </Button>
          </div>
        </form>
      </Modal>

      {modalEdit && (
        <Modal
          open={!!modalEdit}
          onClose={() => setModalEdit(null)}
          title={`Editar — ${modalEdit.fullName}`}
          size="lg"
        >
          <form onSubmit={(e) => void handleUpdate(e)} className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-[#070707]/80 p-4 sm:p-5">
              <div className="mb-4">
                <p className="text-sm font-semibold text-slate-200">Dados do funcionário</p>
                <p className="mt-1 text-xs text-slate-500">
                  Atualize as informações principais do cadastro.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="col-span-1 sm:col-span-2">
                  <Input
                    label="Nome completo"
                    value={modalEdit.fullName}
                    onChange={(e) =>
                      setModalEdit((emp) => (emp ? { ...emp, fullName: e.target.value } : null))
                    }
                  />
                </div>

                <Input
                  label="Cargo"
                  value={modalEdit.position}
                  onChange={(e) =>
                    setModalEdit((emp) => (emp ? { ...emp, position: e.target.value } : null))
                  }
                />

                <Input
                  label="Telefone"
                  value={modalEdit.phone ?? ''}
                  onChange={(e) =>
                    setModalEdit((emp) => (emp ? { ...emp, phone: e.target.value } : null))
                  }
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#070707]/80 p-4 sm:p-5">
              <div className="mb-4">
                <p className="text-sm font-semibold text-slate-200">Dias de trabalho</p>
                <p className="mt-1 text-xs text-slate-500">
                  Ajuste a regra semanal utilizada na escala.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((d, i) => {
                  const active = modalEdit.weeklyRules.some(
                    (r) => r.weekday === i && r.shouldWork,
                  );

                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() =>
                        setModalEdit((emp) =>
                          emp
                            ? {
                                ...emp,
                                weeklyRules: active
                                  ? emp.weeklyRules.filter((r) => r.weekday !== i)
                                  : [
                                      ...emp.weeklyRules,
                                      { id: '', employeeId: emp.id, weekday: i, shouldWork: true },
                                    ],
                              }
                            : null,
                        )
                      }
                      className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                        active
                          ? 'border border-orange-500/30 bg-orange-500/16 text-orange-300'
                          : 'border border-transparent bg-[#121212] text-slate-500 hover:border-white/10 hover:text-slate-300'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="secondary" onClick={() => setModalEdit(null)}>
                Cancelar
              </Button>

              <Button type="submit" loading={saving}>
                Salvar alterações
              </Button>
            </div>
          </form>
        </Modal>
      )}

      <MarkAbsenceModal
        employee={modalAbsence}
        open={!!modalAbsence}
        onClose={() => setModalAbsence(null)}
        onSuccess={() => void load()}
      />

      <DeleteConfirmModal
        employee={modalDelete}
        open={!!modalDelete}
        onClose={() => setModalDelete(null)}
        onSuccess={() => void load()}
      />

      <ToastContainer toasts={toasts} remove={remove} />
    </div>
  );
}
