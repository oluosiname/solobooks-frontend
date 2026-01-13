'use client';

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { styles } from '@/lib/styles';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function SearchInput({ placeholder = 'Search...', value, onChange, className }: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(styles.input, styles.inputWithIcon)}
      />
    </div>
  );
}
