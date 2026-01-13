import { cn, getStatusColor } from '@/lib/utils';
import { styles } from '@/lib/styles';

interface BadgeProps {
  status: string;
  className?: string;
}

export function Badge({ status, className }: BadgeProps) {
  return (
    <span className={cn(styles.badge, 'capitalize', getStatusColor(status), className)}>
      {status}
    </span>
  );
}
