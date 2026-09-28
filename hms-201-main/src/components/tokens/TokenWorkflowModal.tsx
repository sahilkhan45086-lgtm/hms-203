import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  User,
  HeartPulse,
  Stethoscope,
  Receipt,
  FlaskConical,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  Printer,
  Send,
  Plus,
  Trash2,
  ShieldCheck,
  CreditCard,
  Building2,
  Phone,
  FileText,
  Activity,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import {
  ReceptionToken,
  TokenWorkflowStage,
  PaymentSchemeType,
  TokenVitalsRecord,
  TokenDoctorOrder,
  TokenBillingSummary,
  TokenDiagnosticReport,
} from '../../types';

interface TokenWorkflowModalProps {
  token: ReceptionToken | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPatientFile?: (patientId: string) => void;
}

const STAGES: Array<{
  id: TokenWorkflowStage;
  stepNumber: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    id: '1_REGISTRATION',
    stepNumber: 1,
    label: 'Registration',
    icon: User,
    description: 'Patient intake & payment scheme',
  },
  {
    id: '2_NURSING_VITALS',
    stepNumber: 2,
    label: 'Nursing Vitals',
    icon: HeartPulse,
    description: 'Vitals & triage score',
  },
  {
    id: '3_DOCTOR_EMR',
    stepNumber: 3,
    label: 'Doctor EMR',
    icon: Stethoscope,
    description: 'Health summary, diagnosis & CPT orders',
  },
  {
    id: '4_CASHIER_BILLING',
    stepNumber: 4,
    label: 'Cashier Invoicing',
    icon: Receipt,
    description: 'Invoice services & collect payment',
  },
  {
    id: '5_DIAGNOSTICS_PROCEDURES',
    stepNumber: 5,
    label: 'Lab & Radiology',
    icon: FlaskConical,
    description: 'Execute diagnostics & procedures',
  },
  {
    id: '6_COMPLETED_REPORTS',
    stepNumber: 6,
    label: 'Reports Dispatched',
    icon: FileCheck2,
    description: 'Reports sent to doctor EMR & patient',
  },
];

