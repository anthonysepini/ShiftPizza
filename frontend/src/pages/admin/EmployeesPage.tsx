import { useState, useEffect, useRef, type FormEvent } from 'react';
import { UserPlus, Search, ToggleLeft, ToggleRight, Edit2, AlertTriangle } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
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

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// ── Photo helpers (localStorage) ──────────────────────────────
const getPhoto = (id: string) => localStorage.getItem(`sp_photo_${id}`);
const savePhoto = (id: string, base64: string) =>
  localStorage.setItem(`sp_photo_${id}`, base64);

// ── Avatar component ──────────────────────────────────────────
function Avatar({
  employee,
  size = 'md',
  editable = false,
  onPhotoChange,
}: {
  employee: Employee;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  onPhotoChange?: (base64: string) => void;
}) {
  const [photo, setPhoto] = useState<string | null>(() => getPhoto(employee.id));
  const inputRef = useRef<HTMLInputElement>(null);

  const dim = { sm: 'w-9 h-9 text-sm', md: 'w-11 h-11 text-base', lg: 'w-20 h-20 text-3xl' }[size];

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      savePhoto(employee.id, base64);
      setPhoto(base64);
      onPhotoChange?.(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`relative shrink-0 ${dim}`}>
      {photo ? (
        <img
          src={photo}
          alt={employee.fullName}
          className={`${dim} rounded-full object-cover border-2 border-orange-500/30`}
        />
      ) : (
        <div
          className={`${dim} rounded-full bg-orange-500/20 border-2 border-orange-500/30 flex items-center justify-center font-bold text-orange-400`}
        >
          {employee.fullName.charAt(0).toUpperCase()}
        </div>
      )}
      {editable && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-[9px] text-white font-semibold"
          >
            foto
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </>
      )}
    </div>
  );
}

