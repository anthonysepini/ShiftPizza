import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { employeesService } from '../../services/employees.service';
import { schedulesService } from '../../services/schedules.service';
import { auditService } from '../../services/audit.service';
import type { Employee, AuditLog, ScheduleDay } from '../../types';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const now = new Date();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genMsg, setGenMsg] = useState('');

  useEffect(() => {
    Promise.all([
      employeesService.findAll(),
      auditService.findAll(6),
      schedulesService.getMonthSchedule(now.getFullYear(), now.getMonth() + 1),
    ])
      .then(([e, l, d]) => { setEmployees(e); setLogs(l); setDays(d); })
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenMsg('');
    try {
      const r = await schedulesService.generateMonth({ year: now.getFullYear(), month: now.getMonth() + 1 });
      setGenMsg(`✅ ${r.created} dias criados para ${now.toLocaleDateString('pt-BR', { month: 'long' })}`);
      const d = await schedulesService.getMonthSchedule(now.getFullYear(), now.getMonth() + 1);
      setDays(d);
    } catch { setGenMsg('❌ Erro ao gerar escala.'); }
    finally { setGenerating(false); }
  };

  const active = employees.filter((e) => e.isActive).length;
  const absents = days.filter((d) => d.status === 'ABSENT').length;
  const today = days.filter((d) => {
    const dt = new Date(d.date);
    return dt.getUTCDate() === now.getDate() && dt.getUTCMonth() === now.getMonth() && d.status === 'SCHEDULED';
  }).length;
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const actionLabel: Record<string, string> = {
    GENERATE_MONTH: 'Escala gerada',
    UPDATE_DAY: 'Dia alterado',
    CREATE_EMPLOYEE: 'Funcionário cadastrado',
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="animate-in">
      <PageHeader
        title="Dashboard"
        subtitle={`Visão geral — ${monthName}`}
        action={
          <Button onClick={handleGenerate} loading={generating} size="sm">
            Gerar escala do mês
          </Button>
        }
      />

      {genMsg && (
        <div className="mb-5 px-4 py-2.5 rounded-lg bg-[#111827] border border-[#1E293B] text-sm text-slate-300">
          {genMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Funcionários ativos', value: active, sub: `${employees.length} total`, icon: Users, color: 'orange' },
          { label: 'Faltas no mês', value: absents, sub: monthName, icon: AlertTriangle, color: 'red' },
          { label: 'Trabalhando hoje', value: today, sub: 'turnos agendados', icon: CheckCircle, color: 'green' },
        ].map(({ label, value, sub, icon: Icon, color }) => {
          const border = color === 'orange' ? 'border-orange-500/20' : color === 'red' ? 'border-red-500/20' : 'border-green-500/20';
          const bg = color === 'orange' ? 'bg-orange-500/5' : color === 'red' ? 'bg-red-500/5' : 'bg-green-500/5';
          const tc = color === 'orange' ? 'text-orange-400' : color === 'red' ? 'text-red-400' : 'text-green-400';
          return (
            <div key={label} className={`rounded-xl border p-5 ${border} ${bg}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-400">{label}</p>
                <Icon size={16} className={tc} />
              </div>
              <p className={`text-3xl font-bold ${tc}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-1">{sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Atividade */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Atividade recente</h3>
            <button onClick={() => navigate('/admin/audit')} className="text-xs text-orange-400 hover:text-orange-300 transition-colors">Ver tudo →</button>
          </div>
          {logs.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Nenhuma atividade ainda</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#1E293B] flex items-center justify-center text-xs shrink-0">
                    {log.action === 'GENERATE_MONTH' ? '📅' : log.action === 'UPDATE_DAY' ? '✏️' : '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{actionLabel[log.action] ?? log.action}</p>
                    <p className="text-xs text-slate-500 truncate">{log.actor?.employee?.fullName ?? '—'}</p>
                  </div>
                  <p className="text-[10px] text-slate-600 shrink-0">
                    {new Date(log.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Acesso rápido */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-orange-400" />
            <h3 className="text-sm font-semibold text-white">Acesso rápido</h3>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Gerenciar funcionários', icon: '👥', to: '/admin/employees' },
              { label: 'Ver escala do mês', icon: '📅', to: '/admin/schedule' },
              { label: 'Ver histórico de ações', icon: '📋', to: '/admin/audit' },
            ].map(({ label, icon, to }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#0D1426] border border-[#1E293B] hover:border-orange-500/30 hover:bg-[#0F1E34] transition-all duration-200 text-left"
              >
                <span>{icon}</span>
                <span className="text-sm text-slate-300 flex-1">{label}</span>
                <span className="text-slate-600 text-xs">→</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
