import type { ScheduleStatus } from '../../types';

type BadgeProps = {
  status: ScheduleStatus;
};

const STATUS_STYLES: Record<
  ScheduleStatus,
  { label: string; className: string }
> = {
  SCHEDULED: {
    label: 'ㅤ✅ Escalado',
    className:
      'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  },
  ABSENT: {
    label: '❌ Falta',
    className:
      'border border-red-500/20 bg-red-500/10 text-red-300',
  },
  EXTRA_SHIFT: {
    label: '➕ Turno Extra',
    className:
      'border border-blue-500/20 bg-blue-500/10 text-blue-300',
  },
  DAY_OFF: {
    label: '🌴 Folga',
    className:
      'border border-yellow-500/20 bg-yellow-500/10 text-yellow-300',
  },
  REMOVED_SHIFT: {
    label: '🗑️ Removido',
    className:
      'border border-slate-500/20 bg-slate-500/10 text-slate-300',
  },
};

export default function Badge({ status }: BadgeProps) {
  const config = STATUS_STYLES[status];

  return (
    <span
      className={[
        'inline-flex items-center gap-2 rounded-xl px-3 py-1.5',
        'text-xs font-medium leading-none whitespace-nowrap',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]',
        config.className,
      ].join(' ')}
    >
      {config.label}
    </span>
  );
}
