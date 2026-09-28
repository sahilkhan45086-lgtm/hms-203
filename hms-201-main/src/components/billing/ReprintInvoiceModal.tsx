import React, { useState } from 'react';
import { X, Printer, ReceiptText, Search, CheckCircle2, ShieldCheck, Building2, User } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Invoice } from '../../types';

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
  const insuranceCovered = Number(currentInvoice?.insuranceCoveredAmount ?? currentInvoice?.insuranceCovered ?? 0);
  const paidAmount = Number(currentInvoice?.amountPaid ?? 0);
  const balanceDue = Number(currentInvoice?.balanceDue ?? 0);

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
                  {inv.id} — {inv.patientName} (${(inv.totalAmount || inv.subtotal).toFixed(2)})
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
            <div className="bg-white border border-slate-200 rounded-xl shadow-md p-6 sm:p-8 w-full max-w-2xl text-slate-800 font-sans print:border-none print:shadow-none print:p-0">
              {/* Official Hospital Header */}
              <div className="border-b-2 border-slate-900 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                      +
                    </div>
                    <h1 className="text-base font-black tracking-tight text-slate-900 uppercase">
                      Ascension Health System & Medical Center
                    </h1>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Department of Revenue & Patient Financial Services • Tax ID: 94-2849102 • HIPAA Compliant
                  </p>
                  <p className="text-[10px] text-slate-500">
                    742 Evergreen Healthcare Blvd, Metropolitan Center, FL 32801
                  </p>
                </div>

                <div className="sm:text-right">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                    OFFICIAL TAX INVOICE
                  </div>
                  <div className="text-base font-mono font-bold text-slate-900">{currentInvoice.id}</div>
                  <div className="text-[10px] text-slate-500">Date: {currentInvoice.issueDate}</div>
                  <div className="text-[10px] text-slate-500">Due Date: {currentInvoice.dueDate}</div>
                </div>
              </div>

              {/* Patient & Billing Info */}
              <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-200 text-xs mb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Billed To Patient:</span>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{currentInvoice.patientName}</div>
                  <div className="text-[11px] font-mono text-slate-600">MRN: {currentInvoice.patientId}</div>
                  <div className="text-[11px] text-slate-500">Account Type: Outpatient / Inpatient Services</div>
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
                  <div className="text-[10px] text-slate-500 mt-1">
                    Payer Adjudication: Real-time Electronic EOB
                  </div>
                </div>
              </div>

              {/* Itemized Services Table */}
              <div className="mb-6">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                      <th className="py-2">Description / Procedure</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentInvoice.items && currentInvoice.items.length > 0 ? (
                      currentInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 font-medium text-slate-800">
                            {item.description}
                          </td>
                          <td className="py-2 text-center text-slate-600">{item.quantity}</td>
                          <td className="py-2 text-right font-mono text-slate-600">
                            ${(Number(item.unitCost) || 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-right font-mono font-bold text-slate-900">
                            ${(Number(item.amount ?? item.totalPrice) || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-2 font-medium text-slate-800">Hospital Medical & Diagnostic Services</td>
                        <td className="py-2 text-center text-slate-600">1</td>
                        <td className="py-2 text-right font-mono text-slate-600">${totalAmount.toFixed(2)}</td>
                        <td className="py-2 text-right font-mono font-bold text-slate-900">${totalAmount.toFixed(2)}</td>
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
                    <span className="font-mono font-medium">${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Insurance Coverage:</span>
                    <span className="font-mono">-${insuranceCovered.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 font-semibold border-t border-slate-100 pt-1">
                    <span>Patient Responsibility:</span>
                    <span className="font-mono">${(totalAmount - insuranceCovered).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Amount Paid to Date:</span>
                    <span className="font-mono font-medium">${paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900 border-t-2 border-slate-900 pt-1.5">
                    <span>Balance Due:</span>
                    <span className={`font-mono ${balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      ${balanceDue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Stamp & Signature */}
              <div className="border-t border-dashed border-slate-300 pt-4 flex items-center justify-between text-[10px] text-slate-500">
                <div className="space-y-1">
                  <div className="font-mono">BARCODE: *{currentInvoice.id}*</div>
                  <div>Thank you for entrusting Ascension Medical Center with your care.</div>
                </div>
                <div className="text-right">
                  <div className="border-b border-slate-400 w-36 mb-1"></div>
                  <span>Authorized Hospital Cashier Stamp</span>
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
