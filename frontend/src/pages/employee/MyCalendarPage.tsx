import { useReducer, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader.tsx';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { schedulesService } from '../../services/schedules.service';
import type { ScheduleDay } from '../../types';

const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const TODAY = new Date();

type State = { loading: boolean; days: ScheduleDay[] };
type Action =
  | { type: 'loading' }
  | { type: 'success'; payload: ScheduleDay[] }
  | { type: 'error' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':  return { ...state, loading: true };
    case 'success':  return { loading: false, days: action.payload };
    case 'error':    return { loading: false, days: [] };
  }
}

export default function MyCalendarPage() {
  const [year, setYear]   = useState(TODAY.getFullYear());
  const [month, setMonth] = useState(TODAY.getMonth() + 1);
  const [{ loading, days }, dispatch] = useReducer(reducer, { loading: true, days: [] });

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: 'loading' });
    schedulesService
      .getMySchedule(year, month)
      .then((data) => { if (!cancelled) dispatch({ type: 'success', payload: data }); })
      .catch(() => { if (!cancelled) dispatch({ type: 'error' }); });
    return () => { cancelled = true; };
  }, [year, month]);

  const prevMonth = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  };

  const daysInMonth  = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const monthLabel   = new Date(year, month - 1).toLocaleDateString('pt-BR', {
    month: 'long', year: 'numeric',
  });

  const dayMap = new Map(
    days.map((d) => [new Date(d.date).toISOString().split('T')[0], d]),
  );

  const statusDot: Record<string, string> = {
    SCHEDULED:     'bg-green-400',
    ABSENT:        'bg-red-400',
    EXTRA_SHIFT:   'bg-blue-400',
    DAY_OFF:       'bg-yellow-400',
    REMOVED_SHIFT: 'bg-slate-500',
  };

  const statusLabel: Record<string, string> = {
    SCHEDULED:     'Trabalho',
    ABSENT:        'Falta',
    EXTRA_SHIFT:   'Extra',
    DAY_OFF:       'Folga',
    REMOVED_SHIFT: 'Removido',
  };

  return (
    <div className="animate-in">
      <PageHeader title="Minha Escala" subtitle="Visualize seus dias de trabalho" />

      {/* Month nav */}
      <div className="flex items-center gap-1 bg-[#111827] border border-[#1E293B] rounded-lg p-1 w-fit mb-5">
        <button onClick={prevMonth} className="p-1.5 rounded hover:bg-[#1E293B] text-slate-400 hover:text-slate-200 transition-all">
          <ChevronLeft size={14} />
        </button>
        <span className="text-sm font-medium text-slate-200 px-3 capitalize">{monthLabel}</span>
        <button onClick={nextMonth} className="p-1.5 rounded hover:bg-[#1E293B] text-slate-400 hover:text-slate-200 transition-all">
          <ChevronRight size={14} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : days.length === 0 ? (
        <EmptyState
          icon="📅"
          title="Escala ainda não gerada"
          description="O admin ainda não gerou sua escala para este mês."
        />
      ) : (
        <>
          {/* Calendar grid */}
          <div className="bg-[#111827] border border-[#1E293B] rounded-xl overflow-hidden mb-5">
            <div className="grid grid-cols-7 border-b border-[#1E293B]">
              {WEEKDAYS_SHORT.map((d) => (
                <div key={d} className="text-center py-3 text-xs font-medium text-slate-500">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: firstWeekday }).map((_, i) => (
                <div key={`e-${i}`} className="min-h-20' border-b border-r border-[#1E293B] bg-[#0A0F1E]/30" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day  = i + 1;
                const date = new Date(year, month - 1, day);
                const key  = date.toISOString().split('T')[0];
                const entry   = dayMap.get(key);
                const isToday = date.toDateString() === TODAY.toDateString();
                const col     = (firstWeekday + i) % 7;

                return (
                  <div
                    key={day}
                    className={`min-h-20' p-2 border-b border-[#1E293B] ${col < 6 ? 'border-r' : ''} ${isToday ? 'ring-1 ring-inset ring-orange-500/30' : ''}`}
                  >
                    <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1.5 ${isToday ? 'bg-orange-500 text-white' : 'text-slate-400'}`}>
                      {day}
                    </div>
                    {entry && (
                      <div className="flex flex-col gap-1">
                        <div className={`w-2 h-2 rounded-full ${statusDot[entry.status]}`} />
                        <p className="text-[9px] text-slate-500">{statusLabel[entry.status]}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* List */}
          <div className="space-y-2">
            {days.map((d) => {
              const date    = new Date(d.date);
              const isToday = date.toDateString() === TODAY.toDateString();
              return (
                <div
                  key={d.id}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg border ${isToday ? 'border-orange-500/30 bg-orange-500/5' : 'border-[#1E293B] bg-[#111827]'}`}
                >
                  <div className="w-10 text-center shrink-0">
                    <p className={`text-sm font-bold ${isToday ? 'text-orange-400' : 'text-slate-200'}`}>
                      {date.getUTCDate()}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase">
                      {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </p>
                  </div>
                  <div className="flex-1">
                    {d.note
                      ? <p className="text-xs text-slate-500">{d.note}</p>
                      : <p className="text-xs text-slate-600">—</p>
                    }
                  </div>
                  <Badge status={d.status} />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
