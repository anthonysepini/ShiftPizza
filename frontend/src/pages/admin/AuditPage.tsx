import { useState, useEffect } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { auditService } from '../../services/audit.service';
import type { AuditLog } from '../../types';

const ACTION_CONFIG: Record<string, { label: string; icon: string; color: string; description: (log: AuditLog) => string }> = {
  GENERATE_MONTH: {
    label: 'Escala gerada',
    icon: '📅',
    color: 'text-orange-400',
    description: (log) => {
      const meta = log.metadata as { year?: number; month?: number; created?: number } | null;
      if (meta?.year && meta?.month) {
        const monthName = new Date(meta.year, meta.month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        return `${meta.created ?? 0} dias criados para ${monthName}`;
      }
      return 'Escala mensal gerada automaticamente';
    },
  },
  UPDATE_DAY: {
    label: 'Dia alterado',
    icon: '✏️',
    color: 'text-blue-400',
    description: (log) => {
      const meta = log.metadata as { from?: string; to?: string; note?: string } | null;
      const statusLabel: Record<string, string> = {
        SCHEDULED: 'Agendado', ABSENT: 'Falta', EXTRA_SHIFT: 'Turno Extra',
        DAY_OFF: 'Folga', REMOVED_SHIFT: 'Removido',
      };
      if (meta?.from && meta?.to) {
        const from = statusLabel[meta.from] ?? meta.from;
        const to   = statusLabel[meta.to]   ?? meta.to;
        return `Status alterado de ${from} para ${to}${meta.note ? ` · ${meta.note}` : ''}`;
      }
      return 'Status de um dia foi alterado';
    },
  },
  CREATE_EMPLOYEE: {
    label: 'Funcionário cadastrado',
    icon: '👤',
    color: 'text-green-400',
    description: () => 'Novo funcionário adicionado ao sistema',
  },
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditService.findAll(100).then(setLogs).finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-in w-full">
      <PageHeader title="Histórico" subtitle="Todas as ações realizadas no sistema" />

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : logs.length === 0 ? (
        <EmptyState icon="📋" title="Nenhuma ação registrada" description="As ações do admin aparecem aqui." />
      ) : (
        <div className="space-y-2 w-full">
          {logs.map((log) => {
            const cfg = ACTION_CONFIG[log.action] ?? {
              label: log.action,
              icon: '⚙️',
              color: 'text-slate-400',
              description: () => 'Ação do sistema',
            };
            return (
              <Card key={log.id} className="flex items-start gap-4 w-full">
                <div className="w-10 h-10 rounded-xl bg-[#1E293B] flex items-center justify-center text-lg shrink-0">
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</p>
                    <span className="text-slate-600 text-xs">·</span>
                    <p className="text-sm text-slate-400">{log.actor?.employee?.fullName ?? '—'}</p>
                  </div>
                  <p className="text-xs text-slate-500">{cfg.description(log)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-400 font-medium">
                    {new Date(log.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
