'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Plus, MoreVertical, ChevronLeft, ChevronRight, Send, CreditCard, Download } from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout';
import { SearchInput, Tabs, Badge } from '@/components/ui';
import { api } from '@/lib/api';
import { fetchInvoices, sendInvoice, payInvoice, downloadInvoicePdf } from '@/services/api';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { styles, buttonStyles } from '@/lib/styles';
import { showToast } from '@/lib/toast';
import type { InvoiceStatus, ApiError } from '@/types';

export default function InvoicesPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const clientId = searchParams.get('client_id');

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const queryClient = useQueryClient();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Only close if clicking outside any dropdown
      const target = event.target as Element;
      const isInsideDropdown = target.closest('[data-dropdown]');

      if (!isInsideDropdown) {
        setOpenDropdownId(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ['invoices', activeTab, searchQuery, currentPage, clientId],
    queryFn: () => fetchInvoices({
      status: activeTab === 'all' ? undefined : activeTab as InvoiceStatus,
      query: searchQuery || undefined,
      client_id: clientId || undefined,
      page: currentPage,
      per_page: itemsPerPage,
    }),
  });

  const invoices = invoicesData?.invoices || [];
  const totalPages = invoicesData?.meta?.totalPages || 1;

  const sendInvoiceMutation = useMutation({
    mutationFn: (invoiceId: string) => sendInvoice(invoiceId),
    onSuccess: () => {
      showToast.success(t('invoices.actions.sentSuccess'));
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setOpenDropdownId(null);
    },
    onError: (error: ApiError) => {
      showToast.error(error?.error?.message || error?.message || t('invoices.actions.sentError'));
    },
  });

  const payInvoiceMutation = useMutation({
    mutationFn: (invoiceId: string) => payInvoice(invoiceId),
    onSuccess: () => {
      showToast.success(t('invoices.actions.paidSuccess'));
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setOpenDropdownId(null);
    },
    onError: (error: ApiError) => {
      showToast.error(error?.error?.message || error?.message || t('invoices.actions.paidError'));
    },
  });

  const downloadPdfMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const blob = await downloadInvoicePdf(invoiceId);
      return { blob, invoiceId };
    },
    onSuccess: ({ blob, invoiceId }) => {
      // Find the invoice to get the invoice number for filename
      const invoice = invoices.find(inv => inv.id === invoiceId);
      const filename = invoice ? `${invoice.invoiceNumber}.pdf` : `invoice-${invoiceId}.pdf`;

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setOpenDropdownId(null);
    },
    onError: (error: ApiError) => {
      showToast.error(error?.error?.message || error?.message || t('invoices.actions.downloadError'));
    },
  });

  const tabs = [
    { id: 'all', label: t('invoices.tabs.all') },
    { id: 'draft', label: t('invoices.status.draft') },
    { id: 'sent', label: t('invoices.status.sent') },
    { id: 'paid', label: t('invoices.status.paid') },
    { id: 'overdue', label: t('invoices.status.overdue') },
    { id: 'cancelled', label: t('invoices.status.cancelled') },
  ];

  return (
    <AppShell title={clientId ? `${t('invoices.title')} - ${t('invoices.filteringByClient')}` : t('invoices.title')}>
      <div className="space-y-6">
        {clientId && (
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-700">
              {t('invoices.filteringByClientDesc')}
            </p>
          </div>
        )}
        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <Link href="/invoices/new" className={buttonStyles('primary')}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t('invoices.newInvoice')}</span>
            <span className="sm:hidden">New</span>
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
          <div className="overflow-x-auto">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>{t('invoices.columns.invoiceNumber')}</th>
                  <th className={cn(styles.th, 'hidden sm:table-cell')}>{t('invoices.columns.client')}</th>
                  <th className={cn(styles.th, 'hidden md:table-cell')}>{t('invoices.columns.invoiceDate')}</th>
                  <th className={cn(styles.th, 'hidden lg:table-cell')}>{t('invoices.columns.dueDate')}</th>
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
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      {t('invoices.noInvoices')}
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50">
                      <td className={cn(styles.td, 'font-medium text-slate-900')}>{invoice.invoiceNumber}</td>
                      <td className={cn(styles.td, 'hidden sm:table-cell')}>{invoice.clientName}</td>
                      <td className={cn(styles.td, 'hidden md:table-cell')}>{formatDate(invoice.date)}</td>
                      <td className={cn(styles.td, 'hidden lg:table-cell')}>{formatDate(invoice.dueDate)}</td>
                      <td className={cn(styles.td, 'font-medium')}>{formatCurrency(invoice.totalAmount)}</td>
                      <td className={styles.td}>
                        <Badge status={invoice.status} />
                      </td>
                    <td className={styles.td}>
                      <div data-dropdown className="relative">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === invoice.id ? null : invoice.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {openDropdownId === invoice.id && (
                          <div data-dropdown className="absolute right-0 z-10 mt-1 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                            {invoice.status === 'draft' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  sendInvoiceMutation.mutate(invoice.id);
                                }}
                                disabled={sendInvoiceMutation.isPending}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                              >
                                <Send className="h-4 w-4" />
                                {sendInvoiceMutation.isPending ? t('common.loading') : t('invoices.actions.markAsSent')}
                              </button>
                            )}
                            {(invoice.status === 'draft' || invoice.status === 'sent') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  payInvoiceMutation.mutate(invoice.id);
                                }}
                                disabled={payInvoiceMutation.isPending}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                              >
                                <CreditCard className="h-4 w-4" />
                                {payInvoiceMutation.isPending ? t('common.loading') : t('invoices.actions.markAsPaid')}
                              </button>
                            )}
                            {invoice.pdfAttached && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadPdfMutation.mutate(invoice.id);
                                }}
                                disabled={downloadPdfMutation.isPending}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                              >
                                <Download className="h-4 w-4" />
                                {downloadPdfMutation.isPending ? t('common.loading') : t('invoices.actions.downloadPdf')}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {invoicesData?.meta && invoicesData.meta.totalCount > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
              <p className="text-sm text-slate-600">
                {t('invoices.showingInvoices', {
                  start: (currentPage - 1) * itemsPerPage + 1,
                  end: Math.min(currentPage * itemsPerPage, invoicesData.meta.totalCount),
                  total: invoicesData.meta.totalCount
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
