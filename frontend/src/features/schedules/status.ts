import type { ScheduleStatus } from '../../types';

export interface ScheduleStatusPresentation {
  label: string;
  shortLabel: string;
  icon: string;
  defaultNote: string;
  badgeClass: string;
  chipClass: string;
  dotClass: string;
  calendar: {
    background: string;
    color: string;
    border: string;
  };
}

export const SCHEDULE_STATUS_VALUES = [
  'SCHEDULED',
  'ABSENT',
  'EXTRA_SHIFT',
  'DAY_OFF',
  'REMOVED_SHIFT',
] as const satisfies readonly ScheduleStatus[];

export const SCHEDULE_STATUS_PRESENTATION = {
  SCHEDULED: {
    label: 'Escalado',
    shortLabel: 'Esc.',
    icon: '✅',
    defaultNote: 'Turno programado na sua escala atual.',
    badgeClass:
      'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    chipClass: 'border-orange-500/15 bg-orange-500/8 text-orange-300',
    dotClass: 'bg-orange-400',
    calendar: {
      background: 'rgba(34,197,94,0.10)',
      color: '#86efac',
      border: 'rgba(34,197,94,0.22)',
    },
  },
  ABSENT: {
    label: 'Falta',
    shortLabel: 'Falta',
    icon: '❌',
    defaultNote: 'Falta registrada neste dia.',
    badgeClass: 'border border-red-500/20 bg-red-500/10 text-red-300',
    chipClass: 'border-red-500/15 bg-red-500/8 text-red-300',
    dotClass: 'bg-red-400',
    calendar: {
      background: 'rgba(239,68,68,0.10)',
      color: '#fca5a5',
      border: 'rgba(239,68,68,0.22)',
    },
  },
  EXTRA_SHIFT: {
    label: 'Turno Extra',
    shortLabel: 'Extra',
    icon: '➕',
    defaultNote: 'Turno extra registrado na sua escala.',
    badgeClass: 'border border-blue-500/20 bg-blue-500/10 text-blue-300',
    chipClass: 'border-amber-500/15 bg-amber-500/8 text-amber-300',
    dotClass: 'bg-amber-300',
    calendar: {
      background: 'rgba(59,130,246,0.10)',
      color: '#93c5fd',
      border: 'rgba(59,130,246,0.22)',
    },
  },
  DAY_OFF: {
    label: 'Folga',
    shortLabel: 'Folga',
    icon: '🌴',
    defaultNote: 'Dia livre sem turno programado.',
    badgeClass:
      'border border-yellow-500/20 bg-yellow-500/10 text-yellow-300',
    chipClass: 'border-white/10 bg-white/[0.03] text-zinc-300',
    dotClass: 'bg-zinc-400',
    calendar: {
      background: 'rgba(234,179,8,0.10)',
      color: '#fde047',
      border: 'rgba(234,179,8,0.22)',
    },
  },
  REMOVED_SHIFT: {
    label: 'Removido',
    shortLabel: 'Rem.',
    icon: '🗑️',
    defaultNote: 'Turno removido da escala.',
    badgeClass:
      'border border-slate-500/20 bg-slate-500/10 text-slate-300',
    chipClass: 'border-white/10 bg-white/[0.03] text-slate-300',
    dotClass: 'bg-slate-400',
    calendar: {
      background: 'rgba(100,116,139,0.10)',
      color: '#cbd5e1',
      border: 'rgba(100,116,139,0.22)',
    },
  },
} satisfies Record<ScheduleStatus, ScheduleStatusPresentation>;

export function getScheduleStatusPresentation(
  status: ScheduleStatus,
): ScheduleStatusPresentation {
  return SCHEDULE_STATUS_PRESENTATION[status];
}

export function isScheduleStatus(value: string): value is ScheduleStatus {
  return SCHEDULE_STATUS_VALUES.some((status) => status === value);
}

export function parseScheduleStatus(value: string): ScheduleStatus | null {
  return isScheduleStatus(value) ? value : null;
}
