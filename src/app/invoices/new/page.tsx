'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Check } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { cn } from '@/lib/utils';
import { styles, buttonStyles } from '@/lib/styles';

interface LineItem {
  id: string;
  description: string;
  price: number;
  unit: string;
  quantity: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', price: 0, unit: 'pc', quantity: 1 },
  ]);

  const [formData, setFormData] = useState({
    category: '',
    clientId: '',
    currency: 'EUR',
    language: 'English',
    invoiceDate: '',
    dueDate: '',
  });

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now().toString(), description: '', price: 0, unit: 'pc', quantity: 1 },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(
      lineItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  return (
    <AppShell title="New Invoice">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-xl font-semibold text-slate-900">New Invoice</span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Invoice Details */}
          <div className={cn(styles.card)}>
            <div className={styles.cardContent}>
              <h3 className="text-lg font-semibold text-slate-900">Invoice Details</h3>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Category</label>
                  <select
                    className={cn(styles.input, 'mt-1.5')}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Please select</option>
                    <option value="consulting">Consulting</option>
                    <option value="development">Development</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Client</label>
                  <select
                    className={cn(styles.input, 'mt-1.5')}
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  >
                    <option value="">Select client</option>
                    <option value="1">Braun and Sons</option>
                    <option value="2">Green Tech Solutions</option>
                    <option value="3">Digital Innovations AG</option>
                    <option value="4">Acme Corporation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Currency</label>
                  <select
                    className={cn(styles.input, 'mt-1.5')}
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Language</label>
                  <select
                    className={cn(styles.input, 'mt-1.5')}
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  >
                    <option value="English">English</option>
                    <option value="German">German</option>
                    <option value="French">French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Invoice Date</label>
                  <input
                    type="date"
                    className={cn(styles.input, 'mt-1.5')}
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Due Date</label>
                  <input
                    type="date"
                    className={cn(styles.input, 'mt-1.5')}
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className={cn(styles.card)}>
            <div className={styles.cardContent}>
              <h3 className="text-lg font-semibold text-slate-900">Line Items</h3>
              <div className="mt-6">
                {/* Header */}
                <div className="mb-4 grid grid-cols-12 gap-4 text-sm font-medium text-slate-600">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2">Price</div>
                  <div className="col-span-2">Unit</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  {lineItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4">
                      <div className="col-span-5">
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          className={styles.input}
                          placeholder="0.00"
                          value={item.price || ''}
                          onChange={(e) => updateLineItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          className={styles.input}
                          value={item.unit}
                          onChange={(e) => updateLineItem(item.id, 'unit', e.target.value)}
                        >
                          <option value="pc">pc</option>
                          <option value="hr">hr</option>
                          <option value="day">day</option>
                          <option value="month">month</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          className={styles.input}
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <button
                          onClick={() => removeLineItem(item.id)}
                          className="rounded p-2 text-red-500 hover:bg-red-50"
                          disabled={lineItems.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Line Item Button */}
                <button
                  onClick={addLineItem}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 py-3 text-sm font-medium text-slate-600 hover:border-slate-400 hover:text-slate-700"
                >
                  <Plus className="h-4 w-4" />
                  Add line item
                </button>
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
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium text-slate-900">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="text-lg font-semibold text-slate-900">€{total.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <button className={cn(buttonStyles('primary'), 'w-full justify-center')}>
                  <Check className="h-4 w-4" />
                  Save Invoice
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
