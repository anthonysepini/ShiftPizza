import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import ToastContainer from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { schedulesService } from '../../services/schedules.service';
import { employeesService } from '../../services/employees.service';
import type { ScheduleDay, ScheduleStatus, Employee } from '../../types';

const WEEKDAYS_SHORT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const STATUS_OPTIONS: { value: ScheduleStatus; label: string }[] = [
  { value: 'SCHEDULED',     label: 'Agendado' },
  { value: 'ABSENT',        label: 'Falta' },
  { value: 'EXTRA_SHIFT',   label: 'Turno Extra' },
  { value: 'DAY_OFF',       label: 'Folga' },
  { value: 'REMOVED_SHIFT', label: 'Removido' },
];

export default function SchedulePage() {
  const { toasts, toast, remove } = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filterEmp, setFilterEmp] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ScheduleDay | null>(null);
  const [editStatus, setEditStatus] = useState<ScheduleStatus>('SCHEDULED');
  const [editNote, setEditNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, e] = await Promise.all([
        schedulesService.getMonthSchedule(year, month, filterEmp || undefined),
        employeesService.findAll(),
      ]);
      setDays(d);
      setEmployees(e);
    } finally { setLoading(false); }
  }, [year, month, filterEmp]);

  useEffect(() => { void load(); }, [load]);

  const prevMonth = () => { if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1); };

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();

  const monthLabel = new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const dayMap = new Map<string, ScheduleDay[]>();
  days.forEach((d) => {
    const key = new Date(d.date).toISOString().split('T')[0];
    dayMap.set(key, [...(dayMap.get(key) ?? []), d]);
  });

  const openEdit = (day: ScheduleDay) => {
    setSelected(day);
    setEditStatus(day.status);
    setEditNote(day.note ?? '');
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await schedulesService.updateDay(selected.id, { status: editStatus, note: editNote });
      toast('Dia atualizado!', 'success');
      setSelected(null);
      await load();
    } catch { toast('Erro ao atualizar.', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="animate-in">
      <PageHeader
        title="Escala mensal"
        subtitle="Visualize e edite os dias de cada funcionário"
        action={
          <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={12} />} onClick={() => load()}>
            Atualizar
          </Button>
        }
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-1 bg-[#111827] border border-[#1E293B] rounded-lg p-1">
          <button onClick={prevMonth} className="p-1.5 rounded hover:bg-[#1E293B] text-slate-400 hover:text-slate-200 transition-all"><ChevronLeft size={14} /></button>
          <span className="text-sm font-medium text-slate-200 px-3 capitalize">{monthLabel}</span>
          <button onClick={nextMonth} className="p-1.5 rounded hover:bg-[#1E293B] text-slate-400 hover:text-slate-200 transition-all"><ChevronRight size={14} /></button>
        </div>

        <select
          value={filterEmp}
          onChange={(e) => setFilterEmp(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm bg-[#111827] border border-[#1E293B] text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
        >
          <option value="">Todos os funcionários</option>
          {employees.map((e) => <option key={e.id} value={e.id}>{e.fullName}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-[#111827] border border-[#1E293B] rounded-xl overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-[#1E293B]">
            {WEEKDAYS_SHORT.map((d, i) => (
              <div key={i} className="text-center py-2.5 text-xs font-medium text-slate-500">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells */}
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-[#1E293B] bg-[#0A0F1E]/40" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(year, month - 1, day);
              const key = date.toISOString().split('T')[0];
              const cellDays = dayMap.get(key) ?? [];
              const isToday = date.toDateString() === now.toDateString();
              const col = (firstWeekday + i) % 7;
              const isLastCol = col === 6;

              return (
                <div
                  key={day}
                  className={`min-h-[100px] p-2 border-b border-[#1E293B] ${!isLastCol ? 'border-r' : ''} transition-colors`}
                >
                  <div className={`text-xs font-medium mb-1.5 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-orange-500 text-white' : 'text-slate-400'}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {cellDays.slice(0, 3).map((d) => (
                      <button
                        key={d.id}
                        onClick={() => openEdit(d)}
                        className="w-full text-left px-1.5 py-0.5 rounded text-[10px] truncate transition-all hover:opacity-80"
                        style={{
                          background: d.status === 'SCHEDULED' ? 'rgba(34,197,94,0.1)' : d.status === 'ABSENT' ? 'rgba(239,68,68,0.1)' : d.status === 'EXTRA_SHIFT' ? 'rgba(59,130,246,0.1)' : d.status === 'DAY_OFF' ? 'rgba(234,179,8,0.1)' : 'rgba(100,116,139,0.1)',
                          color: d.status === 'SCHEDULED' ? '#4ade80' : d.status === 'ABSENT' ? '#f87171' : d.status === 'EXTRA_SHIFT' ? '#60a5fa' : d.status === 'DAY_OFF' ? '#facc15' : '#94a3b8',
                        }}
                      >
                        {d.employee?.fullName?.split(' ')[0] ?? '—'}
                      </button>
                    ))}
                    {cellDays.length > 3 && (
                      <p className="text-[9px] text-slate-600 px-1">+{cellDays.length - 3} mais</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4">
        {STATUS_OPTIONS.map((s) => (
          <div key={s.value} className="flex items-center gap-1.5">
            <Badge status={s.value} />
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Editar dia" size="sm">
        {selected && (
          <div className="space-y-4">
            <div className="bg-[#0D1426] rounded-lg p-3 text-sm">
              <p className="text-slate-200 font-medium">{selected.employee?.fullName}</p>
              <p className="text-slate-500 text-xs mt-0.5">
                {new Date(selected.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </p>
            </div>
            <Select
              label="Status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as ScheduleStatus)}
              options={STATUS_OPTIONS}
            />
            <Input label="Observação (opcional)" value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="Ex: atestado médico" />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setSelected(null)}>Cancelar</Button>
              <Button onClick={() => void handleSave()} loading={saving}>Salvar</Button>
            </div>
          </div>
        )}
      </Modal>

      <ToastContainer toasts={toasts} remove={remove} />
    </div>
  );
}
