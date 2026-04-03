import type { ScheduleStatus } from '../../types';

const cfg: Record<ScheduleStatus, { label: string; cls: string }> = {
  SCHEDULED:     { label: 'Agendado',  cls: 'bg-green-500/15 text-green-400 border-green-500/25' },
  ABSENT:        { label: 'Falta',     cls: 'bg-red-500/15 text-red-400 border-red-500/25' },
  EXTRA_SHIFT:   { label: 'Extra',     cls: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  DAY_OFF:       { label: 'Folga',     cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25' },
  REMOVED_SHIFT: { label: 'Removido', cls: 'bg-slate-500/15 text-slate-400 border-slate-500/25' },
};

export default function Badge({ status }: { status: ScheduleStatus }) {
  const { label, cls } = cfg[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${cls}`}>
      {label}
    </span>
  );
}
