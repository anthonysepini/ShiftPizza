import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, CalendarPlus } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ToastContainer from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { schedulesService } from '../../services/schedules.service';
import { employeesService } from '../../services/employees.service';
import type { ScheduleDay, ScheduleStatus, Employee } from '../../types';

const WEEKDAYS_SHORT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const STATUS_OPTIONS: { value: ScheduleStatus; label: string }[] = [
  { value: 'SCHEDULED',     label: '✅ Agendado' },
  { value: 'ABSENT',        label: '❌ Falta' },
  { value: 'EXTRA_SHIFT',   label: '➕ Turno Extra' },
  { value: 'DAY_OFF',       label: '🌴 Folga' },
  { value: 'REMOVED_SHIFT', label: '🗑️ Removido' },
];

const STATUS_COLOR: Record<ScheduleStatus, { bg: string; text: string }> = {
  SCHEDULED:     { bg: 'rgba(34,197,94,0.12)',  text: '#4ade80' },
  ABSENT:        { bg: 'rgba(239,68,68,0.12)',   text: '#f87171' },
  EXTRA_SHIFT:   { bg: 'rgba(59,130,246,0.12)',  text: '#60a5fa' },
  DAY_OFF:       { bg: 'rgba(234,179,8,0.12)',   text: '#facc15' },
  REMOVED_SHIFT: { bg: 'rgba(100,116,139,0.12)', text: '#94a3b8' },
};

export default function SchedulePage() {
  const { toasts, toast, remove } = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filterEmp, setFilterEmp] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
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
    } finally {
      setLoading(false);
    }
  }, [year, month, filterEmp]);

  useEffect(() => { void load(); }, [load]);

  const prevMonth = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const r = await schedulesService.generateMonth({ year, month });
      toast(`✅ ${r.created} dias criados para ${monthLabel}`, 'success');
      await load();
    } catch {
      toast('Escala já gerada ou erro ao gerar.', 'info');
    } finally {
      setGenerating(false);
    }
  };

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
      toast('Dia atualizado com sucesso!', 'success');
      setSelected(null);
      await load();
    } catch {
      toast('Erro ao atualizar dia.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const monthLabel = new Date(year, month - 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  const dayMap = new Map<string, ScheduleDay[]>();
  days.forEach((d) => {
    const key = new Date(d.date).toISOString().split('T')[0];
    dayMap.set(key, [...(dayMap.get(key) ?? []), d]);
  });

  return (
    <div className="animate-in">
      <PageHeader
        title="Escala mensal"
        subtitle="Visualize e edite os dias de cada funcionário"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw size={12} />}
              onClick={() => void load()}
            >
              Atualizar
            </Button>
            <Button
              size="sm"
              leftIcon={<CalendarPlus size={13} />}
              onClick={() => void handleGenerate()}
              loading={generating}
            >
              Gerar escala
            </Button>
          </div>
        }
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Month nav */}
        <div className="flex items-center gap-1 bg-[#111827] border border-[#1E293B] rounded-xl p-1">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-[#1E293B] text-slate-400 hover:text-slate-200 transition-all"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-sm font-semibold text-slate-200 px-4 capitalize min-w-40 text-center">
            {monthLabel}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-[#1E293B] text-slate-400 hover:text-slate-200 transition-all"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Employee filter */}
        <select
          value={filterEmp}
          onChange={(e) => setFilterEmp(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm bg-[#111827] border border-[#1E293B] text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all hover:border-[#2D3F55]"
        >
          <option value="">Todos os funcionários</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>{e.fullName}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : days.length === 0 ? (
        <EmptyState
          icon="📅"
          title="Escala não gerada para este período"
          description={`Clique em "Gerar escala" para criar automaticamente os dias de ${monthLabel} com base nas regras semanais de cada funcionário.`}
          action={
            <Button
              leftIcon={<CalendarPlus size={14} />}
              onClick={() => void handleGenerate()}
              loading={generating}
            >
              Gerar escala de {monthLabel}
            </Button>
          }
        />
      ) : (
        <>
          {/* Calendar */}
          <div className="bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden mb-6">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-[#1E293B] bg-[#0D1426]">
              {WEEKDAYS_SHORT.map((d, i) => (
                <div key={i} className="text-center py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {Array.from({ length: firstWeekday }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="`min-h-27.5 border-b border-r border-[#1E293B] bg-[#0A0F1E]/50"
                />
              ))}

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
                    className={`min-h-27.5 p-2 border-b border-[#1E293B] ${!isLastCol ? 'border-r' : ''} transition-colors hover:bg-[#0D1426]/50`}
                  >
                    <div
                      className={`text-xs font-semibold mb-2 w-7 h-7 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                          : 'text-slate-400'
                      }`}
                    >
                      {day}
                    </div>
                    <div className="space-y-1">
                      {cellDays.slice(0, 3).map((d) => {
                        const sc = STATUS_COLOR[d.status];
                        return (
                          <button
                            key={d.id}
                            onClick={() => openEdit(d)}
                            className="w-full text-left px-2 py-1 rounded-md text-[10px] font-medium truncate transition-all hover:opacity-80 hover:scale-[1.02]"
                            style={{ background: sc.bg, color: sc.text }}
                          >
                            {d.employee?.fullName?.split(' ')[0] ?? '—'}
                          </button>
                        );
                      })}
                      {cellDays.length > 3 && (
                        <p className="text-[9px] text-slate-600 px-1 font-medium">
                          +{cellDays.length - 3} mais
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {STATUS_OPTIONS.map((s) => (
              <Badge key={s.value} status={s.value} />
            ))}
          </div>
        </>
      )}

      {/* Edit Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Editar dia" size="sm">
        {selected && (
          <div className="space-y-4">
            <div className="bg-[#0D1426] border border-[#1E293B] rounded-xl p-4">
              <p className="text-slate-200 font-semibold">{selected.employee?.fullName ?? '—'}</p>
              <p className="text-slate-500 text-xs mt-1">
                {new Date(selected.date).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <div className="mt-2">
                <Badge status={selected.status} />
              </div>
            </div>

            <Select
              label="Novo status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as ScheduleStatus)}
              options={STATUS_OPTIONS}
            />

            <Input
              label="Observação (opcional)"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder="Ex: atestado médico, hora extra..."
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setSelected(null)}>Cancelar</Button>
              <Button onClick={() => void handleSave()} loading={saving}>Salvar alteração</Button>
            </div>
          </div>
        )}
      </Modal>

      <ToastContainer toasts={toasts} remove={remove} />
    </div>
  );
}
