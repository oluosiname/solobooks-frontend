'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Plus, Upload, AlertCircle, Edit2, Trash2, Receipt } from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout';
import { SearchInput, Tabs } from '@/components/ui';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, groupTransactionsByMonth, cn } from '@/lib/utils';
import { styles, buttonStyles } from '@/lib/styles';
import type { TransactionType } from '@/types';

export default function TransactionsPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', activeTab],
    queryFn: () => api.getTransactions(activeTab === 'all' ? undefined : activeTab as TransactionType),
  });

  const { data: uncheckedTransactions } = useQuery({
    queryKey: ['unchecked-transactions'],
    queryFn: api.getUncheckedTransactions,
  });

  const filteredTransactions = transactions?.filter(
    (t) =>
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedTransactions = filteredTransactions
    ? groupTransactionsByMonth(filteredTransactions)
    : {};

  const tabs = [
    { id: 'all', label: t('transactions.types.all') },
    { id: 'income', label: t('transactions.types.income') },
    { id: 'expense', label: t('transactions.types.expense') },
  ];

  return (
    <AppShell title={t('transactions.title')}>
      <div className="space-y-6">
        {/* Unchecked Alert */}
        {uncheckedTransactions && uncheckedTransactions.length > 0 && (
          <div className={cn(styles.alert, styles.alertWarning, 'animate-slide-up')}>
            <AlertCircle className="h-5 w-5" />
            <div className="flex-1">
              <p dangerouslySetInnerHTML={{ __html: t('transactions.uncheckedAlert', { count: uncheckedTransactions.length }).replace(String(uncheckedTransactions.length), `<strong>${uncheckedTransactions.length}</strong>`) }} />
            </div>
            <Link
              href="/transactions?filter=pending"
              className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50"
            >
              {t('transactions.viewPending')}
            </Link>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <div className="flex gap-2">
            <Link href="/transactions/new-expense" className={buttonStyles('secondary')}>
              <Plus className="h-4 w-4" />
              {t('transactions.addExpense')}
            </Link>
            <Link href="/transactions/new-income" className={buttonStyles('secondary')}>
              <Plus className="h-4 w-4" />
              {t('transactions.addIncome')}
            </Link>
            <Link href="/transactions/import" className={buttonStyles('secondary')}>
              <Upload className="h-4 w-4" />
              {t('transactions.import')}
            </Link>
          </div>
        </div>

        {/* Search */}
        <SearchInput
          placeholder={t('transactions.searchPlaceholder')}
          value={searchQuery}
          onChange={setSearchQuery}
          className="max-w-md"
        />

        {/* Transactions by Month */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-500">{t('transactions.loadingTransactions')}</p>
          </div>
        ) : Object.keys(groupedTransactions).length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-500">{t('transactions.noTransactions')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([month, monthTransactions], groupIndex) => (
              <div key={month} className={cn(styles.card, 'overflow-hidden animate-slide-up')} style={{ animationDelay: `${groupIndex * 100}ms` }}>
                <div className={cn(styles.cardHeader, 'bg-slate-50')}>
                  <h3 className="font-semibold text-slate-900">{month}</h3>
                </div>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>{t('transactions.columns.description')}</th>
                      <th className={styles.th}>{t('transactions.columns.date')}</th>
                      <th className={styles.th}>{t('transactions.columns.amount')}</th>
                      <th className={styles.th}>{t('transactions.columns.receipt')}</th>
                      <th className={cn(styles.th, 'w-24')}>{t('transactions.columns.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-slate-50">
                        <td className={styles.td}>
                          <div>
                            <p className="font-medium text-slate-900">{transaction.description}</p>
                            <p className="text-sm text-slate-500">{transaction.category}</p>
                          </div>
                        </td>
                        <td className={styles.td}>{formatDate(transaction.date)}</td>
                        <td className={styles.td}>
                          <span className={`font-medium ${transaction.type === 'income' ? 'text-emerald-600' : 'text-slate-700'}`}>
                            {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className={styles.td}>
                          {transaction.receiptUrl ? (
                            <Receipt className="h-4 w-4 text-slate-400" />
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className={styles.td}>
                          <div className="flex gap-1">
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
