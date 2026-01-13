'use client';

import { Bell, HelpCircle } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Help */}
        <button className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* User Menu */}
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 py-1.5 pl-3 pr-2 transition-colors hover:bg-slate-50">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">Braun and Sons</p>
            <p className="text-xs text-slate-500">EN • DE</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-medium text-white">
            BS
          </div>
        </div>
      </div>
    </header>
  );
}
