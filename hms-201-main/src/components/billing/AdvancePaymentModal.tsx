import React, { useState } from 'react';
import { X, DollarSign, CreditCard, Building, CheckCircle2, AlertCircle } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { AdvancePayment } from '../../types';
import { PatientLookup } from './PatientLookup';

interface AdvancePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentCreated?: (payment: AdvancePayment) => void;
}

export const AdvancePaymentModal: React.FC<AdvancePaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentCreated,
}) => {
  const { patients, receptionTokens, addAdvancePayment, currentUser } = useHospital();

  const [patientId, setPatientId] = useState('');
  const [amount, setAmount] = useState('500.00');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Credit/Debit Card' | 'Wire Transfer'>('Credit/Debit Card');
  const [terminalId, setTerminalId] = useState('POS-TERM-01 (Verifone)');
  const [purpose, setPurpose] = useState<'Inpatient Bed Admission' | 'OT / Surgical Deposit' | 'OPD Retainer' | 'Emergency Deposit' | 'Diagnostic Workup'>('Inpatient Bed Admission');
  const [notes, setNotes] = useState('Pre-admission financial deposit deposit retainer.');
  const [cashierName, setCashierName] = useState(currentUser?.name || 'Chloe Bennett (Reception Desk A)');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) setPatientId('');
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedPatient = patients.find((p) => p.id === patientId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid deposit amount greater than $0.');
      return;
    }

    if (!selectedPatient) {
      setError('Please select a valid patient.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newPayment = addAdvancePayment({
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      patientMrn: selectedPatient.id,
      amount: parsedAmount,
      paymentMethod,
      date: today,
      time,
      purpose,
      remainingBalance: parsedAmount,
      status: 'Active',
      cashierName,
      terminalId: paymentMethod === 'Credit/Debit Card' ? terminalId : undefined,
      notes,
    });

    if (onPaymentCreated) {
      onPaymentCreated(newPayment);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Collect Advance Payment Deposit</h3>
              <p className="text-[11px] text-slate-300">Issue official advance deposit receipt & allocate balance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Patient Selection */}
          <PatientLookup
            patients={patients}
            tokens={receptionTokens}
            selectedPatientId={patientId}
            onSelect={setPatientId}
            accent="emerald"
          />

          {/* Amount & Purpose */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Advance Amount ($ USD)</label>
              <div className="relative">
                <span className="text-slate-400 font-bold absolute left-3 top-2">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Deposit Purpose</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Inpatient Bed Admission">Inpatient Bed Admission</option>
                <option value="OT / Surgical Deposit">OT / Surgical Deposit</option>
                <option value="OPD Retainer">OPD Retainer</option>
                <option value="Emergency Deposit">Emergency Deposit</option>
                <option value="Diagnostic Workup">Diagnostic Workup</option>
              </select>
            </div>
          </div>

          {/* Payment Method & Terminal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Credit/Debit Card">Credit/Debit Card (POS)</option>
                <option value="Cash">Cash (Front Desk Drawer)</option>
                <option value="Wire Transfer">Wire / Online Transfer</option>
              </select>
            </div>

            {paymentMethod === 'Credit/Debit Card' ? (
              <div>
                <label className="block font-bold text-slate-700 mb-1">POS Terminal</label>
                <select
                  value={terminalId}
                  onChange={(e) => setTerminalId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="POS-TERM-01 (Verifone)">Desk A - Verifone V200c</option>
                  <option value="POS-TERM-02 (Ingenico)">Desk B - Ingenico Move5000</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cash Register Drawer</label>
                <input
                  type="text"
                  readOnly
                  value="Desk A Main Drawer (USD Cash)"
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 font-medium"
                />
              </div>
            )}
          </div>

          {/* Cashier & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Collecting Cashier</label>
              <input
                type="text"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Notes / Reference</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional pre-auth or admitting doctor remarks..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
          </div>

          {/* Info Callout */}
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-tight">
              An official advance receipt with a unique receipt number will be generated. The remaining balance can be adjusted against future hospital invoices or refunded.
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Issue Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
