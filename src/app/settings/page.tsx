'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  User,
  Settings,
  Calculator,
  Bell,
  Shield,
  Lock,
  Save,
  Upload,
  Check,
  Download,
  Eye,
  Edit,
  AlertTriangle,
  FileText,
  Loader2,
} from 'lucide-react';
import { AppShell } from '@/components/layout';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { styles, buttonStyles } from '@/lib/styles';
import { api as newApi } from '@/services/api';
import type { InvoiceSettingsInput } from '@/types';
import { showToast } from '@/lib/toast';

// We'll initialize this inside the component to access translations

// Toggle Switch Component
function Toggle({ enabled, onChange }: { enabled: boolean; onChange?: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        enabled ? 'bg-indigo-600' : 'bg-slate-200'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          enabled ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState('profile');
  const queryClient = useQueryClient();

  const settingsTabs = [
    { id: 'profile', label: t('settings.tabs.profile'), icon: User },
    { id: 'app', label: t('settings.tabs.appSettings'), icon: Settings },
    { id: 'invoice', label: t('settings.tabs.invoiceSettings'), icon: FileText },
    { id: 'vat', label: t('settings.tabs.vatTax'), icon: Calculator },
    { id: 'notifications', label: t('settings.tabs.notifications'), icon: Bell },
    { id: 'security', label: t('settings.tabs.security'), icon: Shield },
    { id: 'privacy', label: t('settings.tabs.privacy'), icon: Lock },
  ];

  // Notification toggles state
  const [notifications, setNotifications] = useState({
    invoiceSent: true,
    invoicePaid: true,
    invoiceOverdue: true,
    newClient: false,
    vatDue: true,
    vatSubmitted: true,
    taxYearEnd: true,
    largeExpense: false,
    dailySummary: false,
    weeklyReport: true,
  });

  // Privacy toggles state
  const [privacy, setPrivacy] = useState({
    essential: true,
    analytics: true,
    marketing: false,
    thirdParty: true,
    clientConsent: true,
    clientDeletion: true,
    emailBreach: true,
    smsBreach: true,
  });

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: api.getUser,
  });

  // Fetch invoice settings and currencies
  const { data: invoiceSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['invoiceSettings'],
    queryFn: newApi.fetchInvoiceSettings,
  });

  const { data: currencies } = useQuery({
    queryKey: ['currencies'],
    queryFn: newApi.fetchCurrencies,
  });

  // Invoice settings form state
  const [invoiceFormData, setInvoiceFormData] = useState<InvoiceSettingsInput>({
    prefix: '',
    currencyId: 1,
    language: 'en',
    accountHolder: '',
    accountNumber: '',
    bankName: '',
    iban: '',
    bic: '',
    swift: '',
    sortCode: '',
    routingNumber: '',
    defaultNote: '',
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (invoiceSettings) {
      setInvoiceFormData({
        prefix: invoiceSettings.prefix,
        currencyId: invoiceSettings.currency.id,
        language: invoiceSettings.language,
        accountHolder: invoiceSettings.accountHolder,
        accountNumber: invoiceSettings.accountNumber || '',
        bankName: invoiceSettings.bankName || '',
        iban: invoiceSettings.iban || '',
        bic: invoiceSettings.bic || '',
        swift: invoiceSettings.swift || '',
        sortCode: invoiceSettings.sortCode || '',
        routingNumber: invoiceSettings.routingNumber || '',
        defaultNote: invoiceSettings.defaultNote || '',
      });
    }
  }, [invoiceSettings]);

  // Mutation for creating/updating invoice settings
  const saveInvoiceSettingsMutation = useMutation({
    mutationFn: (data: InvoiceSettingsInput) => {
      if (invoiceSettings) {
        return newApi.updateInvoiceSettings(data);
      }
      return newApi.createInvoiceSettings(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoiceSettings'] });
      showToast.success('Invoice settings saved successfully');
    },
    onError: (error: any) => {
      showToast.apiError(error, 'Failed to save invoice settings');
    },
  });

  const handleInvoiceSettingsSave = async () => {
    try {
      await saveInvoiceSettingsMutation.mutateAsync(invoiceFormData);
    } catch (error) {
      // Error is handled by onError callback
    }
  };

  return (
    <AppShell title={t('settings.title')}>
      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className={cn(styles.card)}>
              <div className={styles.cardHeader}>
                <h3 className="text-lg font-semibold text-slate-900">{t('settings.profile.title')}</h3>
              </div>
              <div className={styles.cardContent}>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('settings.profile.businessName')}</label>
                    <input
                      type="text"
                      className={cn(styles.input, 'mt-1.5')}
                      defaultValue={user?.businessName || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('clients.form.name')}</label>
                    <input
                      type="text"
                      className={cn(styles.input, 'mt-1.5')}
                      defaultValue={user?.name || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('settings.profile.email')}</label>
                    <input
                      type="email"
                      className={cn(styles.input, 'mt-1.5')}
                      defaultValue={user?.email || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('settings.profile.phone')}</label>
                    <input
                      type="tel"
                      className={cn(styles.input, 'mt-1.5')}
                      defaultValue={user?.phone || ''}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">{t('settings.profile.address')}</label>
                    <input
                      type="text"
                      className={cn(styles.input, 'mt-1.5')}
                      defaultValue={user?.address || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('settings.profile.taxId')}</label>
                    <input
                      type="text"
                      className={cn(styles.input, 'mt-1.5')}
                      defaultValue={user?.taxId || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('settings.profile.website')}</label>
                    <input
                      type="url"
                      className={cn(styles.input, 'mt-1.5')}
                      defaultValue={user?.website || ''}
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
                  <button className={buttonStyles('primary')}>
                    <Save className="h-4 w-4" />
                    {t('settings.profile.saveChanges')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* App Settings Tab */}
          {activeTab === 'app' && (
            <div className={cn(styles.card)}>
              <div className={styles.cardContent}>
                {/* Regional Settings */}
                <h3 className="text-lg font-semibold text-slate-900">{t('settings.appSettings.title')}</h3>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('settings.appSettings.language')}</label>
                    <select className={cn(styles.input, 'mt-1.5')}>
                      <option>English</option>
                      <option>German</option>
                      <option>French</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('settings.appSettings.currency')}</label>
                    <select className={cn(styles.input, 'mt-1.5')}>
                      <option>EUR - Euro</option>
                      <option>USD - US Dollar</option>
                      <option>GBP - British Pound</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('settings.appSettings.dateFormat')}</label>
                    <select className={cn(styles.input, 'mt-1.5')}>
                      <option>DD/MM/YYYY</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('settings.appSettings.timezone')}</label>
                    <select className={cn(styles.input, 'mt-1.5')}>
                      <option>London (GMT)</option>
                      <option>Berlin (CET)</option>
                      <option>New York (EST)</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
                  <button className={buttonStyles('primary')}>
                    <Check className="h-4 w-4" />
                    {t('settings.appSettings.saveSettings')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Settings Tab */}
          {activeTab === 'invoice' && (
            <>
              {isLoadingSettings ? (
                <div className={cn(styles.card)}>
                  <div className={styles.cardContent}>
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Bank Account Details */}
                  <div className={cn(styles.card)}>
                    <div className={styles.cardContent}>
                      <h3 className="text-lg font-semibold text-slate-900">{t('settings.invoiceSettings.bankDetails.title')}</h3>
                      <p className="mt-1 text-sm text-slate-500">{t('settings.invoiceSettings.bankDetails.description')}</p>
                      <div className="mt-6 grid gap-6 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">{t('settings.invoiceSettings.bankDetails.accountHolder')}</label>
                          <input
                            type="text"
                            className={cn(styles.input, 'mt-1.5')}
                            value={invoiceFormData.accountHolder}
                            onChange={(e) => setInvoiceFormData({ ...invoiceFormData, accountHolder: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">{t('settings.invoiceSettings.bankDetails.bankName')}</label>
                          <input
                            type="text"
                            className={cn(styles.input, 'mt-1.5')}
                            value={invoiceFormData.bankName}
                            onChange={(e) => setInvoiceFormData({ ...invoiceFormData, bankName: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">{t('settings.invoiceSettings.bankDetails.accountNumber')}</label>
                          <input
                            type="text"
                            className={cn(styles.input, 'mt-1.5')}
                            value={invoiceFormData.accountNumber}
                            onChange={(e) => setInvoiceFormData({ ...invoiceFormData, accountNumber: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">{t('settings.invoiceSettings.bankDetails.sortCode')}</label>
                          <input
                            type="text"
                            className={cn(styles.input, 'mt-1.5')}
                            value={invoiceFormData.sortCode}
                            onChange={(e) => setInvoiceFormData({ ...invoiceFormData, sortCode: e.target.value })}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700">{t('settings.invoiceSettings.bankDetails.iban')}</label>
                          <input
                            type="text"
                            className={cn(styles.input, 'mt-1.5')}
                            value={invoiceFormData.iban}
                            onChange={(e) => setInvoiceFormData({ ...invoiceFormData, iban: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">BIC</label>
                          <input
                            type="text"
                            className={cn(styles.input, 'mt-1.5')}
                            value={invoiceFormData.bic}
                            onChange={(e) => setInvoiceFormData({ ...invoiceFormData, bic: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">{t('settings.invoiceSettings.bankDetails.swift')}</label>
                          <input
                            type="text"
                            className={cn(styles.input, 'mt-1.5')}
                            value={invoiceFormData.swift}
                            onChange={(e) => setInvoiceFormData({ ...invoiceFormData, swift: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">{t('settings.invoiceSettings.bankDetails.routingNumber')}</label>
                          <input
                            type="text"
                            className={cn(styles.input, 'mt-1.5')}
                            value={invoiceFormData.routingNumber}
                            onChange={(e) => setInvoiceFormData({ ...invoiceFormData, routingNumber: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Defaults */}
                  <div className={cn(styles.card)}>
                    <div className={styles.cardContent}>
                      <h3 className="text-lg font-semibold text-slate-900">{t('settings.invoiceSettings.defaults.title')}</h3>
                      <div className="mt-6 grid gap-6 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Currency</label>
                          <select
                            className={cn(styles.input, 'mt-1.5')}
                            value={invoiceFormData.currencyId}
                            onChange={(e) => setInvoiceFormData({ ...invoiceFormData, currencyId: Number(e.target.value) })}
                          >
                            {currencies?.map((currency) => (
                              <option key={currency.id} value={currency.id}>
                                {currency.code} - {currency.name} ({currency.symbol})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Language</label>
                          <select
                            className={cn(styles.input, 'mt-1.5')}
                            value={invoiceFormData.language}
                            onChange={(e) => setInvoiceFormData({ ...invoiceFormData, language: e.target.value as 'en' | 'de' })}
                          >
                            <option value="en">English</option>
                            <option value="de">German</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">{t('settings.invoiceSettings.defaults.invoicePrefix')}</label>
                          <input
                            type="text"
                            className={cn(styles.input, 'mt-1.5')}
                            value={invoiceFormData.prefix}
                            onChange={(e) => setInvoiceFormData({ ...invoiceFormData, prefix: e.target.value })}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700">{t('settings.invoiceSettings.defaults.defaultNotes')}</label>
                          <textarea
                            className={cn(styles.input, 'mt-1.5 h-24 resize-none')}
                            value={invoiceFormData.defaultNote}
                            onChange={(e) => setInvoiceFormData({ ...invoiceFormData, defaultNote: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
                        <button
                          className={buttonStyles('primary')}
                          onClick={handleInvoiceSettingsSave}
                          disabled={saveInvoiceSettingsMutation.isPending}
                        >
                          {saveInvoiceSettingsMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              {t('settings.invoiceSettings.defaults.save')}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* VAT & Tax Tab */}
          {activeTab === 'vat' && (
            <>
              <div className={cn(styles.card)}>
                <div className={styles.cardContent}>
                  <h3 className="text-lg font-semibold text-slate-900">{t('settings.vatTax.title')}</h3>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">{t('settings.vatTax.registrationStatus')}</label>
                      <select className={cn(styles.input, 'mt-1.5')}>
                        <option>I am VAT registered</option>
                        <option>I am not VAT registered</option>
                        <option>Small business exemption (Kleinunternehmer)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">{t('settings.vatTax.vatNumber')}</label>
                      <input
                        type="text"
                        className={cn(styles.input, 'mt-1.5')}
                        defaultValue="DE123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">{t('settings.vatTax.declarationPeriod')}</label>
                      <select className={cn(styles.input, 'mt-1.5')}>
                        <option>Quarterly</option>
                        <option>Monthly</option>
                        <option>Yearly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">{t('settings.vatTax.scheme')}</label>
                      <select className={cn(styles.input, 'mt-1.5')}>
                        <option>Standard</option>
                        <option>Cash Accounting</option>
                        <option>Flat Rate</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
                    <button className={buttonStyles('primary')}>
                      <Check className="h-4 w-4" />
                      {t('settings.vatTax.saveSettings')}
                    </button>
                  </div>
                </div>
              </div>

              <div className={cn(styles.card)}>
                <div className={styles.cardContent}>
                  <h3 className="text-lg font-semibold text-slate-900">{t('settings.vatTax.elsterCertificate.title')}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {t('settings.vatTax.elsterCertificate.description')}
                  </p>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700">Certificate File</label>
                    <div className="mt-1.5 flex justify-center rounded-lg border-2 border-dashed border-slate-300 px-6 py-10">
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-slate-400" />
                        <p className="mt-2 text-sm text-slate-600">Click to upload or drag and drop</p>
                        <p className="mt-1 text-xs text-slate-500">.p12 or .pfx files only</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700">{t('settings.vatTax.elsterCertificate.password')}</label>
                    <input
                      type="password"
                      className={cn(styles.input, 'mt-1.5')}
                      placeholder="Enter certificate password"
                    />
                    <p className="mt-1.5 text-xs text-slate-500">The password for your Elster certificate file</p>
                  </div>
                  <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
                    <button className={buttonStyles('primary')}>
                      <Check className="h-4 w-4" />
                      {t('settings.vatTax.elsterCertificate.upload')}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className={cn(styles.card)}>
              <div className={styles.cardContent}>
                {/* Email Notifications */}
                <h3 className="text-lg font-semibold text-slate-900">{t('settings.notifications.email.title')}</h3>
                <div className="mt-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{t('settings.notifications.email.invoiceSent')}</p>
                      <p className="text-sm text-slate-500">Get notified when an invoice is sent to a client</p>
                    </div>
                    <Toggle
                      enabled={notifications.invoiceSent}
                      onChange={() => setNotifications(n => ({ ...n, invoiceSent: !n.invoiceSent }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{t('settings.notifications.email.invoicePaid')}</p>
                      <p className="text-sm text-slate-500">Get notified when an invoice is marked as paid</p>
                    </div>
                    <Toggle
                      enabled={notifications.invoicePaid}
                      onChange={() => setNotifications(n => ({ ...n, invoicePaid: !n.invoicePaid }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{t('settings.notifications.email.invoiceOverdue')}</p>
                      <p className="text-sm text-slate-500">Get notified when an invoice becomes overdue</p>
                    </div>
                    <Toggle
                      enabled={notifications.invoiceOverdue}
                      onChange={() => setNotifications(n => ({ ...n, invoiceOverdue: !n.invoiceOverdue }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{t('settings.notifications.email.newClient')}</p>
                      <p className="text-sm text-slate-500">Get notified when a new client is added</p>
                    </div>
                    <Toggle
                      enabled={notifications.newClient}
                      onChange={() => setNotifications(n => ({ ...n, newClient: !n.newClient }))}
                    />
                  </div>
                </div>

                {/* VAT & Tax Reminders */}
                <div className="mt-8 border-t border-slate-200 pt-8">
                  <h3 className="text-lg font-semibold text-slate-900">{t('settings.notifications.vatReminders.title')}</h3>
                  <div className="mt-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{t('settings.notifications.vatReminders.declarationDue')}</p>
                        <p className="text-sm text-slate-500">Remind me 7 days before VAT declaration is due</p>
                      </div>
                      <Toggle
                        enabled={notifications.vatDue}
                        onChange={() => setNotifications(n => ({ ...n, vatDue: !n.vatDue }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{t('settings.notifications.vatReminders.declarationSubmitted')}</p>
                        <p className="text-sm text-slate-500">Confirm when VAT declaration is successfully submitted</p>
                      </div>
                      <Toggle
                        enabled={notifications.vatSubmitted}
                        onChange={() => setNotifications(n => ({ ...n, vatSubmitted: !n.vatSubmitted }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{t('settings.notifications.vatReminders.taxYearEnd')}</p>
                        <p className="text-sm text-slate-500">Remind me 30 days before tax year end</p>
                      </div>
                      <Toggle
                        enabled={notifications.taxYearEnd}
                        onChange={() => setNotifications(n => ({ ...n, taxYearEnd: !n.taxYearEnd }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Transaction Alerts */}
                <div className="mt-8 border-t border-slate-200 pt-8">
                  <h3 className="text-lg font-semibold text-slate-900">{t('settings.notifications.transactionAlerts.title')}</h3>
                  <div className="mt-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{t('settings.notifications.transactionAlerts.largeExpense')}</p>
                        <p className="text-sm text-slate-500">Get notified for expenses over €1,000</p>
                      </div>
                      <Toggle
                        enabled={notifications.largeExpense}
                        onChange={() => setNotifications(n => ({ ...n, largeExpense: !n.largeExpense }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{t('settings.notifications.transactionAlerts.dailySummary')}</p>
                        <p className="text-sm text-slate-500">Receive a daily summary of all transactions</p>
                      </div>
                      <Toggle
                        enabled={notifications.dailySummary}
                        onChange={() => setNotifications(n => ({ ...n, dailySummary: !n.dailySummary }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{t('settings.notifications.transactionAlerts.weeklySummary')}</p>
                        <p className="text-sm text-slate-500">Receive a weekly summary of income and expenses</p>
                      </div>
                      <Toggle
                        enabled={notifications.weeklyReport}
                        onChange={() => setNotifications(n => ({ ...n, weeklyReport: !n.weeklyReport }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
                  <button className={buttonStyles('primary')}>
                    <Check className="h-4 w-4" />
                    {t('settings.notifications.savePreferences')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <>
              <div className={cn(styles.card)}>
                <div className={styles.cardContent}>
                  <h3 className="text-lg font-semibold text-slate-900">{t('settings.security.changePassword')}</h3>
                  <div className="mt-6 max-w-md space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">{t('settings.security.currentPassword')}</label>
                      <input type="password" className={cn(styles.input, 'mt-1.5')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">{t('settings.security.newPassword')}</label>
                      <input type="password" className={cn(styles.input, 'mt-1.5')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">{t('settings.security.confirmPassword')}</label>
                      <input type="password" className={cn(styles.input, 'mt-1.5')} />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
                    <button className={buttonStyles('primary')}>
                      <Check className="h-4 w-4" />
                      {t('settings.security.updatePassword')}
                    </button>
                  </div>
                </div>
              </div>

              <div className={cn(styles.card)}>
                <div className={styles.cardContent}>
                  <h3 className="text-lg font-semibold text-slate-900">{t('settings.security.twoFactor.title')}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {t('settings.security.twoFactor.description')}
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{t('settings.security.twoFactor.enable')}</p>
                      <p className="text-sm text-slate-500">Require authentication code in addition to password</p>
                    </div>
                    <Toggle
                      enabled={twoFactorEnabled}
                      onChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    />
                  </div>
                </div>
              </div>

              <div className={cn(styles.card)}>
                <div className={styles.cardContent}>
                  <h3 className="text-lg font-semibold text-slate-900">{t('settings.security.sessions.title')}</h3>
                  <p className="mt-1 text-sm text-slate-500">Manage your active sessions across different devices.</p>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                      <div>
                        <p className="font-medium text-slate-900">Chrome on macOS</p>
                        <p className="text-sm text-slate-500">London, UK · Last active now</p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                        {t('settings.security.sessions.current')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                      <div>
                        <p className="font-medium text-slate-900">Safari on iPhone</p>
                        <p className="text-sm text-slate-500">London, UK · Last active 2 hours ago</p>
                      </div>
                      <button className="text-sm font-medium text-red-600 hover:text-red-700">Revoke</button>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
                    <button className={buttonStyles('secondary')}>{t('settings.security.sessions.logoutAll')}</button>
                  </div>
                </div>
              </div>

              <div className={cn(styles.card)}>
                <div className={styles.cardContent}>
                  <h3 className="text-lg font-semibold text-slate-900">Account Management</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    For data export, account deletion, and privacy settings, please visit the{' '}
                    <button
                      onClick={() => setActiveTab('privacy')}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      {t('settings.tabs.privacy')}
                    </button>{' '}
                    tab.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Privacy & GDPR Tab */}
          {activeTab === 'privacy' && (
            <>
              {/* Compliance Status */}
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-900">GDPR/DSGVO Compliance Status</p>
                  <p className="text-sm text-emerald-700">Your account is configured to meet GDPR and DSGVO requirements</p>
                </div>
              </div>

              {/* Consent Management */}
              <div className={cn(styles.card)}>
                <div className={styles.cardContent}>
                  <h3 className="text-lg font-semibold text-slate-900">Consent Management</h3>
                  <p className="mt-1 text-sm text-slate-500">Manage your consent for data processing activities</p>
                  <div className="mt-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">Essential Data Processing</p>
                        <p className="text-sm text-slate-500">Required to provide core accounting services</p>
                      </div>
                      <Toggle enabled={privacy.essential} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">Analytics & Performance</p>
                        <p className="text-sm text-slate-500">Help us improve the application with usage data</p>
                      </div>
                      <Toggle
                        enabled={privacy.analytics}
                        onChange={() => setPrivacy(p => ({ ...p, analytics: !p.analytics }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">Marketing Communications</p>
                        <p className="text-sm text-slate-500">Receive product updates and feature announcements</p>
                      </div>
                      <Toggle
                        enabled={privacy.marketing}
                        onChange={() => setPrivacy(p => ({ ...p, marketing: !p.marketing }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">Third-Party Integrations</p>
                        <p className="text-sm text-slate-500">Allow data sharing with approved third-party services</p>
                      </div>
                      <Toggle
                        enabled={privacy.thirdParty}
                        onChange={() => setPrivacy(p => ({ ...p, thirdParty: !p.thirdParty }))}
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
                    <button className={buttonStyles('primary')}>
                      <Check className="h-4 w-4" />
                      Save Consent Preferences
                    </button>
                  </div>
                </div>
              </div>

              {/* Your Data Rights */}
              <div className={cn(styles.card)}>
                <div className={styles.cardContent}>
                  <h3 className="text-lg font-semibold text-slate-900">Your Data Rights (GDPR/DSGVO)</h3>
                  <p className="mt-1 text-sm text-slate-500">Exercise your rights under the General Data Protection Regulation</p>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                      <div className="flex items-center gap-3">
                        <Download className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="font-medium text-slate-900">Right to Data Portability</p>
                          <p className="text-sm text-slate-500">Download all your data in a machine-readable format</p>
                        </div>
                      </div>
                      <button className={buttonStyles('secondary')}>Request Export</button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                      <div className="flex items-center gap-3">
                        <Eye className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="font-medium text-slate-900">Right to Access</p>
                          <p className="text-sm text-slate-500">View all personal data we have stored about you</p>
                        </div>
                      </div>
                      <button className={buttonStyles('secondary')}>View Data</button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                      <div className="flex items-center gap-3">
                        <Edit className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="font-medium text-slate-900">Right to Rectification</p>
                          <p className="text-sm text-slate-500">Correct any inaccurate personal information</p>
                        </div>
                      </div>
                      <button className={buttonStyles('secondary')}>Update Info</button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 p-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <div>
                          <p className="font-medium text-slate-900">Right to Erasure (&quot;Right to be Forgotten&quot;)</p>
                          <p className="text-sm text-slate-500">Request permanent deletion of all your personal data</p>
                        </div>
                      </div>
                      <button className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                        Request Deletion
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Retention & Processing */}
              <div className={cn(styles.card)}>
                <div className={styles.cardContent}>
                  <h3 className="text-lg font-semibold text-slate-900">Data Retention & Processing</h3>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Data Retention Period</label>
                      <select className={cn(styles.input, 'mt-1.5')}>
                        <option>10 years (recommended for tax)</option>
                        <option>7 years</option>
                        <option>5 years</option>
                      </select>
                      <p className="mt-1.5 text-xs text-slate-500">Note: German tax law requires 10 years retention for accounting records</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Data Processing Location</label>
                      <select className={cn(styles.input, 'mt-1.5')}>
                        <option>European Union Only</option>
                        <option>Global (GDPR compliant)</option>
                      </select>
                      <p className="mt-1.5 text-xs text-slate-500">Your data will only be processed in these locations</p>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-slate-200 pt-8">
                    <h4 className="font-semibold text-slate-900">Client Data Processing</h4>
                    <p className="mt-1 text-sm text-slate-500">As you process client data in this application, you act as a data controller under GDPR</p>
                    <div className="mt-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">Automatic Client Consent Tracking</p>
                          <p className="text-sm text-slate-500">Track GDPR consent for client data processing</p>
                        </div>
                        <Toggle
                          enabled={privacy.clientConsent}
                          onChange={() => setPrivacy(p => ({ ...p, clientConsent: !p.clientConsent }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">Client Data Deletion Requests</p>
                          <p className="text-sm text-slate-500">Enable clients to request data deletion</p>
                        </div>
                        <Toggle
                          enabled={privacy.clientDeletion}
                          onChange={() => setPrivacy(p => ({ ...p, clientDeletion: !p.clientDeletion }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
                    <button className={buttonStyles('primary')}>
                      <Check className="h-4 w-4" />
                      Save Retention Settings
                    </button>
                  </div>
                </div>
              </div>

              {/* Legal Documents */}
              <div className={cn(styles.card)}>
                <div className={styles.cardContent}>
                  <h3 className="text-lg font-semibold text-slate-900">Legal Documents & Compliance</h3>
                  <div className="mt-6 space-y-4">
                    {[
                      { name: 'Privacy Policy', date: 'January 1, 2026', action: 'view' },
                      { name: 'Terms of Service', date: 'January 1, 2026', action: 'view' },
                      { name: 'Data Processing Agreement (DPA)', desc: 'GDPR Article 28 compliant', action: 'download' },
                      { name: 'Impressum (German Legal Notice)', desc: 'Required for German businesses', action: 'view' },
                      { name: 'Cookie Policy', desc: 'GDPR compliant cookie usage', action: 'view' },
                    ].map((doc) => (
                      <div key={doc.name} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-900">{doc.name}</p>
                            <p className="text-sm text-slate-500">{doc.date ? `Last updated: ${doc.date}` : doc.desc}</p>
                          </div>
                        </div>
                        {doc.action === 'view' ? (
                          <Eye className="h-5 w-5 cursor-pointer text-slate-400 hover:text-slate-600" />
                        ) : (
                          <Download className="h-5 w-5 cursor-pointer text-slate-400 hover:text-slate-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data Protection Officer */}
              <div className={cn(styles.card)}>
                <div className={styles.cardContent}>
                  <h3 className="text-lg font-semibold text-slate-900">Data Protection Officer (DPO)</h3>
                  <p className="mt-1 text-sm text-slate-500">Contact information for data protection inquiries</p>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">DPO Name</label>
                      <input
                        type="text"
                        className={cn(styles.input, 'mt-1.5')}
                        defaultValue="Dr. Maria Schmidt"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">DPO Email</label>
                      <input
                        type="email"
                        className={cn(styles.input, 'mt-1.5')}
                        defaultValue="dpo@solobooks.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700">DPO Address</label>
                      <input
                        type="text"
                        className={cn(styles.input, 'mt-1.5')}
                        defaultValue="123 Data Protection Street, Berlin, Germany"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
                    <button className={buttonStyles('primary')}>
                      <Check className="h-4 w-4" />
                      Save DPO Information
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Breach Notification */}
              <div className={cn(styles.card)}>
                <div className={styles.cardContent}>
                  <h3 className="text-lg font-semibold text-slate-900">Data Breach Notification</h3>
                  <p className="mt-1 text-sm text-slate-500">Configure how you want to be notified in case of a data breach (GDPR Article 33)</p>
                  <div className="mt-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">Email Notification</p>
                        <p className="text-sm text-slate-500">Receive immediate email alerts</p>
                      </div>
                      <Toggle
                        enabled={privacy.emailBreach}
                        onChange={() => setPrivacy(p => ({ ...p, emailBreach: !p.emailBreach }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">SMS Notification</p>
                        <p className="text-sm text-slate-500">Receive SMS alerts for critical breaches</p>
                      </div>
                      <Toggle
                        enabled={privacy.smsBreach}
                        onChange={() => setPrivacy(p => ({ ...p, smsBreach: !p.smsBreach }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Emergency Contact</label>
                      <input
                        type="email"
                        className={cn(styles.input, 'mt-1.5')}
                        defaultValue="emergency@yourcompany.com"
                      />
                      <p className="mt-1.5 text-xs text-slate-500">Secondary contact for data breach notifications</p>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
                    <button className={buttonStyles('primary')}>
                      <Check className="h-4 w-4" />
                      Save Notification Preferences
                    </button>
                  </div>
                </div>
              </div>

              {/* Privacy Audit Log */}
              <div className={cn(styles.card)}>
                <div className={styles.cardContent}>
                  <h3 className="text-lg font-semibold text-slate-900">Privacy Audit Log</h3>
                  <p className="mt-1 text-sm text-slate-500">Track all privacy-related activities for GDPR compliance</p>
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Last data export:</span>
                      <span className="text-sm font-medium text-slate-900">December 15, 2025</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Last consent update:</span>
                      <span className="text-sm font-medium text-slate-900">January 1, 2026</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Privacy policy acceptance:</span>
                      <span className="text-sm font-medium text-slate-900">November 10, 2025</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button className={buttonStyles('secondary')}>
                      <Download className="h-4 w-4" />
                      Download Full Audit Log
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
