'use client';

import { formatCurrency, formatDate } from '@/lib/utils';
import { styles } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className={cn(styles.card, 'animate-slide-up stagger-5')}>
      <div className={styles.cardHeader}>
        <h3 className="text-lg font-semibold text-slate-900">Recent Transactions</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-slate-900">{transaction.description}</p>
              <p className="text-sm text-slate-500">
                {(transaction.financialCategory ?? transaction.category)?.translatedName || 'Uncategorized'} • {formatDate(transaction.date)}
              </p>
            </div>
            <div className="ml-4 text-right">
              <p className={`font-semibold ${transaction.transactionType === 'Income' ? 'text-emerald-600' : 'text-slate-700'}`}>
                {transaction.transactionType === 'Income' ? '+' : ''}{formatCurrency(transaction.amount)}
              </p>
              <p className="text-xs text-slate-500 capitalize">{transaction.transactionType.toLowerCase()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
