import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  LayoutDashboard,
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
import { ReprintInvoiceModal } from './billing/ReprintInvoiceModal';
import { ReprintAdvanceModal } from './billing/ReprintAdvanceModal';
import { PatientLookup } from './billing/PatientLookup';

interface BillingInvoicingProps {
  onOpenNewInvoice: () => void;
  onOpenPaymentModal: (invoice: Invoice) => void;
}

type BillingSubTab = 'overview' | 'invoices' | 'dues' | 'insurance' | 'advance' | 'refunds' | 'pos';

export const BillingInvoicing: React.FC<BillingInvoicingProps> = ({
  onOpenNewInvoice,
  onOpenPaymentModal,
}) => {
  const {
    invoices,
    advancePayments,
    refundPayments,
    insuranceApprovals,
    patients,
    receptionTokens,
    posTransactions,
    reviewRefundPayment,
    issueInvoice,
    addNotification,
    currentRole,
  } = useHospital();

  const [activeSubTab, setActiveSubTab] = useState<BillingSubTab>('overview');
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [cashierPatientId, setCashierPatientId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [insuranceDateFilter, setInsuranceDateFilter] = useState('');
  const [insuranceDoctorFilter, setInsuranceDoctorFilter] = useState('all');
  const [selectedOutstandingPatientId, setSelectedOutstandingPatientId] = useState<string | null>(null);

  useEffect(() => {
    if (currentRole !== 'admin' && activeSubTab === 'insurance') setActiveSubTab('invoices');
  }, [currentRole, activeSubTab]);

  // Modal open states
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isReprintInvoiceOpen, setIsReprintInvoiceOpen] = useState(false);
  const [reprintInvoiceTargetId, setReprintInvoiceTargetId] = useState<string | undefined>(undefined);
  const [isReprintAdvanceOpen, setIsReprintAdvanceOpen] = useState(false);
  const [reprintAdvanceTargetId, setReprintAdvanceTargetId] = useState<string | undefined>(undefined);

  // Invoice Filters & Totals
  const normalizedSearch = invoiceSearchQuery.trim().toLowerCase();
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = Boolean(cashierPatientId) &&
      inv.patientId === cashierPatientId &&
      (!normalizedSearch || inv.id.toLowerCase().includes(normalizedSearch));

    const isOverdue = Number(inv.balanceDue) > 0 && Boolean(inv.dueDate) && inv.dueDate < new Date().toISOString().slice(0, 10);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'outstanding' && Number(inv.balanceDue) > 0) ||
      (statusFilter === 'overdue' && isOverdue) ||
      inv.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const issuedInvoices = invoices.filter((invoice) => invoice.status !== 'Draft');
  const draftInvoiceCount = invoices.filter((invoice) => invoice.status === 'Draft').length;
  const totalBilled = issuedInvoices.reduce(
    (sum, inv) => sum + (Number(inv.totalAmount ?? inv.subtotal) || 0),
    0
  );
  const totalCollected = invoices.reduce(
    (sum, inv) => sum + Math.max(0, (Number(inv.amountPaid) || 0) - (Number(inv.refundedAmount) || 0)),
    0
  );
  const totalOutstanding = issuedInvoices.reduce(
    (sum, inv) => sum + (Number(inv.balanceDue) || 0),
    0
  );
  const outstandingInvoicesByPatient = invoices.reduce<Record<string, Invoice[]>>((grouped, invoice) => {
    if (invoice.status !== 'Draft' && Number(invoice.balanceDue) > 0) {
      grouped[invoice.patientId] = [...(grouped[invoice.patientId] || []), invoice];
    }
    return grouped;
  }, {});
  const outstandingPatients = Object.keys(outstandingInvoicesByPatient)
    .map((patientId) => {
      const patientInvoices = outstandingInvoicesByPatient[patientId];
      const firstInvoice = patientInvoices[0];
      const patient = patients.find((item) => item.id === firstInvoice.patientId);
      const patientAdvances = advancePayments
        .filter((advance) => advance.patientId === firstInvoice.patientId)
        .reduce((sum, advance) => sum + Math.max(0, Number(advance.remainingBalance) || 0), 0);
      return {
        patientId: firstInvoice.patientId,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : firstInvoice.patientName,
        mrn: patient?.rgNo || firstInvoice.patientId,
        invoices: patientInvoices.sort((first, second) => second.issueDate.localeCompare(first.issueDate)),
        balance: patientInvoices.reduce((sum, invoice) => sum + (Number(invoice.balanceDue) || 0), 0),
        availableAdvance: patientAdvances,
      };
    })
    .sort((first, second) => second.balance - first.balance);
  const filteredOutstandingPatients = outstandingPatients.filter((patient) => patient.patientId === cashierPatientId);
  const patientAdvancePayments = advancePayments.filter((advance) => advance.patientId === cashierPatientId);
  const patientRefundPayments = refundPayments.filter((refund) => refund.patientId === cashierPatientId);
  const patientPosTransactions = posTransactions.filter((transaction) => transaction.patientId === cashierPatientId);

  // Advance Totals
  const totalAdvanceDeposited = advancePayments.reduce((sum, a) => sum + a.amount, 0);
  const totalAdvanceRemaining = advancePayments.reduce((sum, a) => sum + a.remainingBalance, 0);

  // Refund Totals
  const totalRefunded = refundPayments
    .filter((refund) => refund.status === 'Completed')
    .reduce((sum, refund) => sum + refund.amount, 0);
  const pendingRefundApprovals = refundPayments.filter((refund) => refund.status === 'Pending Approval').length;
  const overdueInvoiceCount = issuedInvoices.filter((invoice) =>
    Number(invoice.balanceDue) > 0 && invoice.dueDate < new Date().toISOString().slice(0, 10)
  ).length;

  // POS Totals
  const totalPosVolume = posTransactions.reduce((sum, p) => sum + p.amount, 0);
  const settledPosCount = posTransactions.filter((p) => p.status.includes('Settled') || p.status.includes('Approved')).length;

  // Insurance Approval Totals
  const totalApprovedPreAuth = insuranceApprovals
    .filter((approval) => approval.approvalStatus === 'Approved')
    .reduce((sum, approval) => sum + approval.approvedAmount, 0);
  const insuranceDoctorOptions = [...new Set(insuranceApprovals.map((approval) => approval.doctorName))].sort();
  const filteredInsuranceApprovals = insuranceApprovals.filter((approval) =>
    (!insuranceDateFilter || approval.approvalDate === insuranceDateFilter) &&
    Boolean(cashierPatientId) &&
    approval.patientId === cashierPatientId &&
    (insuranceDoctorFilter === 'all' || approval.doctorName === insuranceDoctorFilter)
  );
  const selectedInsurancePatient = patients.find((patient) => patient.id === cashierPatientId);
  const selectedPatientVisits = [...(selectedInsurancePatient?.facilityVisits || [])]
    .sort((firstVisit, secondVisit) => secondVisit.visitDate.localeCompare(firstVisit.visitDate));

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
      {/* Billing desk header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Billing & Cashiering
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Manage patient invoices, encounter balances, deposits, refunds, insurance payments, and daily cashier reconciliation.
          </p>
        </div>

        {/* Primary cashier actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAdvanceModalOpen(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Collect deposit</span>
          </button>

          <button
            onClick={onOpenNewInvoice}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New invoice</span>
          </button>
        </div>
      </div>

      {/* Workflow navigation */}
      <nav aria-label="Billing workflows" className="space-y-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard, count: undefined },
            { id: 'invoices', label: 'Invoices', icon: ReceiptText, count: invoices.length },
            { id: 'dues', label: 'Patient dues', icon: UserCheck, count: outstandingPatients.length },
            { id: 'advance', label: 'Deposits', icon: DollarSign, count: advancePayments.length },
            { id: 'refunds', label: 'Refunds', icon: RotateCcw, count: pendingRefundApprovals || refundPayments.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as BillingSubTab)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-h-11 rounded-lg px-3 py-2 text-left text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="min-w-0 flex-1 truncate">{tab.label}</span>
                {tab.count !== undefined && <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-mono ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{tab.count}</span>}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-1 pt-2">
          <div className="flex items-center gap-2">
            <span className="px-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Operations</span>
            <button type="button" onClick={() => setActiveSubTab('pos')} aria-current={activeSubTab === 'pos' ? 'page' : undefined} className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${activeSubTab === 'pos' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Terminal className="mr-1 inline h-3.5 w-3.5" />POS &amp; cash drawer
            </button>
            {currentRole === 'admin' && <button type="button" onClick={() => setActiveSubTab('insurance')} aria-current={activeSubTab === 'insurance' ? 'page' : undefined} className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${activeSubTab === 'insurance' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />Insurance approvals
            </button>}
          </div>
          <button
            onClick={handlePrint}
            className="rounded-md px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <Printer className="mr-1 inline h-3.5 w-3.5" />Print view
          </button>
        </div>
      </nav>

      {activeSubTab !== 'overview' && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)] md:items-start">
            <PatientLookup
              patients={patients}
              tokens={receptionTokens}
              selectedPatientId={cashierPatientId}
              onSelect={setCashierPatientId}
            />
            <p className="rounded-lg bg-slate-50 p-3 text-[10px] leading-relaxed text-slate-600">
              Search a token, patient name, MRN, phone number, national ID, passport, or insurance/member number. Billing records appear only after you select a matching patient.
            </p>
          </div>
        </section>
      )}

      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Open patient balances', value: `$${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, detail: `${outstandingPatients.length} patients · ${overdueInvoiceCount} overdue encounters`, icon: UserCheck, tab: 'dues' as BillingSubTab, color: 'text-rose-700 bg-rose-50' },
              { label: 'Invoices', value: `${issuedInvoices.length}`, detail: draftInvoiceCount ? `${draftInvoiceCount} draft ready to issue` : 'Issued invoices and claims', icon: ReceiptText, tab: 'invoices' as BillingSubTab, color: 'text-blue-700 bg-blue-50' },
              { label: 'Advance balances', value: `$${totalAdvanceRemaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, detail: `${advancePayments.length} deposit receipts`, icon: DollarSign, tab: 'advance' as BillingSubTab, color: 'text-emerald-700 bg-emerald-50' },
              { label: 'Refunds to review', value: `${pendingRefundApprovals}`, detail: pendingRefundApprovals ? 'Manager approval required' : `${refundPayments.length} total refund requests`, icon: RotateCcw, tab: 'refunds' as BillingSubTab, color: pendingRefundApprovals ? 'text-amber-700 bg-amber-50' : 'text-slate-700 bg-slate-100' },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <button key={card.label} type="button" onClick={() => setActiveSubTab(card.tab)} className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.color}`}><Icon className="h-4 w-4" /></span>
                  <span className="mt-3 block text-[10px] font-bold uppercase tracking-wide text-slate-500">{card.label}</span>
                  <span className="mt-1 block text-xl font-bold text-slate-900">{card.value}</span>
                  <span className="mt-1 block text-[10px] text-slate-500">{card.detail}</span>
                </button>
              );
            })}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-slate-900">Cashier shortcuts</h3>
              <p className="mt-1 text-[10px] text-slate-500">Choose a task to go directly to the right desk.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <button type="button" onClick={onOpenNewInvoice} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-left hover:border-blue-300 hover:bg-blue-50/50">
                <ReceiptText className="h-4 w-4 text-blue-700" /><span><strong className="block text-xs text-slate-900">Create invoice</strong><small className="text-[10px] text-slate-500">Add OPD/IPD charges</small></span>
              </button>
              <button type="button" onClick={() => setActiveSubTab('dues')} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-left hover:border-teal-300 hover:bg-teal-50/50">
                <CreditCard className="h-4 w-4 text-teal-700" /><span><strong className="block text-xs text-slate-900">Collect a balance</strong><small className="text-[10px] text-slate-500">Find patient and settle visit</small></span>
              </button>
              <button type="button" onClick={() => setIsAdvanceModalOpen(true)} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-left hover:border-emerald-300 hover:bg-emerald-50/50">
                <Plus className="h-4 w-4 text-emerald-700" /><span><strong className="block text-xs text-slate-900">Collect a deposit</strong><small className="text-[10px] text-slate-500">Issue an advance receipt</small></span>
              </button>
              <button type="button" onClick={() => setActiveSubTab('refunds')} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-left hover:border-rose-300 hover:bg-rose-50/50">
                <RotateCcw className="h-4 w-4 text-rose-700" /><span><strong className="block text-xs text-slate-900">Refund or adjustment</strong><small className="text-[10px] text-slate-500">Submit or approve refund</small></span>
              </button>
            </div>
          </section>

          <section className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div><h3 className="text-sm font-bold text-slate-900">Needs attention</h3><p className="mt-1 text-[10px] text-slate-500">Review work that may need follow-up.</p></div>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <div className="mt-3 divide-y divide-slate-100">
                {draftInvoiceCount > 0 && <button type="button" onClick={() => { setActiveSubTab('invoices'); setStatusFilter('draft'); }} className="flex w-full items-center justify-between py-2 text-left text-xs hover:text-blue-700"><span>{draftInvoiceCount} invoice drafts to issue</span><span className="font-semibold">Review →</span></button>}
                {overdueInvoiceCount > 0 && <button type="button" onClick={() => { setActiveSubTab('invoices'); setStatusFilter('overdue'); }} className="flex w-full items-center justify-between py-2 text-left text-xs hover:text-blue-700"><span>{overdueInvoiceCount} overdue encounters</span><span className="font-semibold">Review →</span></button>}
                {pendingRefundApprovals > 0 && <button type="button" onClick={() => setActiveSubTab('refunds')} className="flex w-full items-center justify-between py-2 text-left text-xs hover:text-blue-700"><span>{pendingRefundApprovals} refunds awaiting manager approval</span><span className="font-semibold">Review →</span></button>}
                {draftInvoiceCount === 0 && overdueInvoiceCount === 0 && pendingRefundApprovals === 0 && <p className="py-2 text-xs text-slate-500">No urgent billing tasks right now.</p>}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div><h3 className="text-sm font-bold text-slate-900">Daily operations</h3><p className="mt-1 text-[10px] text-slate-500">Receipts, insurance approvals, and payment reconciliation.</p></div>
                <Building2 className="h-4 w-4 text-slate-500" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setActiveSubTab('advance')} className="rounded-lg bg-slate-50 p-3 text-left hover:bg-slate-100"><strong className="block text-xs text-slate-900">Advance register</strong><span className="text-[10px] text-slate-500">{advancePayments.length} receipts · ${totalAdvanceDeposited.toFixed(2)} collected</span></button>
                <button type="button" onClick={() => setActiveSubTab('pos')} className="rounded-lg bg-slate-50 p-3 text-left hover:bg-slate-100"><strong className="block text-xs text-slate-900">POS &amp; cash drawer</strong><span className="text-[10px] text-slate-500">{settledPosCount} settled · ${totalPosVolume.toFixed(2)} volume</span></button>
                {currentRole === 'admin' && <button type="button" onClick={() => setActiveSubTab('insurance')} className="col-span-2 flex items-center justify-between rounded-lg bg-slate-50 p-3 text-left hover:bg-slate-100"><span><strong className="block text-xs text-slate-900">Insurance approvals</strong><span className="text-[10px] text-slate-500">{insuranceApprovals.length} authorization records</span></span><ShieldCheck className="h-4 w-4 text-slate-500" /></button>}
              </div>
            </div>
          </section>
        </div>
      )}

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
                Patient balances remaining across encounters
              </span>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter this patient's invoice number..."
                value={invoiceSearchQuery}
                onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>

            <div className="flex items-center gap-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'outstanding', label: 'Outstanding' },
                { id: 'overdue', label: 'Overdue' },
                { id: 'draft', label: 'Draft' },
                { id: 'paid', label: 'Paid' },
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
                        {cashierPatientId
                          ? 'No invoices for this patient match the selected search or filter.'
                          : 'Search and select a patient above to view their invoices.'}
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const overdue = Number(inv.balanceDue) > 0 && inv.dueDate < new Date().toISOString().slice(0, 10);
                      const displayStatus = overdue ? 'Overdue' : inv.status;
                      const statusClass = displayStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : displayStatus === 'Partially Paid'
                        ? 'bg-amber-100 text-amber-800'
                        : displayStatus === 'Pending Insurance' || displayStatus === 'Insurance Processing'
                        ? 'bg-blue-100 text-blue-800'
                        : displayStatus === 'Draft'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-rose-100 text-rose-800';
                      return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-slate-800">
                          {inv.id}
                          {inv.encounterType && <div className="mt-0.5 font-sans text-[9px] font-semibold text-slate-500">{inv.encounterType} encounter</div>}
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
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusClass}`}
                          >
                            {displayStatus}
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
                          {inv.status === 'Draft' ? (
                            currentRole === 'admin' || currentRole === 'receptionist' ? (
                              <button type="button" onClick={() => issueInvoice(inv.id)} className="rounded bg-teal-700 px-2.5 py-1 text-xs font-bold text-white hover:bg-teal-800">Issue</button>
                            ) : <span className="text-[10px] text-slate-500">Draft</span>
                          ) : inv.balanceDue > 0 ? (
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'dues' && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Patient balances due</p>
              <p className="mt-1 text-2xl font-bold font-mono text-rose-700">${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="mt-1 text-[10px] text-slate-500">Across {outstandingPatients.reduce((sum, item) => sum + item.invoices.length, 0)} unpaid encounters</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Patients with a balance</p>
              <p className="mt-1 text-2xl font-bold font-mono text-slate-900">{outstandingPatients.length}</p>
              <p className="mt-1 text-[10px] text-slate-500">Consolidated by patient across visits</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800">Available advance balances</p>
              <p className="mt-1 text-2xl font-bold font-mono text-emerald-800">${totalAdvanceRemaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="mt-1 text-[10px] text-emerald-700">Review deposits before requesting payment</p>
            </div>
          </div>
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <header className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Patient outstanding</h3>
                <p className="mt-0.5 text-[10px] text-slate-500">Balances are grouped across encounters. Expand a patient to settle a specific invoice.</p>
              </div>
            </header>
            {!cashierPatientId ? (
              <p className="p-6 text-center text-xs text-slate-500">Search and select a patient above to view their outstanding encounters.</p>
            ) : filteredOutstandingPatients.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-500">No patient balances are currently outstanding.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredOutstandingPatients.map((patient) => {
                  const expanded = selectedOutstandingPatientId === patient.patientId;
                  return (
                    <div key={patient.patientId}>
                      <button type="button" onClick={() => setSelectedOutstandingPatientId(expanded ? null : patient.patientId)} className="grid w-full grid-cols-2 items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_140px_150px_170px_120px]">
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-bold text-slate-900">{patient.patientName}</span>
                          <span className="block font-mono text-[10px] text-slate-500">MRN: {patient.mrn} · {patient.invoices.length} encounter{patient.invoices.length === 1 ? '' : 's'}</span>
                        </span>
                        <span className="text-[10px] text-slate-600">Available advance<br /><strong className="font-mono">${patient.availableAdvance.toFixed(2)}</strong></span>
                        <span className="text-right font-mono text-sm font-bold text-rose-700">${patient.balance.toFixed(2)} due</span>
                        <span className="text-[10px] text-slate-600">Potential after advance<br /><strong className="font-mono">${Math.max(0, patient.balance - patient.availableAdvance).toFixed(2)}</strong></span>
                        <span className="text-right text-[10px] font-semibold text-teal-700">{expanded ? 'Hide encounters' : 'View encounters'}</span>
                      </button>
                      {expanded && (
                        <div className="space-y-2 bg-slate-50 px-4 py-3">
                          {patient.invoices.map((invoice) => {
                            const overdue = invoice.dueDate < new Date().toISOString().slice(0, 10);
                            return (
                              <div key={invoice.id} className="flex flex-col justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:items-center">
                                <div>
                                  <p className="text-xs font-bold text-slate-900">{invoice.id} {invoice.encounterType && <span className="font-semibold text-teal-700">· {invoice.encounterType}</span>} <span className="font-normal text-slate-500">· Issued {invoice.issueDate}</span></p>
                                  <p className="mt-0.5 text-[10px] text-slate-500">Due {invoice.dueDate}{overdue ? ' · Overdue' : ''} · {invoice.items.length} charge line{invoice.items.length === 1 ? '' : 's'}</p>
                                </div>
                                <div className="flex items-center justify-between gap-3 sm:justify-end">
                                  <span className="font-mono text-sm font-bold text-rose-700">${Number(invoice.balanceDue).toFixed(2)}</span>
                                  <button type="button" onClick={() => onOpenPaymentModal(invoice)} className="rounded-md bg-teal-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-800">Settle encounter</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* SUB-TAB 2: INSURANCE APPROVALS & PRE-AUTHORISATION */}
      {activeSubTab === 'insurance' && currentRole === 'admin' && (
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
                  Approval handling
                </span>
                <p className="text-xs text-slate-600 mt-1">
                  Medical Coders review requests and publish insurer decisions. Billing can view the recorded status here.
                </p>
              </div>
            </div>
          </div>

          <section aria-label="Filter insurance approvals" className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-[11px] font-semibold text-slate-700">
              Approval date
              <input type="date" value={insuranceDateFilter} onChange={(event) => setInsuranceDateFilter(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-2 text-xs font-normal" />
            </label>
            <div className="flex items-center rounded-md bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
              {selectedInsurancePatient
                ? `${selectedInsurancePatient.firstName} ${selectedInsurancePatient.lastName} · ${selectedInsurancePatient.rgNo || selectedInsurancePatient.id}`
                : 'Select a patient using the search above.'}
            </div>
            <label className="text-[11px] font-semibold text-slate-700">
              Attending doctor
              <select value={insuranceDoctorFilter} onChange={(event) => setInsuranceDoctorFilter(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs font-normal">
                <option value="all">All doctors</option>
                {insuranceDoctorOptions.map((doctorName) => <option key={doctorName} value={doctorName}>{doctorName}</option>)}
              </select>
            </label>
            <div className="flex items-end justify-between gap-2 text-xs">
              <span className="pb-2 text-slate-500">{filteredInsuranceApprovals.length} approvals</span>
              <button type="button" onClick={() => { setInsuranceDateFilter(''); setInsuranceDoctorFilter('all'); }} className="mb-1 rounded-md border border-slate-300 px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-50">Clear filters</button>
            </div>
          </section>

          {/* Insurance Approvals Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Insurance Pre-Authorisation & Approval Numbers Registry ({filteredInsuranceApprovals.length})
                </h3>
              </div>
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
                  {filteredInsuranceApprovals.length === 0 ? (
                    <tr><td colSpan={9} className="py-8 text-center text-xs text-slate-500">{cashierPatientId ? 'No insurance approvals match this patient and the selected filters.' : 'Search and select a patient above to view their insurance approvals.'}</td></tr>
                  ) : filteredInsuranceApprovals.map((appr) => (
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

          {selectedInsurancePatient && (
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col justify-between gap-2 border-b border-slate-200 bg-slate-50/70 p-3.5 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Past visits · {selectedInsurancePatient.firstName} {selectedInsurancePatient.lastName}</h3>
                  <p className="mt-0.5 font-mono text-[10px] text-slate-500">{selectedInsurancePatient.id} · All attending doctors</p>
                </div>
                <span className="text-[10px] text-slate-500">{selectedPatientVisits.length} visits</span>
              </div>
              {selectedPatientVisits.length === 0 ? (
                <p className="p-4 text-xs text-slate-500">No past visits are recorded for this patient.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[740px] text-left text-xs">
                    <thead className="bg-white text-[10px] font-bold uppercase text-slate-500">
                      <tr>
                        <th className="px-3 py-2.5">Visit date</th>
                        <th className="px-3 py-2.5">Doctor</th>
                        <th className="px-3 py-2.5">Department / Visit</th>
                        <th className="px-3 py-2.5">Diagnosis</th>
                        <th className="px-3 py-2.5">Disposition</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPatientVisits.map((visit) => (
                        <tr key={visit.id}>
                          <td className="whitespace-nowrap px-3 py-2.5 font-mono text-slate-700">{visit.visitDate}</td>
                          <td className="px-3 py-2.5"><p className="font-semibold text-slate-900">{visit.doctorName}</p><p className="text-[10px] text-slate-500">{visit.doctorSpecialty}</p></td>
                          <td className="px-3 py-2.5 text-slate-700">{visit.department}<p className="text-[10px] text-slate-500">{visit.visitType}</p></td>
                          <td className="px-3 py-2.5 text-slate-700">{visit.primaryDiagnosis.code} · {visit.primaryDiagnosis.description}</td>
                          <td className="px-3 py-2.5 text-slate-700">{visit.disposition}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
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
                  Advance Deposits for Selected Patient ({patientAdvancePayments.length})
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
                  {!cashierPatientId ? (
                    <tr><td colSpan={10} className="py-8 text-center text-slate-500">Search and select a patient above to view their deposit receipts.</td></tr>
                  ) : patientAdvancePayments.length === 0 ? (
                    <tr><td colSpan={10} className="py-8 text-center text-slate-500">No advance receipts found for this patient.</td></tr>
                  ) : patientAdvancePayments.map((adv) => (
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
                Awaiting manager approval
              </span>
              <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
                {pendingRefundApprovals} requests
              </div>
              <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
                Only approved refunds are disbursed and deducted from deposits.
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
                  Refund Records for Selected Patient ({patientRefundPayments.length})
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
                  {!cashierPatientId ? (
                    <tr><td colSpan={9} className="py-8 text-center text-slate-500">Search and select a patient above to view their refund records.</td></tr>
                  ) : patientRefundPayments.length === 0 ? (
                    <tr><td colSpan={9} className="py-8 text-center text-slate-500">No refund records found for this patient.</td></tr>
                  ) : patientRefundPayments.map((ref) => (
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
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ref.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ref.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ref.status}
                        </span>
                        {currentRole === 'admin' && ref.status === 'Pending Approval' && (
                          <div className="mt-2 flex gap-1">
                            <button type="button" onClick={() => reviewRefundPayment(ref.id, 'Approved')} className="rounded bg-emerald-700 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-800">Approve</button>
                            <button type="button" onClick={() => reviewRefundPayment(ref.id, 'Rejected')} className="rounded border border-rose-200 px-2 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-50">Reject</button>
                          </div>
                        )}
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
                  {!cashierPatientId ? (
                    <tr><td colSpan={10} className="py-8 text-center text-slate-500">Search and select a patient above to view their POS and cash transactions.</td></tr>
                  ) : patientPosTransactions.length === 0 ? (
                    <tr><td colSpan={10} className="py-8 text-center text-slate-500">No POS or cash transactions found for this patient.</td></tr>
                  ) : patientPosTransactions.map((tx) => (
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
