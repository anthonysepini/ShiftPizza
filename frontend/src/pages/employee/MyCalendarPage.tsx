import { useReducer, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { schedulesService } from '../../services/schedules.service';
import type { ScheduleDay, ScheduleStatus } from '../../types';

const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

type State = { loading: boolean; days: ScheduleDay[] };
type Action = { type: 'loading' } | { type: 'success'; payload: ScheduleDay[] } | { type: 'error' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':  return { ...state, loading: true };
    case 'success':  return { loading: false, days: action.payload };
    case 'error':    return { loading: false, days: [] };
  }
}

// Lógica de "PRESENTE": dia passado com status SCHEDULED → exibir como PRESENTE
function getDisplayStatus(day: ScheduleDay): { status: ScheduleStatus | 'PRESENTE'; label: string; dot: string; badge: string } {
  const dayDate = new Date(day.date);
  dayDate.setHours(0, 0, 0, 0);
  const isPast = dayDate < TODAY;

  if (isPast && day.status === 'SCHEDULED') {
    return { status: 'PRESENTE', label: 'Presente', dot: 'bg-teal-400', badge: 'border-teal-500/25 bg-teal-500/15 text-teal-300' };
  }

  const map: Record<ScheduleStatus, { label: string; dot: string; badge: string }> = {
    SCHEDULED:     { label: 'Agendado',  dot: 'bg-green-400',  badge: 'border-green-500/25 bg-green-500/15 text-green-400' },
    ABSENT:        { label: 'Falta',     dot: 'bg-red-400',    badge: 'border-red-500/25 bg-red-500/15 text-red-400' },
    EXTRA_SHIFT:   { label: 'Extra',     dot: 'bg-blue-400',   badge: 'border-blue-500/25 bg-blue-500/15 text-blue-400' },
    DAY_OFF:       { label: 'Folga',     dot: 'bg-yellow-400', badge: 'border-yellow-500/25 bg-yellow-500/15 text-yellow-400' },
    REMOVED_SHIFT: { label: 'Removido', dot: 'bg-slate-500',  badge: 'border-slate-500/25 bg-slate-500/15 text-slate-400' },
  };

  return { status: day.status, ...map[day.status] };
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

  const prevMonth = () => { if (month === 1) { setYear((y) => y - 1); setMonth(12); } else setMonth((m) => m - 1); };
  const nextMonth = () => { if (month === 12) { setYear((y) => y + 1); setMonth(1); } else setMonth((m) => m + 1); };

  const daysInMonth  = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const monthLabel   = new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const dayMap = new Map(days.map((d) => [new Date(d.date).toISOString().split('T')[0], d]));

  return (
    <div className="animate-in w-full">
      <PageHeader title="Minha Escala" subtitle="Visualize seus dias de trabalho" />

      {/* Month nav */}
      <div className="flex items-center gap-1 bg-[#111827] border border-[#1E293B] rounded-xl p-1 w-fit mb-6">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-[#1E293B] text-slate-400 hover:text-slate-200 transition-all">
          <ChevronLeft size={14} />
        </button>
        <span className="text-sm font-semibold text-slate-200 px-4 capitalize min-w-40 text-center">{monthLabel}</span>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-[#1E293B] text-slate-400 hover:text-slate-200 transition-all">
          <ChevronRight size={14} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : days.length === 0 ? (
        <EmptyState icon="📅" title="Escala ainda não gerada" description="O admin ainda não gerou sua escala para este mês." />
      ) : (
        <>
          {/* Calendar */}
          <div className="bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden mb-6 w-full">
            <div className="grid grid-cols-7 border-b border-[#1E293B] bg-[#0D1426]">
              {WEEKDAYS_SHORT.map((d) => (
                <div key={d} className="text-center py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: firstWeekday }).map((_, i) => (
                <div key={`e-${i}`} className="min-h-22.5 border-b border-r border-[#1E293B] bg-[#0A0F1E]/30" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day    = i + 1;
                const date   = new Date(year, month - 1, day);
                const key    = date.toISOString().split('T')[0];
                const entry  = dayMap.get(key);
                const isToday = date.toDateString() === TODAY.toDateString();
                const col    = (firstWeekday + i) % 7;
                const display = entry ? getDisplayStatus(entry) : null;

                return (
                  <div key={day} className={`min-h-22.5 p-2 border-b border-[#1E293B] ${col < 6 ? 'border-r' : ''} ${isToday ? 'ring-1 ring-inset ring-orange-500/40 bg-orange-500/3' : ''}`}>
                    <div className={`text-xs font-semibold w-7 h-7 flex items-center justify-center rounded-full mb-2 ${isToday ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-slate-400'}`}>
                      {day}
                    </div>
                    {display && (
                      <div className="flex flex-col gap-1">
                        <div className={`w-2 h-2 rounded-full ${display.dot}`} />
                        <p className="text-[9px] text-slate-500 font-medium">{display.label}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { label: 'Presente',  dot: 'bg-teal-400' },
              { label: 'Agendado',  dot: 'bg-green-400' },
              { label: 'Falta',     dot: 'bg-red-400' },
              { label: 'Extra',     dot: 'bg-blue-400' },
              { label: 'Folga',     dot: 'bg-yellow-400' },
              { label: 'Removido', dot: 'bg-slate-500' },
            ].map(({ label, dot }) => (
              <div key={label} className="flex items-center gap-1.5 bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-1.5">
                <div className={`w-2 h-2 rounded-full ${dot}`} />
                <span className="text-xs text-slate-400">{label}</span>
              </div>
            ))}
          </div>

          {/* List */}
          <div className="space-y-2 w-full">
            {days.map((d) => {
              const date     = new Date(d.date);
              const isToday  = date.toDateString() === TODAY.toDateString();
              const display  = getDisplayStatus(d);
              return (
                <div key={d.id} className={`flex items-center gap-4 px-5 py-3.5 rounded-xl border w-full ${isToday ? 'border-orange-500/30 bg-orange-500/5' : 'border-[#1E293B] bg-[#111827]'}`}>
                  <div className="w-12 text-center shrink-0">
                    <p className={`text-base font-bold leading-none ${isToday ? 'text-orange-400' : 'text-slate-200'}`}>
                      {date.getUTCDate()}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase mt-1">
                      {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </p>
                  </div>
                  <div className="flex-1">
                    {d.note
                      ? <p className="text-xs text-slate-400">{d.note}</p>
                      : <p className="text-xs text-slate-600 italic">sem observação</p>
                    }
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${display.badge}`}>
                    {display.label}
                  </span>
                  {isToday && (
                    <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Hoje</span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
