'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Plus, Mail, Phone, MapPin, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout';
import { SearchInput } from '@/components/ui';
import { api } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { styles, buttonStyles } from '@/lib/styles';

export default function ClientsPage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: api.getClients,
  });

  const filteredClients = clients?.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell title={t('clients.title')}>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <SearchInput
            placeholder={t('clients.searchPlaceholder')}
            value={searchQuery}
            onChange={setSearchQuery}
            className="max-w-md"
          />
          <Link href="/clients/new" className={buttonStyles('primary')}>
            <Plus className="h-4 w-4" />
            {t('clients.addClient')}
          </Link>
        </div>

        {/* Clients Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-500">{t('clients.loadingClients')}</p>
          </div>
        ) : filteredClients?.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-500">{t('clients.noClients')}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClients?.map((client, index) => (
              <div
                key={client.id}
                className={cn(styles.card, 'p-6 transition-all hover:shadow-md animate-slide-up')}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 truncate">{client.name}</h3>
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{client.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span>{client.location}</span>
                      </div>
                    </div>
                  </div>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex gap-4 border-t border-slate-100 pt-4">
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">{t('clients.totalInvoiced')}</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(client.totalInvoiced)}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">{t('clients.outstanding')}</p>
                    <p className={`font-semibold ${client.outstanding > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {formatCurrency(client.outstanding)}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm text-slate-500">
                  {t('clients.invoiceCount', { count: client.invoiceCount })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
