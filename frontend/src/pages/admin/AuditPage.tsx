import { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { auditService } from '../../services/audit.service';
import type { AuditLog } from '../../types';

const actionLabel: Record<string, { label: string; icon: string; color: string }> = {
  GENERATE_MONTH: { label: 'Escala gerada',           icon: '📅', color: 'text-orange-400' },
  UPDATE_DAY:     { label: 'Dia alterado',             icon: '✏️', color: 'text-blue-400' },
  CREATE_EMPLOYEE:{ label: 'Funcionário cadastrado',   icon: '👤', color: 'text-green-400' },
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditService.findAll(100)
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-in">
      <PageHeader title="Histórico" subtitle="Todas as ações realizadas no sistema" />

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : logs.length === 0 ? (
        <EmptyState icon="📋" title="Nenhuma ação registrada" description="As ações do admin aparecem aqui." />
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const cfg = actionLabel[log.action] ?? { label: log.action, icon: '⚙️', color: 'text-slate-400' };
            return (
              <Card key={log.id} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-[#1E293B] flex items-center justify-center text-base shrink-0">
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</p>
                    <span className="text-xs text-slate-600">·</span>
                    <p className="text-sm text-slate-400">{log.actor?.employee?.fullName ?? '—'}</p>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Entidade: {log.entity} · ID: {log.entityId.slice(0, 16)}...
                  </p>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <p className="text-xs text-slate-600 mt-0.5">
                      {JSON.stringify(log.metadata).slice(0, 80)}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">
                    {new Date(log.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </p>
                  <p className="text-[10px] text-slate-600">
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
