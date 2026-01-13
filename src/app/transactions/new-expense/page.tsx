'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Check } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { cn } from '@/lib/utils';
import { styles, buttonStyles } from '@/lib/styles';

export default function NewExpensePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    type: 'Expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    notes: '',
  });
  const [hasReceipt, setHasReceipt] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <AppShell title="New Expense">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-xl font-semibold text-slate-900">New Expense</span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className={cn(styles.card)}>
            <div className={styles.cardContent}>
              <h3 className="text-lg font-semibold text-slate-900">Transaction Information</h3>

              <div className="mt-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Type</label>
                    <select
                      className={cn(styles.input, 'mt-1.5')}
                      value={formData.type}
                      disabled
                    >
                      <option value="Expense">Expense</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Category</label>
                    <select
                      className={cn(styles.input, 'mt-1.5')}
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                    >
                      <option value="">Select category</option>
                      <option value="office">Office</option>
                      <option value="software">Software</option>
                      <option value="marketing">Marketing</option>
                      <option value="travel">Travel</option>
                      <option value="equipment">Equipment</option>
                      <option value="utilities">Utilities</option>
                      <option value="professional">Professional Services</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Date</label>
                    <input
                      type="date"
                      className={cn(styles.input, 'mt-1.5')}
                      value={formData.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Amount (€)</label>
                    <input
                      type="number"
                      className={cn(styles.input, 'mt-1.5')}
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => handleChange('amount', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    className={cn(styles.input, 'mt-1.5 h-24 resize-none')}
                    placeholder="Enter transaction description..."
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Receipt / Attachment</label>
                  <div
                    className="mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-6 py-10 hover:border-slate-400"
                    onClick={() => setHasReceipt(true)}
                  >
                    <Upload className="h-8 w-8 text-slate-400" />
                    <p className="mt-2 text-sm text-slate-600">Click to upload or drag and drop</p>
                    <p className="mt-1 text-xs text-slate-500">PDF, PNG, JPG up to 10MB</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Notes (Optional)</label>
                  <textarea
                    className={cn(styles.input, 'mt-1.5 h-20 resize-none')}
                    placeholder="Add any additional notes..."
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className={cn(styles.card, 'sticky top-6')}>
            <div className={styles.cardContent}>
              <h3 className="text-lg font-semibold text-slate-900">Summary</h3>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Transaction Type</span>
                  <span className="font-medium text-red-600">Expense</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Date</span>
                  <span className="font-medium text-slate-900">{formData.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Status</span>
                  <span className="font-medium text-slate-900">{hasReceipt ? 'Receipt Attached' : 'No Receipt'}</span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <button className={cn(buttonStyles('primary'), 'w-full justify-center')}>
                  <Check className="h-4 w-4" />
                  Save Transaction
                </button>
                <button
                  onClick={() => router.back()}
                  className={cn(buttonStyles('secondary'), 'w-full justify-center')}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
