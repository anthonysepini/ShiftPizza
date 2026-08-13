import type { ScheduleStatus } from '../../types';
import { getScheduleStatusPresentation } from '../../features/schedules/status';

type BadgeProps = {
  status: ScheduleStatus;
};

export default function Badge({ status }: BadgeProps) {
  const config = getScheduleStatusPresentation(status);

  return (
    <span
      className={[
        'inline-flex items-center gap-2 rounded-xl px-3 py-1.5',
        'text-xs font-medium leading-none whitespace-nowrap',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]',
        config.badgeClass,
      ].join(' ')}
    >
      {config.icon} {config.label}
    </span>
  );
}
