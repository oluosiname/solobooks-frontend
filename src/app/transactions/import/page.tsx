'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FileText, FileSpreadsheet, Download, Check } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { cn } from '@/lib/utils';
import { styles, buttonStyles } from '@/lib/styles';

export default function ImportTransactionsPage() {
  const router = useRouter();

  return (
    <AppShell title="Import Transactions">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Import Transactions</h1>
        <button
          onClick={() => router.push('/transactions')}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Transactions
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <div className={cn(styles.card)}>
          <div className={styles.cardContent}>
            <h3 className="text-lg font-semibold text-slate-900">Upload Your File</h3>
            <div className="mt-6">
              <div className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-6 py-16 hover:border-slate-400">
                <Upload className="h-12 w-12 text-slate-400" />
                <p className="mt-4 text-sm text-slate-600">Click to upload or drag and drop</p>
                <p className="mt-1 text-xs text-slate-500">Supported formats: csv, xls, xlsx</p>
              </div>
              <button className={cn(buttonStyles('primary'), 'mt-6 w-full justify-center')}>
                <Check className="h-4 w-4" />
                Import Transactions
              </button>
            </div>
          </div>
        </div>

        {/* Download Templates Section */}
        <div className={cn(styles.card)}>
          <div className={styles.cardContent}>
            <h3 className="text-lg font-semibold text-slate-900">Download Templates</h3>
            <p className="mt-2 text-sm text-slate-500">
              Use our pre-formatted templates to ensure your data imports correctly. Choose the format that works best for you.
            </p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <FileText className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">CSV Template</p>
                    <p className="text-sm text-slate-500">Simple text format, compatible with most spreadsheet software</p>
                  </div>
                </div>
                <button className="rounded-lg p-2 hover:bg-slate-100">
                  <Download className="h-5 w-5 text-slate-600" />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Excel Template</p>
                    <p className="text-sm text-slate-500">Native Excel format with data validation</p>
                  </div>
                </div>
                <button className="rounded-lg p-2 hover:bg-slate-100">
                  <Download className="h-5 w-5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className={cn(styles.card, 'mt-6')}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">How It Works</h3>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
                1
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Download a Template</h4>
                <p className="mt-1 text-sm text-slate-500">
                  Start by downloading either a CSV or Excel template that matches our required format.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
                2
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Fill in Your Data</h4>
                <p className="mt-1 text-sm text-slate-500">
                  Add your transactions to the template. Use negative amounts for expenses and positive for income.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
                3
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Upload and Import</h4>
                <p className="mt-1 text-sm text-slate-500">
                  Upload your completed file and we&apos;ll import your transactions automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Format */}
      <div className={cn(styles.card, 'mt-6')}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">File Format</h3>
          <p className="mt-2 text-sm text-slate-500">Your import file must include the following columns:</p>
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Column
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Format
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">date</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">YYYY-MM-DD</td>
                  <td className="px-6 py-4 text-sm text-slate-600">Transaction date in YYYY-MM-DD format</td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">description</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">Text</td>
                  <td className="px-6 py-4 text-sm text-slate-600">Brief description of the transaction</td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">amount</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">-0.00</td>
                  <td className="px-6 py-4 text-sm text-slate-600">Transaction amount (negative for expenses, positive for income)</td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">vat_rate</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">0, 7, 19</td>
                  <td className="px-6 py-4 text-sm text-slate-600">VAT rate applicable to this transaction</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
