import React, { useState } from 'react';
import { X, Printer, ReceiptText, Search, CheckCircle2, ShieldCheck, Building2, User } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Invoice } from '../../types';
import { sumInvoiceItemField } from '../../utils/insuranceInvoice';

interface ReprintInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialInvoiceId?: string;
}

export const ReprintInvoiceModal: React.FC<ReprintInvoiceModalProps> = ({
  isOpen,
  onClose,
  initialInvoiceId,
}) => {
  const { invoices } = useHospital();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(initialInvoiceId || invoices[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const currentInvoice = invoices.find((inv) => inv.id === selectedInvoiceId) || invoices[0];

  const filteredInvoices = invoices.filter((inv) =>
    inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  const totalAmount = Number(currentInvoice?.totalAmount ?? currentInvoice?.subtotal ?? 0);
  const grossAmount = Number(currentInvoice?.subtotal ?? totalAmount);
  const insuranceCovered = Number(currentInvoice?.insuranceCoveredAmount ?? currentInvoice?.insuranceCovered ?? 0);
  const paidAmount = Number(currentInvoice?.amountPaid ?? 0);
  const balanceDue = Number(currentInvoice?.balanceDue ?? 0);
  const invoiceItems = currentInvoice?.items || [];
  const hasInsuranceBreakdown = invoiceItems.some((item) => item.insuranceAmount !== undefined);
  const discountTotal = hasInsuranceBreakdown ? sumInvoiceItemField(invoiceItems, 'discountAmount') : 0;
  const netAmount = hasInsuranceBreakdown ? sumInvoiceItemField(invoiceItems, 'netAmount') : totalAmount;
  const deductibleTotal = Number(currentInvoice?.deductibleAmount) ||
    (hasInsuranceBreakdown ? sumInvoiceItemField(invoiceItems, 'deductibleAmount') : 0);
  const copayTotal = Number(currentInvoice?.copayAmount) ||
    (hasInsuranceBreakdown ? sumInvoiceItemField(invoiceItems, 'copayAmount') : 0);
  const patientResponsibility = Number(currentInvoice?.patientPayable ?? (deductibleTotal + copayTotal || totalAmount - insuranceCovered));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Reprint Patient Hospital Invoice</h3>
              <p className="text-[11px] text-slate-300">Official tax invoice print preview and billing verification</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Selector Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-bold text-slate-700 whitespace-nowrap">Select Invoice:</span>
            <select
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono font-medium max-w-xs"
            >
              {filteredInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.id} — {inv.patientName} (AED {(inv.totalAmount || inv.subtotal).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search invoice or patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Invoice Printable View */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-slate-100 flex-1 flex justify-center">
          {currentInvoice ? (
            <div className="invoice-print bg-white border border-slate-200 rounded-xl shadow-md p-6 sm:p-8 w-full max-w-5xl text-slate-800 font-sans print:border-none print:shadow-none print:p-0">
              <style>{`@media print {
                @page { size: A4 landscape; margin: 10mm; }
                body * { visibility: hidden !important; }
                .invoice-print, .invoice-print * { visibility: visible !important; }
                .invoice-print { position: absolute !important; inset: 0 !important; width: 100% !important; max-width: none !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; padding: 0 !important; }
                .invoice-print table { font-size: 8pt !important; }
                .invoice-print th, .invoice-print td { padding: 4px !important; }
              }`}</style>
              {/* Official Hospital Header */}
              <div className="border-b-2 border-slate-900 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <svg className="h-9 w-9 shrink-0" viewBox="0 0 32 32" role="img" aria-label="MedCore logo">
                      <rect width="32" height="32" rx="8" fill="#0f766e" />
                      <path d="M13 5h6v8h8v6h-8v8h-6v-8H5v-6h8z" fill="#fff" />
                    </svg>
                    <div>
                      <h1 className="text-base font-black tracking-tight text-slate-900 uppercase">MEDCORE OS</h1>
                      <p className="text-[11px] font-semibold text-slate-600">Apex Health Systems &amp; Clinical Care</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Patient Financial Services · Medical billing statement
                  </p>
                </div>

                <div className="sm:text-right">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                    OFFICIAL MEDICAL INVOICE
                  </div>
                  <div className="text-base font-mono font-bold text-slate-900">{currentInvoice.id}</div>
                  <div className="text-[10px] text-slate-500">Date: {currentInvoice.issueDate}</div>
                  <div className="text-[10px] text-slate-500">Due Date: {currentInvoice.dueDate}</div>
                  {currentInvoice.invoiceTime && <div className="text-[10px] text-slate-500">Time: {currentInvoice.invoiceTime}</div>}
                </div>
              </div>

              {/* Patient & Billing Info */}
              <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-200 text-xs mb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Billed To Patient:</span>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{currentInvoice.patientName}</div>
                  <div className="text-[11px] font-mono text-slate-600">MRN: {currentInvoice.patientId}</div>
                  <div className="text-[11px] text-slate-500">Encounter: {currentInvoice.encounterType || 'Outpatient'}</div>
                  {currentInvoice.insuranceProvider && <div className="text-[11px] text-slate-500">Payer: {currentInvoice.insuranceProvider}</div>}
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment & Insurance Status:</span>
                  <div className="mt-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                        currentInvoice.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : currentInvoice.status === 'Partially Paid'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {currentInvoice.status}
                    </span>
                  </div>
                  {currentInvoice.insuranceClaimNumber && <div className="text-[10px] text-slate-500 mt-1">Claim: {currentInvoice.insuranceClaimNumber}</div>}
                  {currentInvoice.status !== 'Draft' && (
                    <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                      <span className="block text-[9px] font-bold uppercase tracking-wide text-blue-700">Total patient responsibility</span>
                      <strong className="text-sm font-mono text-blue-950">AED {patientResponsibility.toFixed(2)}</strong>
                      {hasInsuranceBreakdown && <span className="block text-[9px] text-blue-800">Deductible AED {deductibleTotal.toFixed(2)} + co-pay AED {copayTotal.toFixed(2)}</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Itemized Services Table */}
              <div className="mb-6 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[9px] font-bold uppercase text-slate-500 tracking-wide">
                      <th className="py-2">Sr. No.</th>
                      <th className="py-2">Service Name</th>
                      <th className="py-2 text-center">Unit</th>
                      <th className="py-2 text-right">Rate</th>
                      <th className="py-2 text-right">Discount</th>
                      <th className="py-2 text-right">Net</th>
                      <th className="py-2 text-right">Deduct</th>
                      <th className="py-2 text-right">Co-pay</th>
                      <th className="py-2 text-right">Insurance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentInvoice.items && currentInvoice.items.length > 0 ? (
                      currentInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 text-slate-600">{idx + 1}</td>
                          <td className="py-2 font-medium text-slate-800">
                            {item.description}
                          </td>
                          <td className="py-2 text-center text-slate-600">{item.quantity}</td>
                          <td className="py-2 text-right font-mono text-slate-600">AED {(Number(item.unitCost) || 0).toFixed(2)}</td>
                          <td className="py-2 text-right font-mono text-slate-600">AED {(Number(item.discountAmount) || 0).toFixed(2)}</td>
                          <td className="py-2 text-right font-mono font-semibold text-slate-800">AED {(Number(item.netAmount ?? item.amount ?? item.totalPrice) || 0).toFixed(2)}</td>
                          <td className="py-2 text-right font-mono text-slate-600">AED {(Number(item.deductibleAmount) || 0).toFixed(2)}</td>
                          <td className="py-2 text-right font-mono text-slate-600">
                            {item.copayPercentage !== undefined ? `${item.copayPercentage}% / ` : ''}AED {(Number(item.copayAmount) || 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-right font-mono text-emerald-700">AED {(Number(item.insuranceAmount) || 0).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-2 text-slate-600">1</td>
                        <td className="py-2 font-medium text-slate-800">Hospital Medical & Diagnostic Services</td>
                        <td className="py-2 text-center text-slate-600">1</td>
                        <td className="py-2 text-right font-mono text-slate-600">AED {grossAmount.toFixed(2)}</td>
                        <td className="py-2 text-right font-mono text-slate-600">AED 0.00</td>
                        <td className="py-2 text-right font-mono font-semibold text-slate-800">AED {totalAmount.toFixed(2)}</td>
                        <td className="py-2 text-right font-mono text-slate-600">AED 0.00</td>
                        <td className="py-2 text-right font-mono text-slate-600">AED 0.00</td>
                        <td className="py-2 text-right font-mono text-emerald-700">AED {insuranceCovered.toFixed(2)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary Calculations */}
              <div className="border-t border-slate-200 pt-3 flex justify-end mb-6">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Charges:</span>
                    <span className="font-mono font-medium">AED {grossAmount.toFixed(2)}</span>
                  </div>
                  {hasInsuranceBreakdown && <>
                    <div className="flex justify-between text-slate-600"><span>Discount:</span><span className="font-mono">-AED {discountTotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-slate-700 font-medium"><span>Net services:</span><span className="font-mono">AED {netAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between text-slate-600"><span>Deductible:</span><span className="font-mono">AED {deductibleTotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-slate-600"><span>Patient co-pay:</span><span className="font-mono">AED {copayTotal.toFixed(2)}</span></div>
                  </>}
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Insurance Coverage:</span>
                    <span className="font-mono">AED {insuranceCovered.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 font-semibold border-t border-slate-100 pt-1">
                    <span>Patient Responsibility:</span>
                    <span className="font-mono">AED {patientResponsibility.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Amount Paid to Date:</span>
                    <span className="font-mono font-medium">AED {paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900 border-t-2 border-slate-900 pt-1.5">
                    <span>Balance Due:</span>
                    <span className={`font-mono ${balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      AED {balanceDue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Stamp & Signature */}
              <div className="border-t border-dashed border-slate-300 pt-4 flex items-center justify-between text-[10px] text-slate-500">
                <div className="space-y-1">
                  <div className="font-mono">Invoice reference: {currentInvoice.id}</div>
                  <div>This document records the services and payer/patient allocation shown above.</div>
                </div>
                <div className="text-right">
                  <div className="border-b border-slate-400 w-36 mb-1"></div>
                  <span>Authorized billing officer</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 p-8">No invoice selected.</div>
          )}
        </div>
      </div>
    </div>
  );
};