export const TokenWorkflowModal: React.FC<TokenWorkflowModalProps> = ({
  token,
  isOpen,
  onClose,
  onOpenPatientFile,
}) => {
  const {
    updateTokenVitals,
    updateTokenDoctorOrders,
    settleTokenBilling,
    completeTokenDiagnosticReport,
    advanceTokenWorkflow,
    currentUser,
    patients,
  } = useHospital();

  const [activeTab, setActiveTab] = useState<TokenWorkflowStage>('1_REGISTRATION');

  // Step 2: Nurse Vitals Form State
  const [bpSystolic, setBpSystolic] = useState<number>(120);
  const [bpDiastolic, setBpDiastolic] = useState<number>(80);
  const [heartRate, setHeartRate] = useState<number>(75);
  const [spO2, setSpO2] = useState<number>(98);
  const [temperature, setTemperature] = useState<number>(98.6);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(16);
  const [bloodGlucose, setBloodGlucose] = useState<number>(95);
  const [painScale, setPainScale] = useState<number>(0);
  const [triageLevel, setTriageLevel] = useState<TokenVitalsRecord['triageLevel']>('Level 3 - Urgent');
  const [nursingNotes, setNursingNotes] = useState<string>('Patient oriented x3. Ambulatory.');

  // Step 3: Doctor EMR Form State
  const [healthSummary, setHealthSummary] = useState<string>('');
  const [chiefComplaint, setChiefComplaint] = useState<string>('');
  const [clinicalAssessment, setClinicalAssessment] = useState<string>('');
  const [diagnoses, setDiagnoses] = useState<Array<{ code: string; description: string }>>([
    { code: 'I10', description: 'Essential (primary) hypertension' },
  ]);
  const [selectedDiagnosisCode, setSelectedDiagnosisCode] = useState('I10');
  const [consultationFee, setConsultationFee] = useState<number>(200);

  // Diagnostic Orders in EMR
  const [labOrders, setLabOrders] = useState<TokenDoctorOrder['labRequests']>([
    { id: 'L-1', testName: 'Complete Blood Count (CBC with Diff)', category: 'Hematology', price: 45, status: 'Ordered' },
    { id: 'L-2', testName: 'Comprehensive Metabolic Panel (CMP)', category: 'Biochemistry', price: 65, status: 'Ordered' },
  ]);
  const [radiologyOrders, setRadiologyOrders] = useState<TokenDoctorOrder['radiologyRequests']>([
    { id: 'R-1', studyName: 'Chest X-Ray PA & Lateral View', modality: 'Digital Radiography', price: 120, status: 'Ordered' },
  ]);
  const [procedureOrders, setProcedureOrders] = useState<TokenDoctorOrder['procedureRequests']>([
    { id: 'P-1', cptCode: 'CPT 99214', procedureName: 'Office Outpatient Visit Level 4', price: 200, status: 'Completed' },
    { id: 'P-2', cptCode: 'CPT 93000', procedureName: '12-Lead Electrocardiogram (ECG)', price: 95, status: 'Scheduled' },
  ]);

  // Step 4: Cashier Form State
  const [paymentMethod, setPaymentMethod] = useState<TokenBillingSummary['paymentMethod']>('Credit/Debit Card');

  // Step 5: Diagnostics Execution State
  const [diagnosticType, setDiagnosticType] = useState<'Laboratory' | 'Radiology'>('Laboratory');
  const [testOrStudyName, setTestOrStudyName] = useState('Complete Blood Count (CBC with Diff)');
  const [diagnosticFindings, setDiagnosticFindings] = useState('WBC: 6.5 K/uL, Hemoglobin: 14.2 g/dL, Platelets: 245 K/uL. Normal morphology.');
  const [diagnosticImpression, setDiagnosticImpression] = useState('Parameters within normal physiologic limits. No leukocytosis.');
  const [diagnosticResultValue, setDiagnosticResultValue] = useState('WBC 6.5 | Hb 14.2');
  const [diagnosticStatus, setDiagnosticStatus] = useState<TokenDiagnosticReport['status']>('Normal');

  useEffect(() => {
    if (token) {
      setActiveTab(token.currentStage || '1_REGISTRATION');
      if (token.vitals) {
        setBpSystolic(token.vitals.bpSystolic);
        setBpDiastolic(token.vitals.bpDiastolic);
        setHeartRate(token.vitals.heartRate);
        setSpO2(token.vitals.spO2);
        setTemperature(token.vitals.temperature);
        setRespiratoryRate(token.vitals.respiratoryRate);
        if (token.vitals.bloodGlucose) setBloodGlucose(token.vitals.bloodGlucose);
        if (token.vitals.painScale !== undefined) setPainScale(token.vitals.painScale);
        setTriageLevel(token.vitals.triageLevel);
        if (token.vitals.nursingNotes) setNursingNotes(token.vitals.nursingNotes);
      }
      if (token.doctorOrders) {
        setHealthSummary(token.doctorOrders.healthSummary || '');
        setChiefComplaint(token.doctorOrders.chiefComplaint || '');
        setClinicalAssessment(token.doctorOrders.clinicalAssessment || '');
        setDiagnoses(token.doctorOrders.diagnoses || []);
        setConsultationFee(token.doctorOrders.consultationFee || 200);
        if (token.doctorOrders.labRequests?.length) setLabOrders(token.doctorOrders.labRequests);
        if (token.doctorOrders.radiologyRequests?.length) setRadiologyOrders(token.doctorOrders.radiologyRequests);
        if (token.doctorOrders.procedureRequests?.length) setProcedureOrders(token.doctorOrders.procedureRequests);
      }
    }
  }, [token]);

  if (!isOpen || !token) return null;

  const currentStageIndex = STAGES.findIndex((s) => s.id === (token.currentStage || '1_REGISTRATION'));

  // Calculate Cashier Totals
  const currentConsult = token.doctorOrders?.consultationFee || consultationFee;
  const currentLabsTotal = (token.doctorOrders?.labRequests || labOrders).reduce((acc, l) => acc + l.price, 0);
  const currentRadTotal = (token.doctorOrders?.radiologyRequests || radiologyOrders).reduce((acc, r) => acc + r.price, 0);
  const currentProcTotal = (token.doctorOrders?.procedureRequests || procedureOrders).reduce((acc, p) => acc + p.price, 0);
  const subtotal = currentConsult + currentLabsTotal + currentRadTotal + currentProcTotal;

  const scheme = token.paymentScheme || { schemeType: 'Self-Pay' as PaymentSchemeType };
  let insuranceCovered = 0;
  let discountAmount = 0;
  let patientPortion = subtotal;

  if (scheme.schemeType === 'Insurance' || scheme.schemeType === 'Corporate' || scheme.schemeType === 'Package') {
    const cov = scheme.coveragePercent || 80;
    insuranceCovered = Math.round(subtotal * (cov / 100));
    patientPortion = Math.max(0, subtotal - insuranceCovered);
    if (scheme.copayAmount && scheme.copayAmount > 0) {
      patientPortion = scheme.copayAmount;
      insuranceCovered = Math.max(0, subtotal - scheme.copayAmount);
    }
  } else if (scheme.schemeType === 'Discount Card') {
    const disc = scheme.discountPercent || 20;
    discountAmount = Math.round(subtotal * (disc / 100));
    patientPortion = Math.max(0, subtotal - discountAmount);
  }

  // Handle Step 2 Submission (Nursing Vitals)
  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    const vitalsRecord: TokenVitalsRecord = {
      bpSystolic,
      bpDiastolic,
      heartRate,
      spO2,
      temperature,
      respiratoryRate,
      bloodGlucose,
      painScale,
      triageLevel,
      nursingNotes,
      nurseName: currentUser?.name || 'Triage Nurse Staff, RN',
      recordedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
    updateTokenVitals(token.id, vitalsRecord);
    setActiveTab('3_DOCTOR_EMR');
  };

  // Handle Step 3 Submission (Doctor EMR)
  const handleSaveDoctorOrders = (e: React.FormEvent) => {
    e.preventDefault();
    const doctorOrder: TokenDoctorOrder = {
      healthSummary: healthSummary || 'Clinical examination and diagnostic workup initiated.',
      chiefComplaint: chiefComplaint || 'Consultation encounter',
      clinicalAssessment: clinicalAssessment || 'Clinical evaluation performed. Diagnostic requests authorized.',
      diagnoses,
      labRequests: labOrders,
      radiologyRequests: radiologyOrders,
      procedureRequests: procedureOrders,
      consultationFee,
      orderedByDoctorId: token.doctorId || currentUser?.id || 'DOC-DEFAULT',
      orderedByDoctorName: token.doctorName || currentUser?.name || 'Attending Physician, MD',
      orderedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
    updateTokenDoctorOrders(token.id, doctorOrder);
    setActiveTab('4_CASHIER_BILLING');
  };

  // Handle Step 4 Submission (Cashier Billing)
  const handleSettleCashier = () => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const billingSummary: TokenBillingSummary = {
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      subtotal,
      schemeType: scheme.schemeType,
      insuranceCoveredAmount: insuranceCovered,
      discountAmount,
      copayOrSelfPayAmount: patientPortion,
      totalPaid: patientPortion,
      balanceDue: 0,
      paymentMethod,
      paymentStatus: 'Paid',
      receiptNumber: `RCP-${Math.floor(10000 + Math.random() * 90000)}`,
      cashierName: currentUser?.name || 'Cashier Desk Terminal',
      billedAt: now,
    };
    settleTokenBilling(token.id, billingSummary);
    const hasDiagnostics =
      (token.doctorOrders?.labRequests && token.doctorOrders.labRequests.length > 0) ||
      (token.doctorOrders?.radiologyRequests && token.doctorOrders.radiologyRequests.length > 0) ||
      (token.doctorOrders?.procedureRequests && token.doctorOrders.procedureRequests.length > 0);
    setActiveTab(hasDiagnostics ? '5_DIAGNOSTICS_PROCEDURES' : '6_COMPLETED_REPORTS');
  };

  // Handle Step 5 Submission (Diagnostics Execution)
  const handleDispatchReport = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const today = new Date().toISOString().split('T')[0];
    const report: TokenDiagnosticReport = {
      id: `REP-${Date.now().toString().slice(-5)}`,
      testOrStudyName,
      department: diagnosticType === 'Radiology' ? 'Radiology' : 'Laboratory',
      category: diagnosticType === 'Radiology' ? 'Radiology & Imaging' : 'Biochemistry / Hematology',
      cptOrCode: diagnosticType === 'Radiology' ? 'CPT 71046' : 'CPT 85025',
      date: today,
      time: now,
      findings: diagnosticFindings,
      impression: diagnosticImpression,
      resultValue: diagnosticResultValue,
      referenceRange: 'Normal reference limits verified',
      status: diagnosticStatus,
      technicianOrRadiologist: currentUser?.name || (diagnosticType === 'Radiology' ? 'Dr. Katherine Cole, MD (Radiology)' : 'Alex Mercer, MLS(ASCP)'),
      completedAt: now,
      sentToPatient: true,
      sentToDoctor: true,
      sentTimestamp: `${today} ${now}`,
    };
    completeTokenDiagnosticReport(token.id, report);
    setActiveTab('6_COMPLETED_REPORTS');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl my-4 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400 font-bold text-lg">
              {token.tokenNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold tracking-tight text-white">{token.patientName}</h3>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {token.patientId}
                </span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-teal-900/50 text-teal-300 border border-teal-700/50">
                  {token.paymentScheme?.schemeType || 'Self-Pay'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {token.department} • Room/Counter: {token.counterOrRoom} • Doctor: {token.doctorName || 'Assigned on Queue'} • Time: {token.createdTime}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6-Stage Interactive Workflow Stepper Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] gap-2">
            {STAGES.map((s, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = s.id === token.currentStage;
              const isSelected = s.id === activeTab;
              const Icon = s.icon;

              return (
                <button
                  key={s.id}
                  onClick={() => setActiveTab(s.id)}
                  className={`flex-1 flex items-center gap-2 p-2 rounded-lg text-left transition-all border ${
                    isSelected
                      ? 'bg-teal-50/70 border-teal-600 shadow-xs'
                      : isCurrent
                      ? 'bg-amber-50/70 border-amber-400'
                      : isPast
                      ? 'bg-emerald-50/40 border-emerald-300 hover:bg-slate-100'
                      : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isPast
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : s.stepNumber}
                  </div>
                  <div className="min-w-0 pr-1">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{s.label}</p>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{s.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Main Body (Stage specific content) */}
        <div className="flex-1 p-6 overflow-y-auto bg-white">
          {/* STAGE 1: REGISTRATION */}
          {activeTab === '1_REGISTRATION' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-teal-600" />
                    Step 1: Patient Intake & Payment Scheme Registration
                  </h4>
                  <p className="text-sm text-slate-500">
                    Patient demographic check-in, token generation, and payment scheme classification.
                  </p>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                  Registered Successfully
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Patient Profile Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Patient Details</h5>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Full Name:</span>
                      <span className="font-medium text-slate-900">{token.patientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Patient MRN:</span>
                      <span className="font-mono text-slate-900">{token.patientId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phone Contact:</span>
                      <span className="text-slate-900">{token.patientPhone || '+1 (555) 019-2834'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Assigned Department:</span>
                      <span className="font-medium text-slate-900">{token.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Target Physician:</span>
                      <span className="text-slate-900">{token.doctorName || 'Assigned by Queue'}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Scheme Details */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Selected Payment Scheme</h5>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-100 text-teal-800">
                      {scheme.schemeType}
                    </span>
                  </div>

                  {scheme.schemeType === 'Insurance' && (
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Payer / Provider:</span>
                        <span className="font-medium text-slate-900">{scheme.insuranceProvider || 'Blue Cross Blue Shield'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Policy Number:</span>
                        <span className="font-mono text-slate-900">{scheme.policyNumber || 'BCBS-991204'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Network Tier:</span>
                        <span className="text-slate-900">{scheme.network || 'Tier 1 Preferred PPO'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Coverage Level:</span>
                        <span className="font-semibold text-emerald-700">{scheme.coveragePercent || 80}% Insurer Paid</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Copay Payable:</span>
                        <span className="font-semibold text-slate-900">${scheme.copayAmount || 25}</span>
                      </div>
                    </div>
                  )}

                  {scheme.schemeType === 'Corporate' && (
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">Corporate Payer:</span><span className="font-medium text-slate-900">{scheme.corporateName || 'Corporate Account'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Corporate Number:</span><span className="font-mono text-slate-900">{scheme.corporateNumber || 'Not provided'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Coverage Level:</span><span className="font-semibold text-emerald-700">{scheme.coveragePercent || 80}% Corporate Paid</span></div>
                    </div>
                  )}

                  {scheme.schemeType === 'Package' && (
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">Package:</span><span className="font-medium text-slate-900">{scheme.packageName || 'Hospital Package'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Package Number:</span><span className="font-mono text-slate-900">{scheme.packageNumber || 'Not provided'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Coverage Level:</span><span className="font-semibold text-emerald-700">{scheme.coveragePercent || 80}% Package Covered</span></div>
                    </div>
                  )}

                  {scheme.schemeType === 'Discount Card' && (
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Discount Scheme:</span>
                        <span className="font-medium text-slate-900">{scheme.discountCardName || 'Senior Citizen Card (20%)'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Card Identifier:</span>
                        <span className="font-mono text-slate-900">{scheme.discountCardNumber || 'SNR-2026-8891'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Applied Discount:</span>
                        <span className="font-bold text-emerald-700">{scheme.discountPercent || 20}% OFF Total Bill</span>
                      </div>
                    </div>
                  )}

                  {scheme.schemeType === 'Self-Pay' && (
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Billing Responsibility:</span>
                        <span className="font-medium text-slate-900">100% Patient Payable</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Payment Modes Accepted:</span>
                        <span className="text-slate-900">Cash, Debit/Credit Card, HSA, POS</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Estimate Clearance:</span>
                        <span className="text-slate-900">Payable at Step 4 Cashier</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Step Action Prompt */}
              <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-teal-900">Next Action: Step 2 Nursing Staff Vitals</p>
                  <p className="text-xs text-teal-700">Patient has been directed to the Nursing Station for vital signs and initial triage assessment.</p>
                </div>
                <button
                  onClick={() => setActiveTab('2_NURSING_VITALS')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  Proceed to Step 2 (Vitals) <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: NURSING STAFF VITALS */}
          {activeTab === '2_NURSING_VITALS' && (
            <form onSubmit={handleSaveVitals} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-rose-600" />
                    Step 2: Nursing Staff Triage & Vitals Acquisition
                  </h4>
                  <p className="text-sm text-slate-500">
                    Document comprehensive patient vitals, pain index, and clinical urgency score before physician review.
                  </p>
                </div>
                {token.vitals ? (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                    Vitals Recorded
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                    Pending Entry
                  </span>
                )}
              </div>

              {/* Vitals Form Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Blood Pressure (mmHg)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={bpSystolic}
                      onChange={(e) => setBpSystolic(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-md font-semibold text-slate-900"
                      placeholder="Sys"
                      required
                    />
                    <span className="text-slate-400">/</span>
                    <input
                      type="number"
                      value={bpDiastolic}
                      onChange={(e) => setBpDiastolic(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-md font-semibold text-slate-900"
                      placeholder="Dia"
                      required
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-md font-semibold text-slate-900"
                    required
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">SpO2 Oxygen (%)</label>
                  <input
                    type="number"
                    value={spO2}
                    onChange={(e) => setSpO2(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-md font-semibold text-slate-900"
                    required
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Temperature (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-md font-semibold text-slate-900"
                    required
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Respiratory Rate (/min)</label>
                  <input
                    type="number"
                    value={respiratoryRate}
                    onChange={(e) => setRespiratoryRate(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-md font-semibold text-slate-900"
                    required
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Blood Glucose (mg/dL)</label>
                  <input
                    type="number"
                    value={bloodGlucose}
                    onChange={(e) => setBloodGlucose(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-md font-semibold text-slate-900"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Pain Scale (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={painScale}
                    onChange={(e) => setPainScale(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-md font-semibold text-slate-900"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Triage Acuity</label>
                  <select
                    value={triageLevel}
                    onChange={(e) => setTriageLevel(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-md font-semibold text-slate-900"
                  >
                    <option value="Level 1 - Resuscitation">Level 1 - Resuscitation</option>
                    <option value="Level 2 - Emergent">Level 2 - Emergent</option>
                    <option value="Level 3 - Urgent">Level 3 - Urgent</option>
                    <option value="Level 4 - Less Urgent">Level 4 - Less Urgent</option>
                    <option value="Level 5 - Non-Urgent">Level 5 - Non-Urgent</option>
                  </select>
                </div>
              </div>

              {/* Nursing Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nursing Observations & Allergy Check</label>
                <textarea
                  rows={2}
                  value={nursingNotes}
                  onChange={(e) => setNursingNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white text-slate-900"
                  placeholder="Note ambulatory status, distress level, allergy confirmation..."
                />
              </div>

              {/* Submit Vitals Button */}
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save Vitals & Forward to Doctor EMR (Step 3)
                </button>
              </div>
            </form>
          )}

          {/* STAGE 3: DOCTOR EMR */}
          {activeTab === '3_DOCTOR_EMR' && (
            <form onSubmit={handleSaveDoctorOrders} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-indigo-600" />
                    Step 3: Doctor EMR Consultation & Orders Entry
                  </h4>
                  <p className="text-sm text-slate-500">
                    Document clinical assessment, ICD-10 diagnoses, and order diagnostic labs, radiology scans, and procedure CPT codes.
                  </p>
                </div>
                {token.doctorOrders ? (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                    Orders Configured
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                    Consultation Active
                  </span>
                )}
              </div>

              {/* Display Patient's Nursing Vitals Summary right inside Doctor EMR */}
              {token.vitals && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5 text-rose-500" /> Vitals Recorded by Nursing Staff ({token.vitals.nurseName})
                    </span>
                    <span className="text-xs font-semibold text-slate-600">{token.vitals.recordedAt}</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block">BP</span>
                      <span className="font-bold text-slate-800">{token.vitals.bpSystolic}/{token.vitals.bpDiastolic}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block">Heart Rate</span>
                      <span className="font-bold text-slate-800">{token.vitals.heartRate} bpm</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block">SpO2</span>
                      <span className="font-bold text-slate-800">{token.vitals.spO2}%</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block">Temp</span>
                      <span className="font-bold text-slate-800">{token.vitals.temperature}°F</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block">Triage Acuity</span>
                      <span className="font-bold text-amber-700">{token.vitals.triageLevel}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block">Pain</span>
                      <span className="font-bold text-slate-800">{token.vitals.painScale ?? 0}/10</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Clinical Notes & Diagnosis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Chief Complaint & History</label>
                  <input
                    type="text"
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    placeholder="e.g. Retrosternal chest discomfort on exertion..."
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Consultation Charge ($)</label>
                  <input
                    type="number"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Clinical Assessment & Health Summary</label>
                <textarea
                  rows={2}
                  value={clinicalAssessment}
                  onChange={(e) => setClinicalAssessment(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  placeholder="Document physician findings, systemic review, and differential diagnoses..."
                />
              </div>

              {/* Diagnosis ICD-10 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Assigned Diagnoses (ICD-10)</label>
                  <div className="flex gap-2">
                    <select
                      value={selectedDiagnosisCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        setSelectedDiagnosisCode(code);
                        const library: Record<string, string> = {
                          'I10': 'Essential (primary) hypertension',
                          'I20.9': 'Angina pectoris, unspecified',
                          'E11.9': 'Type 2 diabetes mellitus without complications',
                          'J06.9': 'Acute upper respiratory infection, unspecified',
                          'K30': 'Functional dyspepsia',
                          'R51.9': 'Headache, unspecified',
                          'M54.5': 'Low back pain, unspecified',
                        };
                        if (!diagnoses.some((d) => d.code === code)) {
                          setDiagnoses([...diagnoses, { code, description: library[code] || 'Clinical diagnosis' }]);
                        }
                      }}
                      className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md text-slate-800"
                    >
                      <option value="I10">ICD-10 I10 (Hypertension)</option>
                      <option value="I20.9">ICD-10 I20.9 (Angina Pectoris)</option>
                      <option value="E11.9">ICD-10 E11.9 (Type 2 Diabetes)</option>
                      <option value="J06.9">ICD-10 J06.9 (Upper Resp Infection)</option>
                      <option value="K30">ICD-10 K30 (Dyspepsia)</option>
                      <option value="R51.9">ICD-10 R51.9 (Headache)</option>
                      <option value="M54.5">ICD-10 M54.5 (Low Back Pain)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {diagnoses.map((d, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800"
                    >
                      <span className="font-bold">{d.code}</span> - {d.description}
                      <button
                        type="button"
                        onClick={() => setDiagnoses(diagnoses.filter((_, i) => i !== idx))}
                        className="text-indigo-400 hover:text-indigo-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Diagnostic Orders: Labs, Radiology & Procedure CPT */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Labs Column */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <FlaskConical className="w-3.5 h-3.5 text-teal-600" /> Lab Requests ({labOrders.length})
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newId = `L-${Date.now().toString().slice(-4)}`;
                        setLabOrders([
                          ...labOrders,
                          { id: newId, testName: 'Lipid Panel Profile', category: 'Biochemistry', price: 65, status: 'Ordered' },
                        ]);
                      }}
                      className="text-[11px] font-semibold text-teal-700 hover:text-teal-800"
                    >
                      + Add Lab
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {labOrders.map((l) => (
                      <div key={l.id} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                        <div className="truncate pr-2">
                          <p className="font-medium text-slate-800 truncate">{l.testName}</p>
                          <p className="text-[10px] text-slate-500">${l.price} • {l.category}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLabOrders(labOrders.filter((item) => item.id !== l.id))}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Radiology Column */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" /> Radiology Scans ({radiologyOrders.length})
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newId = `R-${Date.now().toString().slice(-4)}`;
                        setRadiologyOrders([
                          ...radiologyOrders,
                          { id: newId, studyName: 'CT Brain Non-Contrast', modality: 'Computed Tomography', price: 280, status: 'Ordered' },
                        ]);
                      }}
                      className="text-[11px] font-semibold text-blue-700 hover:text-blue-800"
                    >
                      + Add Scan
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {radiologyOrders.map((r) => (
                      <div key={r.id} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                        <div className="truncate pr-2">
                          <p className="font-medium text-slate-800 truncate">{r.studyName}</p>
                          <p className="text-[10px] text-slate-500">${r.price} • {r.modality}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRadiologyOrders(radiologyOrders.filter((item) => item.id !== r.id))}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Procedure CPT Column */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-purple-600" /> Procedure CPT ({procedureOrders.length})
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newId = `P-${Date.now().toString().slice(-4)}`;
                        setProcedureOrders([
                          ...procedureOrders,
                          { id: newId, cptCode: 'CPT 94640', procedureName: 'Nebulizer Therapy Treatment', price: 65, status: 'Scheduled' },
                        ]);
                      }}
                      className="text-[11px] font-semibold text-purple-700 hover:text-purple-800"
                    >
                      + Add CPT
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {procedureOrders.map((p) => (
                      <div key={p.id} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                        <div className="truncate pr-2">
                          <p className="font-medium text-slate-800 truncate">
                            <span className="font-mono text-purple-700 font-bold">{p.cptCode}</span> {p.procedureName}
                          </p>
                          <p className="text-[10px] text-slate-500">${p.price}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setProcedureOrders(procedureOrders.filter((item) => item.id !== p.id))}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Forward to Cashier Button */}
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Receipt className="w-4 h-4" /> Save Orders & Forward to Cashier for Invoicing (Step 4)
                </button>
              </div>
            </form>
          )}

          {/* STAGE 4: CASHIER BILLING & INVOICING */}
          {activeTab === '4_CASHIER_BILLING' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-emerald-600" />
                    Step 4: Cashier Counter & Invoice Clearance
                  </h4>
                  <p className="text-sm text-slate-500">
                    Itemize all services ordered by the physician, apply insurance coverage or discount card, and issue payment receipt.
                  </p>
                </div>
                {token.billingSummary ? (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                    Paid & Cleared
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                    Payment Awaiting
                  </span>
                )}
              </div>

              {/* Itemized Services Breakdown */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <span>Service Description</span>
                  <span>Fee ($)</span>
                </div>
                <div className="divide-y divide-slate-100 text-sm">
                  <div className="px-4 py-2.5 flex justify-between">
                    <div>
                      <p className="font-medium text-slate-800">Physician Consultation</p>
                      <p className="text-xs text-slate-500">{token.doctorName || 'Attending Physician'}</p>
                    </div>
                    <span className="font-semibold text-slate-900">${currentConsult.toFixed(2)}</span>
                  </div>

                  {(token.doctorOrders?.labRequests || labOrders).map((l, i) => (
                    <div key={i} className="px-4 py-2.5 flex justify-between">
                      <div>
                        <p className="font-medium text-slate-800">{l.testName}</p>
                        <p className="text-xs text-slate-500">Diagnostic Laboratory ({l.category})</p>
                      </div>
                      <span className="font-semibold text-slate-900">${l.price.toFixed(2)}</span>
                    </div>
                  ))}

                  {(token.doctorOrders?.radiologyRequests || radiologyOrders).map((r, i) => (
                    <div key={i} className="px-4 py-2.5 flex justify-between">
                      <div>
                        <p className="font-medium text-slate-800">{r.studyName}</p>
                        <p className="text-xs text-slate-500">Radiology & Imaging ({r.modality})</p>
                      </div>
                      <span className="font-semibold text-slate-900">${r.price.toFixed(2)}</span>
                    </div>
                  ))}

                  {(token.doctorOrders?.procedureRequests || procedureOrders).map((p, i) => (
                    <div key={i} className="px-4 py-2.5 flex justify-between">
                      <div>
                        <p className="font-medium text-slate-800">{p.procedureName}</p>
                        <p className="text-xs text-purple-700 font-mono font-bold">{p.cptCode}</p>
                      </div>
                      <span className="font-semibold text-slate-900">${p.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Scheme Calculations */}
                <div className="bg-slate-50/80 p-4 border-t border-slate-200 space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Gross Services Subtotal:</span>
                    <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
                  </div>

                  {scheme.schemeType === 'Insurance' && (
                    <div className="flex justify-between text-sm text-emerald-700 font-medium">
                      <span>Insurance Approved Share ({scheme.insuranceProvider}):</span>
                      <span>-${insuranceCovered.toFixed(2)}</span>
                    </div>
                  )}

                  {scheme.schemeType === 'Discount Card' && (
                    <div className="flex justify-between text-sm text-emerald-700 font-medium">
                      <span>Discount Card Benefit ({scheme.discountCardName}):</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Net Patient Responsibility:</span>
                    <span className="text-teal-700 text-lg">${patientPortion.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Mode Selector & Execution */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-slate-600" />
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block">Select Tender / Payment Mode</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="mt-0.5 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
                    >
                      <option value="Credit/Debit Card">Credit/Debit Card (POS)</option>
                      <option value="Cash">Cash at Counter</option>
                      <option value="HSA/FSA">HSA / FSA Card</option>
                      <option value="Direct Insurance">Direct Insurance Claim</option>
                      <option value="Online Gateway">Online Patient Portal</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSettleCashier}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Receipt className="w-4 h-4" /> Collect ${patientPortion.toFixed(2)} & Settle Token
                </button>
              </div>
            </div>
          )}

          {/* STAGE 5: DIAGNOSTICS & PROCEDURES EXECUTION */}
          {activeTab === '5_DIAGNOSTICS_PROCEDURES' && (
            <form onSubmit={handleDispatchReport} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-teal-600" />
                    Step 5: Diagnostic Laboratory & Radiology Execution
                  </h4>
                  <p className="text-sm text-slate-500">
                    Laboratory specimen processing, radiology scan reading, and report generation.
                  </p>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-800">
                  Diagnostics Terminal
                </span>
              </div>

              {/* Department & Test Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Diagnostic Department</label>
                  <select
                    value={diagnosticType}
                    onChange={(e) => {
                      const type = e.target.value as 'Laboratory' | 'Radiology';
                      setDiagnosticType(type);
                      if (type === 'Radiology') {
                        setTestOrStudyName('Chest X-Ray PA & Lateral View');
                        setDiagnosticFindings('No focal consolidation or pleural effusion. Cardiomediastinal silhouette normal.');
                        setDiagnosticImpression('Clear lung fields. No acute cardiopulmonary process.');
                        setDiagnosticResultValue('Clear, normal anatomy');
                      } else {
                        setTestOrStudyName('Complete Blood Count (CBC with Diff)');
                        setDiagnosticFindings('WBC: 6.5 K/uL, Hemoglobin: 14.2 g/dL, Platelets: 245 K/uL. Normal morphology.');
                        setDiagnosticImpression('Parameters within normal physiologic limits. No leukocytosis.');
                        setDiagnosticResultValue('WBC 6.5 | Hb 14.2');
                      }
                    }}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="Laboratory">Laboratory (Hematology / Biochemistry / Pathology)</option>
                    <option value="Radiology">Radiology & Imaging (X-Ray / CT / MRI / Ultrasound)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Test or Study Title</label>
                  <input
                    type="text"
                    value={testOrStudyName}
                    onChange={(e) => setTestOrStudyName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Clinical Finding Status</label>
                  <select
                    value={diagnosticStatus}
                    onChange={(e) => setDiagnosticStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  >
                    <option value="Normal">Normal (Within Reference Limits)</option>
                    <option value="Elevated">Elevated (Mild / Moderate deviation)</option>
                    <option value="Critical">Critical (Stat Alert Notification)</option>
                    <option value="Completed">Completed Study</option>
                  </select>
                </div>
              </div>

              {/* Detailed Findings & Impression */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Analytical Findings & Measurements</label>
                  <textarea
                    rows={2}
                    value={diagnosticFindings}
                    onChange={(e) => setDiagnosticFindings(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    placeholder="Enter specimen assay numbers, radiographic views, density, structural margins..."
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Diagnostic Impression / Conclusion</label>
                  <textarea
                    rows={2}
                    value={diagnosticImpression}
                    onChange={(e) => setDiagnosticImpression(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    placeholder="Clinical conclusion for treating physician..."
                    required
                  />
                </div>
              </div>

              {/* Submit and Dispatch Button */}
              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-teal-900">Immediate Automated Dispatch Rule</p>
                  <p className="text-[11px] text-teal-700">
                    Publishing verifies the report and instantly delivers digital copies to the Patient Portal and Doctor EMR Patient File.
                  </p>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 shadow-xs transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" /> Verify & Dispatch to Doctor EMR & Patient (Step 6)
                </button>
              </div>
            </form>
          )}

          {/* STAGE 6: COMPLETED REPORTS (Date & Department Wise) */}
          {activeTab === '6_COMPLETED_REPORTS' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-emerald-600" />
                    Step 6: Diagnostic Reports Dispatched to Patient & Doctor
                  </h4>
                  <p className="text-sm text-slate-500">
                    Official reports verified, delivered to patient, and visible date- and department-wise inside the Doctor EMR file.
                  </p>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Workflow Complete
                </span>
              </div>

              {/* Delivery Receipt Notification Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-900">Sent to Patient File & SMS Portal</p>
                    <p className="text-[11px] text-emerald-700">Status: Delivered • Encrypted PDF Available</p>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-indigo-900">Synchronized with Doctor EMR</p>
                    <p className="text-[11px] text-indigo-700">
                      Categorized Date-Wise & Department-Wise in Patient File
                    </p>
                  </div>
                </div>
              </div>

              {/* List of Published Reports */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Published Reports for this Visit ({token.diagnosticReports?.length || 0})
                </h5>

                {(!token.diagnosticReports || token.diagnosticReports.length === 0) ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <FlaskConical className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No diagnostic reports published yet</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Return to Step 5 to sign off laboratory or radiology findings for this token.
                    </p>
                    <button
                      onClick={() => setActiveTab('5_DIAGNOSTICS_PROCEDURES')}
                      className="mt-3 px-3 py-1.5 text-xs font-semibold bg-teal-600 text-white rounded-md hover:bg-teal-700"
                    >
                      Enter Step 5 Diagnostics
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {token.diagnosticReports.map((rep) => (
                      <div
                        key={rep.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                                {rep.department}
                              </span>
                              <h6 className="text-sm font-bold text-slate-900">{rep.testOrStudyName}</h6>
                              {rep.cptOrCode && (
                                <span className="text-xs text-slate-500 font-mono">[{rep.cptOrCode}]</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              Date: <strong className="text-slate-700">{rep.date}</strong> at {rep.time || '08:45 AM'} • Specialist: {rep.technicianOrRadiologist}
                            </p>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                              rep.status === 'Normal'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rep.status === 'Critical'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {rep.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div>
                            <span className="font-bold text-slate-700 block mb-0.5">Findings:</span>
                            <p className="text-slate-600">{rep.findings}</p>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 block mb-0.5">Clinical Impression:</span>
                            <p className="text-slate-600">{rep.impression || 'Normal study.'}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                          <span className="flex items-center gap-1 text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Sent to Patient & Doctor: {rep.sentTimestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button to Open Patient File EMR */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">View Patient's Full Diagnostic Timeline</p>
                  <p className="text-xs text-slate-500">
                    Open {token.patientName}'s Medical Record to inspect all diagnostic reports organized date-wise and department-wise.
                  </p>
                </div>
                {onOpenPatientFile && token.patientId && (
                  <button
                    onClick={() => {
                      onOpenPatientFile(token.patientId);
                      onClose();
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-xs shrink-0"
                  >
                    Open Patient File (EMR) <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Token #{token.tokenNumber} • Current Active Stage: <strong className="text-slate-700">{token.currentStage || '1_REGISTRATION'}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
