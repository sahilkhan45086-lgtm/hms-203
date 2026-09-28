import React, { useState } from 'react';
import { X, RotateCcw, AlertTriangle, CheckCircle2, User, FileText } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { RefundPayment } from '../../types';

interface RefundPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefundCreated?: (refund: RefundPayment) => void;
}

export const RefundPaymentModal: React.FC<RefundPaymentModalProps> = ({
  isOpen,
  onClose,
  onRefundCreated,
}) => {
  const { patients, advancePayments, invoices, addRefundPayment, currentUser } = useHospital();

  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [refundSource, setRefundSource] = useState<'Advance Deposit' | 'Invoice Overpayment' | 'Service Cancellation'>('Advance Deposit');
  const [selectedAdvanceId, setSelectedAdvanceId] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [amount, setAmount] = useState('100.00');
  const [refundMethod, setRefundMethod] = useState<'Cash' | 'Credit/Debit Card Reversal' | 'Original Method'>('Cash');
  const [reason, setReason] = useState<'Procedure Cancelled' | 'Overpayment' | 'Discharge Deposit Refund' | 'Physician Non-Availability' | 'Billing Adjustment'>('Procedure Cancelled');
  const [authorizedBy, setAuthorizedBy] = useState('Robert Stirling (Finance Lead)');
  const [cashierName, setCashierName] = useState(currentUser?.name || 'Chloe Bennett (Reception Desk A)');
  const [notes, setNotes] = useState('Patient requested elective procedure cancellation 24h prior.');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const selectedPatient = patients.find((p) => p.id === patientId) || patients[0];
  const patientAdvances = advancePayments.filter((a) => a.patientId === selectedPatient?.id && a.remainingBalance > 0);
  const patientInvoices = invoices.filter((i) => i.patientId === selectedPatient?.id && (i.amountPaid || 0) > 0);

  const activeAdvance = patientAdvances.find((a) => a.id === selectedAdvanceId) || patientAdvances[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid refund amount greater than $0.');
      return;
    }

    if (!selectedPatient) {
      setError('Please select a valid patient.');
      return;
    }

    if (refundSource === 'Advance Deposit') {
      if (!activeAdvance) {
        setError('No active advance deposit with remaining balance found for this patient.');
        return;
      }
      if (parsedAmount > activeAdvance.remainingBalance) {
        setError(`Refund amount cannot exceed remaining deposit balance of $${activeAdvance.remainingBalance.toFixed(2)}.`);
        return;
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const refId =
      refundSource === 'Advance Deposit'
        ? activeAdvance?.receiptNumber || activeAdvance?.id || 'ADV-REF'
        : selectedInvoiceId || 'INV-REF';

    const newRefund = addRefundPayment({
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      originalReferenceType: refundSource,
      originalReferenceId: refId,
      amount: parsedAmount,
      refundMethod,
      reason,
      date: today,
      time,
      authorizedBy,
      cashierName,
      status: 'Completed',
      notes,
    });

    if (onRefundCreated) {
      onRefundCreated(newRefund);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Process Patient Refund Voucher</h3>
              <p className="text-[11px] text-slate-300">Issue official reimbursement voucher & rebalance ledger</p>
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
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Patient Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Patient</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-rose-500/20"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} (MRN: {p.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Refund Source & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Refund Source</label>
              <select
                value={refundSource}
                onChange={(e) => setRefundSource(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
              >
                <option value="Advance Deposit">Advance Deposit Balance</option>
                <option value="Invoice Overpayment">Invoice Overpayment</option>
                <option value="Service Cancellation">Service Cancellation</option>
              </select>
            </div>

            {refundSource === 'Advance Deposit' ? (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Advance Receipt</label>
                {patientAdvances.length > 0 ? (
                  <select
                    value={selectedAdvanceId || activeAdvance?.id}
                    onChange={(e) => {
                      setSelectedAdvanceId(e.target.value);
                      const adv = patientAdvances.find((a) => a.id === e.target.value);
                      if (adv) setAmount(adv.remainingBalance.toFixed(2));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                  >
                    {patientAdvances.map((adv) => (
                      <option key={adv.id} value={adv.id}>
                        {adv.receiptNumber} (${adv.remainingBalance.toFixed(2)} avail)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                    No active advance with remaining funds found.
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Linked Invoice Number</label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => setSelectedInvoiceId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                >
                  <option value="">Select Invoice...</option>
                  {patientInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.id} (Paid: ${(inv.amountPaid || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Amount & Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Refund Amount ($ USD)</label>
              <div className="relative">
                <span className="text-slate-400 font-bold absolute left-3 top-2">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-rose-500/20"
                  required
                />
              </div>
              {refundSource === 'Advance Deposit' && activeAdvance && (
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Max refundable: ${activeAdvance.remainingBalance.toFixed(2)}
                </span>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Disbursement Method</label>
              <select
                value={refundMethod}
                onChange={(e) => setRefundMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="Cash">Cash (Disbursed from Front Desk)</option>
                <option value="Credit/Debit Card Reversal">Card Terminal Reversal</option>
                <option value="Original Method">Original Payment Method</option>
              </select>
            </div>
          </div>

          {/* Reason & Authorization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Reason for Refund</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
              >
                <option value="Procedure Cancelled">Procedure Cancelled</option>
                <option value="Overpayment">Overpayment / Double Charge</option>
                <option value="Discharge Deposit Refund">Discharge Deposit Balance Refund</option>
                <option value="Physician Non-Availability">Physician Non-Availability</option>
                <option value="Billing Adjustment">Billing Adjustment</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Authorized By (Manager/Finance)</label>
              <input
                type="text"
                value={authorizedBy}
                onChange={(e) => setAuthorizedBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Audit Justification & Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Clinical reason, cancellation approval details..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
            />
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
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Authorize & Disburse Refund</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
