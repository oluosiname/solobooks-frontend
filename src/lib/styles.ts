// Shared style constants for consistent styling across components

export const styles = {
  // Card styles
  card: 'rounded-xl border border-slate-200 bg-white shadow-sm',
  cardHeader: 'border-b border-slate-100 px-6 py-4',
  cardContent: 'px-6 py-4',

  // Button styles
  btn: 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  btnPrimary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
  btnSecondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-500',
  btnGhost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  btnDanger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',

  // Input styles
  input: 'w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
  inputWithIcon: 'pl-10',

  // Badge styles
  badge: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',

  // Table styles
  table: 'w-full text-left text-sm',
  th: 'border-b border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-600',
  td: 'border-b border-slate-100 px-4 py-3 text-slate-700',

  // Tab styles
  tabs: 'flex gap-1 rounded-lg bg-slate-100 p-1',
  tab: 'rounded-md px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900',
  tabActive: 'bg-white text-slate-900 shadow-sm',

  // Alert styles
  alert: 'flex items-center gap-4 rounded-xl border p-4',
  alertInfo: 'border-blue-200 bg-blue-50 text-blue-800',
  alertWarning: 'border-amber-200 bg-amber-50 text-amber-800',
  alertSuccess: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  alertError: 'border-red-200 bg-red-50 text-red-800',
} as const;

// Helper function to combine button styles
export function buttonStyles(variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary') {
  const variantStyles = {
    primary: styles.btnPrimary,
    secondary: styles.btnSecondary,
    ghost: styles.btnGhost,
    danger: styles.btnDanger,
  };
  return `${styles.btn} ${variantStyles[variant]}`;
}
