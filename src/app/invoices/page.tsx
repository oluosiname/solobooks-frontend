'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Plus, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout';
import { SearchInput, Tabs, Badge } from '@/components/ui';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { styles, buttonStyles } from '@/lib/styles';
import type { InvoiceStatus } from '@/types';

export default function InvoicesPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', activeTab],
    queryFn: () => api.getInvoices(activeTab === 'all' ? undefined : activeTab as InvoiceStatus),
  });

  const filteredInvoices = invoices?.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil((filteredInvoices?.length || 0) / itemsPerPage);
  const paginatedInvoices = filteredInvoices?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const tabs = [
    { id: 'all', label: t('invoices.tabs.all') },
    { id: 'draft', label: t('invoices.status.draft') },
    { id: 'sent', label: t('invoices.status.sent') },
    { id: 'paid', label: t('invoices.status.paid') },
    { id: 'overdue', label: t('invoices.status.overdue') },
    { id: 'cancelled', label: t('invoices.status.cancelled') },
  ];

  return (
    <AppShell title={t('invoices.title')}>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <Link href="/invoices/new" className={buttonStyles('primary')}>
            <Plus className="h-4 w-4" />
            {t('invoices.newInvoice')}
          </Link>
        </div>

        {/* Search */}
        <SearchInput
          placeholder={t('invoices.searchPlaceholder')}
          value={searchQuery}
          onChange={setSearchQuery}
          className="max-w-md"
        />

        {/* Table */}
        <div className={cn(styles.card, 'overflow-hidden animate-slide-up')}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>{t('invoices.columns.invoiceNumber')}</th>
                <th className={styles.th}>{t('invoices.columns.client')}</th>
                <th className={styles.th}>{t('invoices.columns.invoiceDate')}</th>
                <th className={styles.th}>{t('invoices.columns.dueDate')}</th>
                <th className={styles.th}>{t('invoices.columns.total')}</th>
                <th className={styles.th}>{t('invoices.columns.status')}</th>
                <th className={cn(styles.th, 'w-12')}>{t('invoices.columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : paginatedInvoices?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    {t('invoices.noInvoices')}
                  </td>
                </tr>
              ) : (
                paginatedInvoices?.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50">
                    <td className={cn(styles.td, 'font-medium text-slate-900')}>{invoice.invoiceNumber}</td>
                    <td className={styles.td}>{invoice.clientName}</td>
                    <td className={styles.td}>{formatDate(invoice.invoiceDate)}</td>
                    <td className={styles.td}>{formatDate(invoice.dueDate)}</td>
                    <td className={cn(styles.td, 'font-medium')}>{formatCurrency(invoice.total)}</td>
                    <td className={styles.td}>
                      <Badge status={invoice.status} />
                    </td>
                    <td className={styles.td}>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {filteredInvoices && filteredInvoices.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
              <p className="text-sm text-slate-600">
                {t('invoices.showingInvoices', {
                  start: (currentPage - 1) * itemsPerPage + 1,
                  end: Math.min(currentPage * itemsPerPage, filteredInvoices.length),
                  total: filteredInvoices.length
                })}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={cn(buttonStyles('secondary'), 'disabled:opacity-50')}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('common.previous')}
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={cn(buttonStyles('secondary'), 'disabled:opacity-50')}
                >
                  {t('common.next')}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
