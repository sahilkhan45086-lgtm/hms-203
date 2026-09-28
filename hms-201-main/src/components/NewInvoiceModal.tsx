import React, { useState, useEffect } from 'react';
import { X, ReceiptText, Plus, Trash2, DollarSign, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { BillItem } from '../types';

interface NewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewInvoiceModal: React.FC<NewInvoiceModalProps> = ({ isOpen, onClose }) => {
  const { patients, createInvoice, addNotification } = useHospital();

  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [items, setItems] = useState<BillItem[]>([
    {
      id: 'ITM-01',
      description: 'Consultation — Attending Physician Clinical Review',
      category: 'Consultation',
      unitCost: 150.0,
      quantity: 1,
      amount: 150.0,
      totalPrice: 150.0,
    },
  ]);
  const [insuranceCovered, setInsuranceCovered] = useState(120.0);
  const [itemDesc, setItemDesc] = useState('');
  const [itemCategory, setItemCategory] = useState<BillItem['category']>('Consultation');
  const [itemPrice, setItemPrice] = useState(75.0);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!itemDesc.trim()) return;
    const price = Number(itemPrice) || 0;
    const newItem: BillItem = {
      id: `ITM-${Date.now()}`,
      description: itemDesc.trim(),
      category: itemCategory,
      unitCost: price,
      quantity: 1,
      amount: price,
      totalPrice: price,
    };
    setItems([...items, newItem]);
    setItemDesc('');
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount ?? item.totalPrice) || 0), 0);
  const balanceDue = Math.max(0, totalAmount - (Number(insuranceCovered) || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPatient = patients.find((p) => p.id === patientId);
    if (!selectedPatient) return;

    createInvoice({
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      patientPhone: selectedPatient.phone,
      patientEmail: selectedPatient.email,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: balanceDue === 0 ? 'Paid' : 'Pending',
      items,
      insuranceCoveredAmount: insuranceCovered,
      copayAmount: 25,
      tax: 0,
    });

    addNotification(
      'Invoice Generated',
      `Invoice created for ${selectedPatient.firstName} ${selectedPatient.lastName} ($${balanceDue.toFixed(2)} due).`,
      'success',
      selectedPatient.id
    );

    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Classification Badge */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600/30 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
              <ReceiptText className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800">
                  Billing & Claims
                </span>
              </div>
              <h2 className="font-bold text-sm text-white mt-0.5">Generate Patient Invoice</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Classification Section 1: Patient Selection */}
          <div className="space-y-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              1. Patient & Insurance Profile
            </span>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} (MRN: {p.id}) · {p.insurance?.provider || 'Self-Pay'} ({p.status})
                </option>
              ))}
            </select>
          </div>

          {/* Classification Section 2: Itemized Line Charges */}
          <div className="space-y-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                2. Itemized Charges ({items.length})
              </span>
              <span className="text-xs font-mono font-bold text-slate-700">
                Subtotal: ${totalAmount.toFixed(2)}
              </span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto divide-y divide-slate-100 bg-white p-2.5 rounded-lg border border-slate-200">
              {items.map((it) => (
                <div key={it.id} className="pt-1.5 first:pt-0 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="font-medium text-slate-800 block truncate">{it.description}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-mono">{it.category}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-slate-900">
                      ${(Number(it.totalPrice ?? it.amount) || 0).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(it.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer transition"
                      title="Remove charge item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Item form */}
            <div className="p-2 bg-white border border-slate-200 rounded-lg flex flex-wrap gap-2 items-center">
              <input
                type="text"
                placeholder="Description (e.g. ECG 12-Lead, Blood Panel)"
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
                className="flex-1 min-w-[140px] bg-slate-50 border border-slate-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
              />
              <select
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded p-1.5 text-xs outline-none"
              >
                <option value="Consultation">Consult</option>
                <option value="Lab">Lab</option>
                <option value="Ward">Ward</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Procedure">Procedure</option>
              </select>
              <input
                type="number"
                placeholder="Price"
                value={itemPrice}
                onChange={(e) => setItemPrice(Number(e.target.value))}
                className="w-20 bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-mono outline-none"
              />
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1 transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Classification Section 3: Financial Settlement & Due Amount */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl items-center">
            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                Insurance Adjudication ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={insuranceCovered}
                onChange={(e) => setInsuranceCovered(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 text-right">
              <span className="text-[10px] text-blue-700 uppercase font-semibold block tracking-wider">
                Patient Balance Due
              </span>
              <span className="text-lg font-bold font-mono text-blue-900">
                ${(Number(balanceDue) || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Issue Hospital Invoice</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

