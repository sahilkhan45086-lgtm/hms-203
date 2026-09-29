import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  DollarSign,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ReceiptText,
  ShieldCheck,
  RotateCcw,
  Building2,
  FileCheck,
  Layers,
  FileText,
  UserCheck,
  Stethoscope,
  Terminal,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { Invoice } from '../types';
import { AdvancePaymentModal } from './billing/AdvancePaymentModal';
import { RefundPaymentModal } from './billing/RefundPaymentModal';
import { InsuranceAuthorisationModal } from './billing/InsuranceAuthorisationModal';
import { ReprintInvoiceModal } from './billing/ReprintInvoiceModal';
import { ReprintAdvanceModal } from './billing/ReprintAdvanceModal';

interface BillingInvoicingProps {
  onOpenNewInvoice: () => void;
  onOpenPaymentModal: (invoice: Invoice) => void;
}

type BillingSubTab = 'invoices' | 'insurance' | 'advance' | 'refunds' | 'pos';

export const BillingInvoicing: React.FC<BillingInvoicingProps> = ({
  onOpenNewInvoice,
  onOpenPaymentModal,
}) => {
  const {
    invoices,
    advancePayments,
    refundPayments,
    insuranceApprovals,
    posTransactions,
    addNotification,
  } = useHospital();

  const [activeSubTab, setActiveSubTab] = useState<BillingSubTab>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal open states
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [isReprintInvoiceOpen, setIsReprintInvoiceOpen] = useState(false);
  const [reprintInvoiceTargetId, setReprintInvoiceTargetId] = useState<string | undefined>(undefined);
  const [isReprintAdvanceOpen, setIsReprintAdvanceOpen] = useState(false);
  const [reprintAdvanceTargetId, setReprintAdvanceTargetId] = useState<string | undefined>(undefined);

  // Invoice Filters & Totals
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.patientId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || inv.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalBilled = invoices.reduce(
    (sum, inv) => sum + (Number(inv.totalAmount ?? inv.subtotal) || 0),
    0
  );
  const totalCollected = invoices.reduce(
    (sum, inv) => sum + (Number(inv.amountPaid) || 0),
    0
  );
  const totalOutstanding = invoices.reduce(
    (sum, inv) => sum + (Number(inv.balanceDue) || 0),
    0
  );

  // Advance Totals
  const totalAdvanceDeposited = advancePayments.reduce((sum, a) => sum + a.amount, 0);
  const totalAdvanceRemaining = advancePayments.reduce((sum, a) => sum + a.remainingBalance, 0);

  // Refund Totals
  const totalRefunded = refundPayments.reduce((sum, r) => sum + r.amount, 0);

  // POS Totals
  const totalPosVolume = posTransactions.reduce((sum, p) => sum + p.amount, 0);
  const settledPosCount = posTransactions.filter((p) => p.status.includes('Settled') || p.status.includes('Approved')).length;

  // Insurance Approval Totals
  const totalApprovedPreAuth = insuranceApprovals
    .filter((approval) => approval.approvalStatus === 'Approved')
    .reduce((sum, approval) => sum + approval.approvedAmount, 0);

  const handlePrint = () => {
    window.print();
  };

  const openReprintForInvoice = (invoiceId: string) => {
    setReprintInvoiceTargetId(invoiceId);
    setIsReprintInvoiceOpen(true);
  };

  const openReprintForAdvance = (advanceId: string) => {
    setReprintAdvanceTargetId(advanceId);
    setIsReprintAdvanceOpen(true);
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Top Banner with Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Hospital Financial Billing, Claims & Cashiering
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Reception & Cashier revenue cycle: Patient invoices, insurance pre-authorisations, advance deposits, refunds, reprint receipts, and daily POS terminal reconciliation.
          </p>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setReprintInvoiceTargetId(undefined);
              setIsReprintInvoiceOpen(true);
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Reprint Invoice</span>
          </button>

          <button
            onClick={() => {
              setReprintAdvanceTargetId(undefined);
              setIsReprintAdvanceOpen(true);
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-600" />
            <span>Reprint Advance</span>
          </button>

          <button
            onClick={() => setIsAdvanceModalOpen(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Advance Payment</span>
          </button>

          <button
            onClick={() => setIsInsuranceModalOpen(true)}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>+ Pre-Auth Approval No.</span>
          </button>

          <button
            onClick={onOpenNewInvoice}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Generate Invoice</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'invoices', label: '1. Invoices & Claims', icon: ReceiptText, count: invoices.length },
            { id: 'insurance', label: '2. Insurance Approvals & Pre-Auth', icon: ShieldCheck, count: insuranceApprovals.length },
            { id: 'advance', label: '3. Advance Payments', icon: DollarSign, count: advancePayments.length },
            { id: 'refunds', label: '4. Refund Payments', icon: RotateCcw, count: refundPayments.length },
            { id: 'pos', label: '5. Daily POS Transactions', icon: Terminal, count: posTransactions.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as BillingSubTab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handlePrint}
          className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Tab View</span>
        </button>
      </div>

      {/* SUB-TAB 1: INVOICES & CLAIMS */}
      {activeSubTab === 'invoices' && (
        <div className="space-y-4">
          {/* Revenue Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Invoiced Volume
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                ${totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {invoices.length} Issued Hospital Billing Records
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Collected Revenue
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                ${totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                Successfully Cleared & Reconciled
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Outstanding Accounts Receivable
              </span>
              <div className="text-2xl font-bold font-mono text-rose-600 mt-1">
                ${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-rose-700 font-semibold mt-1 block">
                Pending Insurance & Patient Copay
              </span>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invoice number, patient name, MRN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>

            <div className="flex items-center gap-1">
              {[
                { id: 'all', label: 'All Invoices' },
                { id: 'pending', label: 'Pending Payment' },
                { id: 'partially paid', label: 'Partial' },
                { id: 'paid', label: 'Settled / Paid' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <ReceiptText className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Hospital Invoicing & Claims Ledger ({filteredInvoices.length})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setReprintInvoiceTargetId(undefined);
                    setIsReprintInvoiceOpen(true);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-xs font-medium text-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3 h-3 text-slate-500" />
                  <span>Reprint Any Invoice</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/75 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="py-2.5 px-3">Invoice ID</th>
                    <th className="py-2.5 px-3">Patient</th>
                    <th className="py-2.5 px-3">Issue / Due Date</th>
                    <th className="py-2.5 px-3">Total Amount</th>
                    <th className="py-2.5 px-3">Insurance Covered</th>
                    <th className="py-2.5 px-3">Balance Due</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No hospital invoices matching the selected search or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-slate-800">
                          {inv.id}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{inv.patientName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{inv.patientId}</div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-600">
                          <div>{inv.issueDate}</div>
                          <div className="text-[10px] text-slate-400">Due: {inv.dueDate}</div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-slate-900">
                          ${(Number(inv.totalAmount ?? inv.subtotal) || 0).toFixed(2)}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-emerald-600 font-semibold">
                          ${(Number(inv.insuranceCoveredAmount ?? inv.insuranceCovered) || 0).toFixed(2)}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-rose-600">
                          ${(Number(inv.balanceDue) || 0).toFixed(2)}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inv.status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.status === 'Partially Paid'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap text-right space-x-1.5">
                          <button
                            onClick={() => openReprintForInvoice(inv.id)}
                            title="Reprint official invoice"
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {inv.balanceDue > 0 ? (
                            <button
                              onClick={() => onOpenPaymentModal(inv)}
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded text-xs inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <DollarSign className="w-3 h-3" /> Collect
                            </button>
                          ) : (
                            <span className="text-[11px] font-semibold text-emerald-600 inline-flex items-center gap-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: INSURANCE APPROVALS & PRE-AUTHORISATION */}
      {activeSubTab === 'insurance' && (
        <div className="space-y-4">
          {/* Header & Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Pre-Authorised Sum
              </span>
              <div className="text-2xl font-bold font-mono text-purple-600 mt-1">
                ${totalApprovedPreAuth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Approved by Third-Party Payers (TPAs)
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Active Insurance Approvals
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                {insuranceApprovals.filter((a) => a.approvalStatus === 'Approved').length} Authorisations
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                Under Doctor Visit & Procedure / Lab / Radiology
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Authorisation Action
                </span>
                <p className="text-xs text-slate-600 mt-1">
                  Add insurance approval code under attending doctor and procedure/lab/radiology.
                </p>
              </div>
              <button
                onClick={() => setIsInsuranceModalOpen(true)}
                className="mt-2 w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Pre-Authorisation Approval</span>
              </button>
            </div>
          </div>

          {/* Insurance Approvals Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Insurance Pre-Authorisation & Approval Numbers Registry ({insuranceApprovals.length})
                </h3>
              </div>
              <button
                onClick={() => setIsInsuranceModalOpen(true)}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>New Authorisation</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/75 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="py-2.5 px-3">Approval No. / Insurer</th>
                    <th className="py-2.5 px-3">Patient & MRN</th>
                    <th className="py-2.5 px-3">Attending Doctor Visit</th>
                    <th className="py-2.5 px-3">Procedure / Lab / Radiology</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Approved Amount</th>
                    <th className="py-2.5 px-3">Copay %</th>
                    <th className="py-2.5 px-3">Valid Until</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {insuranceApprovals.map((appr) => (
                    <tr key={appr.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-mono font-bold text-purple-700">{appr.approvalNumber}</div>
                        <div className="text-[10px] text-slate-500">{appr.insuranceProvider} ({appr.policyNumber})</div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{appr.patientName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{appr.patientMrn}</div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <Stethoscope className="w-3 h-3 text-slate-400" />
                          <span>{appr.doctorName}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">{appr.department}</div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-800 line-clamp-1 max-w-xs">{appr.serviceName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{appr.serviceCode}</div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            appr.serviceCategory === 'Procedure'
                              ? 'bg-blue-100 text-blue-800'
                              : appr.serviceCategory === 'Radiology'
                              ? 'bg-indigo-100 text-indigo-800'
                              : appr.serviceCategory === 'Lab Test'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {appr.serviceCategory}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-emerald-700">
                        ${appr.approvedAmount.toFixed(2)}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-700">
                        {appr.copayPercentage}% (${appr.copayAmount.toFixed(2)})
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-600 text-[11px]">
                        {appr.validUntil}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            appr.approvalStatus === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : appr.approvalStatus === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : appr.approvalStatus === 'Query Raised'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {appr.approvalStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ADVANCE PAYMENTS */}
      {activeSubTab === 'advance' && (
        <div className="space-y-4">
          {/* Advance Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Advance Deposited
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                ${totalAdvanceDeposited.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {advancePayments.length} Advance Deposit Receipts Collected
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Remaining Deposit Balances
              </span>
              <div className="text-2xl font-bold font-mono text-blue-600 mt-1">
                ${totalAdvanceRemaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-blue-700 font-semibold mt-1 block">
                Available for Invoice Settlement or Refund
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Advance Action
                </span>
                <p className="text-xs text-slate-600 mt-1">
                  Collect patient deposit for inpatient admission, OT surgery, or OPD retainer.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => setIsAdvanceModalOpen(true)}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Collect Advance</span>
                </button>
                <button
                  onClick={() => {
                    setReprintAdvanceTargetId(undefined);
                    setIsReprintAdvanceOpen(true);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Reprint</span>
                </button>
              </div>
            </div>
          </div>

          {/* Advance Payments Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Advance Financial Deposits Register ({advancePayments.length})
                </h3>
              </div>
              <button
                onClick={() => setIsAdvanceModalOpen(true)}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>New Advance Deposit</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/75 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="py-2.5 px-3">Receipt No.</th>
                    <th className="py-2.5 px-3">Patient & MRN</th>
                    <th className="py-2.5 px-3">Date / Time</th>
                    <th className="py-2.5 px-3">Deposit Purpose</th>
                    <th className="py-2.5 px-3">Payment Method</th>
                    <th className="py-2.5 px-3">Amount Deposited</th>
                    <th className="py-2.5 px-3">Remaining Balance</th>
                    <th className="py-2.5 px-3">Cashier</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Reprint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {advancePayments.map((adv) => (
                    <tr key={adv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-emerald-700">
                        {adv.receiptNumber}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{adv.patientName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{adv.patientMrn}</div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                        <div>{adv.date}</div>
                        <div className="text-[10px] text-slate-400">{adv.time}</div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-medium text-slate-800">{adv.purpose}</span>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                        {adv.paymentMethod}
                        {adv.terminalId && <div className="text-[10px] text-slate-400">{adv.terminalId}</div>}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-slate-900">
                        ${adv.amount.toFixed(2)}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-emerald-600">
                        ${adv.remainingBalance.toFixed(2)}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                        {adv.cashierName}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            adv.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : adv.status === 'Partially Utilized'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {adv.status}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-right">
                        <button
                          onClick={() => openReprintForAdvance(adv.id)}
                          title="Reprint official advance receipt"
                          className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 rounded text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Reprint</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: REFUND PAYMENTS */}
      {activeSubTab === 'refunds' && (
        <div className="space-y-4">
          {/* Refund Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Refunds Disbursed
              </span>
              <div className="text-2xl font-bold font-mono text-rose-600 mt-1">
                ${totalRefunded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {refundPayments.length} Authorised Refund Vouchers Issued
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Refund Compliance
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                100% Audit Cleared
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                Approved by Finance & Medical Administration
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Refund Action
                </span>
                <p className="text-xs text-slate-600 mt-1">
                  Process procedure cancellation, overpayment, or remaining deposit refund voucher.
                </p>
              </div>
              <button
                onClick={() => setIsRefundModalOpen(true)}
                className="mt-2 w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Process Refund Voucher</span>
              </button>
            </div>
          </div>

          {/* Refund Vouchers Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Hospital Refund Vouchers Registry ({refundPayments.length})
                </h3>
              </div>
              <button
                onClick={() => setIsRefundModalOpen(true)}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>New Refund</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/75 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="py-2.5 px-3">Voucher No.</th>
                    <th className="py-2.5 px-3">Patient</th>
                    <th className="py-2.5 px-3">Original Reference</th>
                    <th className="py-2.5 px-3">Refund Amount</th>
                    <th className="py-2.5 px-3">Disbursement Method</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Authorized By</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {refundPayments.map((ref) => (
                    <tr key={ref.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-rose-700">
                        {ref.voucherNumber}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{ref.patientName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{ref.patientId}</div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{ref.originalReferenceType}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{ref.originalReferenceId}</div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-rose-600">
                        ${ref.amount.toFixed(2)}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                        {ref.refundMethod}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-800">{ref.reason}</div>
                        {ref.notes && <div className="text-[10px] text-slate-400 line-clamp-1">{ref.notes}</div>}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                        <div>{ref.date}</div>
                        <div className="text-[10px] text-slate-400">{ref.time}</div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-700">
                        <div className="font-medium">{ref.authorizedBy}</div>
                        <div className="text-[10px] text-slate-400">Cashier: {ref.cashierName}</div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {ref.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: DAILY POS TRANSACTIONS */}
      {activeSubTab === 'pos' && (
        <div className="space-y-4">
          {/* POS Terminal Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Today's POS Settled Total
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                ${totalPosVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Card Terminals & Front Desk Cash
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Desk A (Verifone V200c)
              </span>
              <div className="text-xl font-bold font-mono text-blue-600 mt-1">
                Batch 4092 Active
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                Host Link: Online (EMV / Contactless)
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Desk B (Ingenico Move)
              </span>
              <div className="text-xl font-bold font-mono text-purple-600 mt-1">
                Batch 4093 Active
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                Host Link: Online (EMV / Apple Pay)
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  POS Reconciliation
                </span>
                <span className="text-xs text-slate-600 mt-1 block">
                  {settledPosCount} Transactions Batched & Cleared
                </span>
              </div>
              <button
                onClick={handlePrint}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Daily POS Settlement</span>
              </button>
            </div>
          </div>

          {/* POS Transactions Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Daily POS Swipes & Cash Drawer Transactions ({posTransactions.length})
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>PCI-DSS Point-to-Point Encryption (P2PE)</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/75 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="py-2.5 px-3">Tx ID / Batch</th>
                    <th className="py-2.5 px-3">Terminal</th>
                    <th className="py-2.5 px-3">Patient</th>
                    <th className="py-2.5 px-3">Card / Instrument</th>
                    <th className="py-2.5 px-3">Auth Code</th>
                    <th className="py-2.5 px-3">RRN Number</th>
                    <th className="py-2.5 px-3">Amount ($)</th>
                    <th className="py-2.5 px-3">Time & Date</th>
                    <th className="py-2.5 px-3">Cashier</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {posTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-slate-800">
                        <div>{tx.id}</div>
                        <div className="text-[10px] text-slate-400">{tx.batchNumber}</div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                        {tx.terminalName}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{tx.patientName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{tx.patientId}</div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-medium text-slate-800">{tx.cardType}</span>
                        {tx.cardLast4 && (
                          <span className="text-[10px] text-slate-500 font-mono ml-1">
                            (•••• {tx.cardLast4})
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-purple-700 font-bold">
                        {tx.authCode}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-600 text-[11px]">
                        {tx.rrnNumber}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-slate-900">
                        ${tx.amount.toFixed(2)}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                        <div>{tx.transactionTime}</div>
                        <div className="text-[10px] text-slate-400">{tx.transactionDate}</div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                        {tx.cashierName}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <AdvancePaymentModal
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        onPaymentCreated={(payment) => {
          openReprintForAdvance(payment.id);
        }}
      />

      <RefundPaymentModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
      />

      <InsuranceAuthorisationModal
        isOpen={isInsuranceModalOpen}
        onClose={() => setIsInsuranceModalOpen(false)}
      />

      <ReprintInvoiceModal
        isOpen={isReprintInvoiceOpen}
        onClose={() => setIsReprintInvoiceOpen(false)}
        initialInvoiceId={reprintInvoiceTargetId}
      />

      <ReprintAdvanceModal
        isOpen={isReprintAdvanceOpen}
        onClose={() => setIsReprintAdvanceOpen(false)}
        initialAdvanceId={reprintAdvanceTargetId}
      />
    </div>
  );
};
