import { useState, useEffect } from 'react';
import { Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader.tsx';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../features/auth/useAuth';
import { schedulesService } from '../../services/schedules.service';
import type { ScheduleDay } from '../../types';

const TODAY = new Date();

export default function MyDashboardPage() {
  const { user } = useAuth();
  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    schedulesService
      .getMySchedule(TODAY.getFullYear(), TODAY.getMonth() + 1)
      .then((data) => { if (!cancelled) setDays(data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const scheduled = days.filter((d) => d.status === 'SCHEDULED').length;
  const absents   = days.filter((d) => d.status === 'ABSENT').length;
  const changed   = days.filter((d) => d.source === 'MANUAL').length;

  const upcoming = days
    .filter((d) => new Date(d.date) >= TODAY && d.status === 'SCHEDULED')
    .slice(0, 5);

  const monthName = TODAY.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="animate-in">
      <PageHeader
        title={`Olá, ${user?.fullName?.split(' ')[0] ?? ''} 👋`}
        subtitle={`Sua escala de ${monthName}`}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Dias agendados', value: scheduled, icon: CheckCircle, color: 'green' },
          { label: 'Faltas',         value: absents,   icon: AlertTriangle, color: 'red' },
          { label: 'Alterações',     value: changed,   icon: Calendar,     color: 'blue' },
        ].map(({ label, value, icon: Icon, color }) => {
          const tc = color === 'green' ? 'text-green-400' : color === 'red' ? 'text-red-400' : 'text-blue-400';
          const bc = color === 'green'
            ? 'border-green-500/20 bg-green-500/5'
            : color === 'red'
            ? 'border-red-500/20 bg-red-500/5'
            : 'border-blue-500/20 bg-blue-500/5';
          return (
            <div key={label} className={`rounded-xl border p-4 ${bc}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-400">{label}</p>
                <Icon size={14} className={tc} />
              </div>
              <p className={`text-2xl font-bold ${tc}`}>{value}</p>
            </div>
          );
        })}
      </div>

      {/* Upcoming */}
      <Card>
        <h3 className="text-sm font-semibold text-white mb-4">Próximos dias de trabalho</h3>
        {upcoming.length === 0 ? (
          <EmptyState
            icon="📅"
            title="Nenhum turno agendado"
            description="Aguarde o admin gerar a escala deste mês."
          />
        ) : (
          <div className="space-y-2">
            {upcoming.map((d) => {
              const date = new Date(d.date);
              const isToday = date.toDateString() === TODAY.toDateString();
              return (
                <div
                  key={d.id}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${isToday ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-[#0D1426] border border-[#1E293B]'}`}
                >
                  <div className="text-center shrink-0 w-10">
                    <p className={`text-lg font-bold leading-none ${isToday ? 'text-orange-400' : 'text-slate-200'}`}>
                      {date.getUTCDate()}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase mt-0.5">
                      {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-200">
                      {date.toLocaleDateString('pt-BR', { month: 'long' })}
                    </p>
                    {d.note && <p className="text-xs text-slate-500 mt-0.5">{d.note}</p>}
                  </div>
                  <Badge status={d.status} />
                  {isToday && (
                    <span className="text-[10px] text-orange-400 font-semibold uppercase tracking-wider">
                      Hoje
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
