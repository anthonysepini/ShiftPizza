import { useState, useEffect, type FormEvent } from 'react';
import { UserPlus, Search, ToggleLeft, ToggleRight, Edit2 } from 'lucide-react';
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
import type { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '../../types';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function EmployeesPage() {
  const { toasts, toast, remove } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalCreate, setModalCreate] = useState(false);
  const [modalEdit, setModalEdit] = useState<Employee | null>(null);

  // Create form state
  const [form, setForm] = useState<CreateEmployeeDto>({ fullName: '', cpf: '', phone: '', position: '', password: '', workDays: [] });
  const [saving, setSaving] = useState(false);

  const load = () =>
    employeesService.findAll()
      .then(setEmployees)
      .finally(() => setLoading(false));

  useEffect(() => { void load(); }, []);

  const filtered = employees.filter((e) =>
    e.fullName.toLowerCase().includes(search.toLowerCase()) ||
    e.position.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await employeesService.create({ ...form, cpf: form.cpf.replace(/\D/g, '') });
      toast('Funcionário cadastrado com sucesso!', 'success');
      setModalCreate(false);
      setForm({ fullName: '', cpf: '', phone: '', position: '', password: '', workDays: [] });
      await load();
    } catch {
      toast('Erro ao cadastrar funcionário.', 'error');
    } finally { setSaving(false); }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!modalEdit) return;
    setSaving(true);
    const dto: UpdateEmployeeDto = {
      fullName: (e.currentTarget as HTMLFormElement).fullName.value as string,
      phone: (e.currentTarget as HTMLFormElement).phone?.value as string,
      position: (e.currentTarget as HTMLFormElement).position.value as string,
      workDays: modalEdit.weeklyRules.filter((r) => r.shouldWork).map((r) => r.weekday),
    };
    try {
      await employeesService.update(modalEdit.id, dto);
      toast('Dados atualizados!', 'success');
      setModalEdit(null);
      await load();
    } catch {
      toast('Erro ao atualizar.', 'error');
    } finally { setSaving(false); }
  };

  const handleToggle = async (emp: Employee) => {
    try {
      await employeesService.toggleActive(emp.id, !emp.isActive);
      toast(`${emp.fullName} ${emp.isActive ? 'desativado' : 'ativado'}.`, 'info');
      await load();
    } catch { toast('Erro ao alterar status.', 'error'); }
  };

  const toggleDay = (day: number) => {
    setForm((f) => ({
      ...f,
      workDays: f.workDays.includes(day) ? f.workDays.filter((d) => d !== day) : [...f.workDays, day],
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
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          placeholder="Buscar por nome ou cargo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm bg-[#111827] border border-[#1E293B] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="👥" title="Nenhum funcionário encontrado" description="Cadastre o primeiro funcionário da equipe." action={<Button size="sm" onClick={() => setModalCreate(true)}>Cadastrar agora</Button>} />
      ) : (
        <div className="space-y-2">
          {filtered.map((emp) => (
            <Card key={emp.id} className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-sm font-bold text-orange-400 shrink-0">
                {emp.fullName.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white truncate">{emp.fullName}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${emp.isActive ? 'bg-green-500/15 text-green-400' : 'bg-slate-500/15 text-slate-400'}`}>
                    {emp.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{emp.position} · CPF: {emp.cpf}</p>
                {emp.weeklyRules.length > 0 && (
                  <div className="flex gap-1 mt-1.5">
                    {WEEKDAYS.map((d, i) => {
                      const works = emp.weeklyRules.some((r) => r.weekday === i && r.shouldWork);
                      return (
                        <span key={d} className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${works ? 'bg-orange-500/20 text-orange-400' : 'bg-[#1E293B] text-slate-600'}`}>
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
                  onClick={() => setModalEdit(emp)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-[#1E293B] transition-all"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleToggle(emp)}
                  className={`p-2 rounded-lg transition-all ${emp.isActive ? 'text-green-400 hover:bg-green-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-[#1E293B]'}`}
                >
                  {emp.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={modalCreate} onClose={() => setModalCreate(false)} title="Novo funcionário" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nome completo" required value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} placeholder="João Silva" className="col-span-2" />
            <Input label="CPF" required value={form.cpf} onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))} placeholder="000.000.000-00" />
            <Input label="Cargo" required value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} placeholder="Atendente" />
            <Input label="Telefone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="(35) 9 9999-0000" />
            <Input label="Senha inicial" required type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Mín. 6 caracteres" />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-300 mb-2">Dias de trabalho</p>
            <div className="flex gap-1.5 flex-wrap">
              {WEEKDAYS.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${form.workDays.includes(i) ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-[#1E293B] text-slate-500 border border-transparent hover:border-[#2D3F55]'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalCreate(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Cadastrar</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      {modalEdit && (
        <Modal open={!!modalEdit} onClose={() => setModalEdit(null)} title={`Editar — ${modalEdit.fullName}`} size="lg">
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input name="fullName" label="Nome completo" defaultValue={modalEdit.fullName} className="col-span-2" />
              <Input name="position" label="Cargo" defaultValue={modalEdit.position} />
              <Input name="phone" label="Telefone" defaultValue={modalEdit.phone} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300 mb-2">Dias de trabalho</p>
              <div className="flex gap-1.5 flex-wrap">
                {WEEKDAYS.map((d, i) => {
                  const active = modalEdit.weeklyRules.some((r) => r.weekday === i && r.shouldWork);
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
                                  : [...emp.weeklyRules, { id: '', employeeId: emp.id, weekday: i, shouldWork: true }],
                              }
                            : null
                        )
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${active ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-[#1E293B] text-slate-500 border border-transparent hover:border-[#2D3F55]'}`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setModalEdit(null)}>Cancelar</Button>
              <Button type="submit" loading={saving}>Salvar</Button>
            </div>
          </form>
        </Modal>
      )}

      <ToastContainer toasts={toasts} remove={remove} />
    </div>
  );
}
