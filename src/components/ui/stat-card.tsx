'use client';

import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { styles } from '@/lib/styles';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({ title, value, change, changeLabel, icon: Icon, className }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className={cn(styles.card, 'p-6 animate-slide-up', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <span>{title}</span>
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
      </div>
      <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
      {(change !== undefined || changeLabel) && (
        <div className={cn(
          'mt-2 flex items-center gap-1 text-sm',
          isPositive ? 'text-emerald-600' : 'text-red-600'
        )}>
          {change !== undefined && (
            isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )
          )}
          <span>
            {change !== undefined && `${isPositive ? '+' : ''}${change}%`}
            {changeLabel && ` ${changeLabel}`}
          </span>
        </div>
      )}
    </div>
  );
}
