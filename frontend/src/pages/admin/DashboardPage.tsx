import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react';
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

  const loadData = () =>
    Promise.all([
      employeesService.findAll(),
      auditService.findAll(6),
      schedulesService.getMonthSchedule(now.getFullYear(), now.getMonth() + 1),
    ])
      .then(([e, l, d]) => { setEmployees(e); setLogs(l); setDays(d); })
      .finally(() => setLoading(false));

  useEffect(() => { void loadData(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenMsg('');
    try {
      const r = await schedulesService.generateMonth({
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      });
      setGenMsg(`✅ ${r.created} dias criados para ${now.toLocaleDateString('pt-BR', { month: 'long' })}`);
      const d = await schedulesService.getMonthSchedule(now.getFullYear(), now.getMonth() + 1);
      setDays(d);
      const l = await auditService.findAll(6);
      setLogs(l);
    } catch {
      setGenMsg('❌ Erro ao gerar escala.');
    } finally {
      setGenerating(false);
    }
  };

  const active = employees.filter((e) => e.isActive).length;
  const inactive = employees.filter((e) => !e.isActive).length;
  const absents = days.filter((d) => d.status === 'ABSENT').length;
  const today = days.filter((d) => {
    const dt = new Date(d.date);
    return (
      dt.getUTCDate() === now.getDate() &&
      dt.getUTCMonth() === now.getMonth() &&
      d.status === 'SCHEDULED'
    );
  }).length;
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const actionLabel: Record<string, string> = {
    GENERATE_MONTH: 'Escala gerada',
    UPDATE_DAY: 'Dia alterado',
    CREATE_EMPLOYEE: 'Funcionário cadastrado',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-in">
      <PageHeader
        title="Dashboard"
        subtitle={`Visão geral — ${monthName}`}
        action={
          <Button onClick={() => void handleGenerate()} loading={generating} size="sm">
            Gerar escala do mês
          </Button>
        }
      />

      {genMsg && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-[#111827] border border-[#1E293B] text-sm text-slate-300">
          {genMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {/* Ativos */}
        <div className="rounded-2xl border border-orange-500/20 `bg-linear-to-br` from-orange-500/10 to-orange-500/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-400">Funcionários ativos</p>
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Users size={16} className="text-orange-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-orange-400 mb-1">{active}</p>
          <p className="text-xs text-slate-500">
            {inactive > 0 ? `${inactive} inativo${inactive > 1 ? 's' : ''}` : 'todos ativos'}
            {' · '}{employees.length} total
          </p>
        </div>

        {/* Faltas */}
        <div className="rounded-2xl border border-red-500/20 `bg-linear-to-br from-red-500/10 to-red-500/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-400">Faltas no mês</p>
            <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-red-400 mb-1">{absents}</p>
          <p className="text-xs text-slate-500 capitalize">{monthName}</p>
        </div>

        {/* Hoje */}
        <div className="rounded-2xl border border-green-500/20 `bg-linear-to-br` from-green-500/10 to-green-500/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-400">Trabalhando hoje</p>
            <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle size={16} className="text-green-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-green-400 mb-1">{today}</p>
          <p className="text-xs text-slate-500">turnos agendados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividade recente */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white">Atividade recente</h3>
            <button
              onClick={() => navigate('/admin/audit')}
              className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/15 border border-orange-500/20 px-3 py-1.5 rounded-lg transition-all"
            >
              Ver tudo
              <ArrowRight size={12} />
            </button>
          </div>
          {logs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-2xl mb-2">📋</p>
              <p className="text-sm text-slate-500">Nenhuma atividade ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1E293B]/50 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-[#1E293B] flex items-center justify-center text-sm shrink-0">
                    {log.action === 'GENERATE_MONTH' ? '📅' : log.action === 'UPDATE_DAY' ? '✏️' : '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate font-medium">
                      {actionLabel[log.action] ?? log.action}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {log.actor?.employee?.fullName ?? '—'}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-600 shrink-0">
                    {new Date(log.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Acesso rápido */}
        <Card>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-lg bg-orange-500/15 flex items-center justify-center">
              <TrendingUp size={13} className="text-orange-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Acesso rápido</h3>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Gerenciar funcionários', icon: '👥', sub: `${employees.length} cadastrados`, to: '/admin/employees' },
              { label: 'Ver escala do mês', icon: '📅', sub: `${days.length} dias gerados`, to: '/admin/schedule' },
              { label: 'Ver histórico de ações', icon: '📋', sub: `${logs.length} ações recentes`, to: '/admin/audit' },
            ].map(({ label, icon, sub, to }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-[#0D1426] border border-[#1E293B] hover:border-orange-500/30 hover:bg-[#0F1E34] transition-all duration-200 text-left group"
              >
                <span className="text-xl">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 font-medium">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                </div>
                <ArrowRight size={14} className="text-slate-600 group-hover:text-orange-400 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