// ── Mark absence modal ────────────────────────────────────────
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
      const target = scheduleDays.find((d) => {
        const dd = new Date(d.date).toISOString().split('T')[0];
        return dd === date;
      });

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
          <div className="flex items-center gap-3 bg-[#0D1426] border border-[#1E293B] rounded-xl p-3">
            <Avatar employee={employee} size="sm" />
            <div>
              <p className="text-sm font-semibold text-slate-200">{employee.fullName}</p>
              <p className="text-xs text-slate-500">{employee.position}</p>
            </div>
          </div>
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
          <p className="text-xs text-slate-500 bg-[#0D1426] border border-[#1E293B] rounded-lg px-3 py-2">
            ⚠️ A escala do mês selecionado precisa ter sido gerada pelo admin.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button variant="danger" onClick={() => void handleSave()} loading={saving}>
              Registrar falta
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function EmployeesPage() {
  const { toasts, toast, remove } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalCreate, setModalCreate] = useState(false);
  const [modalEdit, setModalEdit] = useState<Employee | null>(null);
  const [modalAbsence, setModalAbsence] = useState<Employee | null>(null);

  const [form, setForm] = useState<CreateEmployeeDto>({
    fullName: '',
    cpf: '',
    phone: '',
    position: '',
    password: '',
    workDays: [],
  });
  const [saving, setSaving] = useState(false);

  const load = () =>
    employeesService
      .findAll()
      .then(setEmployees)
      .finally(() => setLoading(false));

  useEffect(() => { void load(); }, []);

  const filtered = employees.filter(
    (e) =>
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.position.toLowerCase().includes(search.toLowerCase()),
  );

  const resetForm = () =>
    setForm({ fullName: '', cpf: '', phone: '', position: '', password: '', workDays: [] });

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (form.workDays.length === 0) {
      toast('Selecione ao menos um dia de trabalho.', 'error');
      return;
    }
    setSaving(true);
    try {
      await employeesService.create({ ...form, cpf: form.cpf.replace(/\D/g, '') });
      toast('Funcionário cadastrado com sucesso!', 'success');
      setModalCreate(false);
      resetForm();
      await load();
    } catch {
      toast('Erro ao cadastrar. CPF pode já estar em uso.', 'error');
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
      workDays: modalEdit.weeklyRules
        .filter((r) => r.shouldWork)
        .map((r) => r.weekday),
    };
    try {
      await employeesService.update(modalEdit.id, dto);
      toast('Dados atualizados!', 'success');
      setModalEdit(null);
      await load();
    } catch {
      toast('Erro ao atualizar.', 'error');
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
    } catch {
      toast('Erro ao alterar status.', 'error');
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
    <div className="animate-in">
      <PageHeader
        title="Funcionários"
        subtitle="Gerencie a equipe e as escalas semanais"
        action={
          <Button leftIcon={<UserPlus size={14} />} size="sm" onClick={() => setModalCreate(true)}>
            Novo funcionário
          </Button>
        }
      />

      {/* Search */}
      <div className="relative mb-5">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          placeholder="Buscar por nome ou cargo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-[#111827] border border-[#1E293B] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 hover:border-[#2D3F55] transition-all"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="👥"
          title="Nenhum funcionário encontrado"
          description="Cadastre o primeiro funcionário da equipe."
          action={<Button size="sm" onClick={() => setModalCreate(true)}>Cadastrar agora</Button>}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((emp) => (
            <div
              key={emp.id}
              className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 flex items-center gap-4 hover:border-[#2D3F55] transition-all"
            >
              {/* Avatar com foto clicável */}
              <Avatar employee={emp} size="md" editable onPhotoChange={() => {}} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-white">{emp.fullName}</p>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      emp.isActive
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-slate-500/15 text-slate-400'
                    }`}
                  >
                    {emp.isActive ? '● Ativo' : '○ Inativo'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {emp.position} · CPF: {emp.cpf}
                </p>
                {emp.weeklyRules.length > 0 && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {WEEKDAYS.map((d, i) => {
                      const works = emp.weeklyRules.some(
                        (r) => r.weekday === i && r.shouldWork,
                      );
                      return (
                        <span
                          key={d}
                          className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                            works
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-[#1E293B] text-slate-600'
                          }`}
                        >
                          {d}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setModalAbsence(emp)}
                  title="Marcar falta"
                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <AlertTriangle size={14} />
                </button>
                <button
                  onClick={() => setModalEdit(emp)}
                  title="Editar"
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-[#1E293B] transition-all"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => void handleToggle(emp)}
                  title={emp.isActive ? 'Desativar' : 'Ativar'}
                  className={`p-2 rounded-lg transition-all ${
                    emp.isActive
                      ? 'text-green-400 hover:bg-green-500/10'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-[#1E293B]'
                  }`}
                >
                  {emp.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={modalCreate}
        onClose={() => { setModalCreate(false); resetForm(); }}
        title="Novo funcionário"
        size="lg"
      >
        <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
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
              onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))}
              placeholder="000.000.000-00"
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

          <div>
            <p className="text-sm font-medium text-slate-300 mb-2">
              Dias de trabalho <span className="text-red-400">*</span>
            </p>
            <div className="flex gap-2 flex-wrap">
              {WEEKDAYS.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    form.workDays.includes(i)
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-[#1E293B] text-slate-500 border border-transparent hover:border-[#2D3F55] hover:text-slate-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setModalCreate(false); resetForm(); }}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Cadastrar funcionário
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      {modalEdit && (
        <Modal
          open={!!modalEdit}
          onClose={() => setModalEdit(null)}
          title={`Editar — ${modalEdit.fullName}`}
          size="lg"
        >
          <form onSubmit={(e) => void handleUpdate(e)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Input
                  label="Nome completo"
                  value={modalEdit.fullName}
                  onChange={(e) => setModalEdit((emp) => emp ? { ...emp, fullName: e.target.value } : null)}
                />
              </div>
              <Input
                label="Cargo"
                value={modalEdit.position}
                onChange={(e) => setModalEdit((emp) => emp ? { ...emp, position: e.target.value } : null)}
              />
              <Input
                label="Telefone"
                value={modalEdit.phone ?? ''}
                onChange={(e) => setModalEdit((emp) => emp ? { ...emp, phone: e.target.value } : null)}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-300 mb-2">Dias de trabalho</p>
              <div className="flex gap-2 flex-wrap">
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
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-[#1E293B] text-slate-500 border border-transparent hover:border-[#2D3F55]'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setModalEdit(null)}>
                Cancelar
              </Button>
              <Button type="submit" loading={saving}>Salvar alterações</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Mark Absence Modal */}
      <MarkAbsenceModal
        employee={modalAbsence}
        open={!!modalAbsence}
        onClose={() => setModalAbsence(null)}
        onSuccess={() => void load()}
      />

      <ToastContainer toasts={toasts} remove={remove} />
    </div>
  );
}
