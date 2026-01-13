'use client';

import { cn } from '@/lib/utils';
import { styles } from '@/lib/styles';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn(styles.tabs, className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            styles.tab,
            activeTab === tab.id && styles.tabActive
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              'ml-1.5 rounded-full px-1.5 py-0.5 text-xs',
              activeTab === tab.id
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-slate-200 text-slate-600'
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
