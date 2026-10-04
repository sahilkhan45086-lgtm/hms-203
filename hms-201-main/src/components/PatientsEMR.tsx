import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Activity,
  Pill,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Video,
  Printer,
  FlaskConical,
  ShieldAlert,
  Stethoscope,
  Clock,
  Send,
  ShieldCheck,
  CircleDollarSign,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { Patient, Prescription, ClinicalNote, PatientService, InsuranceApproval } from '../types';
import { ICD10_COMMON_CODES } from '../data/icd10Codes';
import { PatientDashboard } from './PatientDashboard';
import { PatientDiagnosticReportsView } from './reports/PatientDiagnosticReportsView';
import { TokenWorkflowModal } from './tokens/TokenWorkflowModal';

interface PatientsEMRProps {
  onOpenTriageModal: (patientId: string) => void;
  onStartTelehealth: (patientId: string) => void;
}

export const PatientsEMR: React.FC<PatientsEMRProps> = ({
  onOpenTriageModal,
  onStartTelehealth,
}) => {
  const {
    patients,
    advancePayments,
    receptionTokens,
    selectedPatientId,
    setSelectedPatientId,
    updatePatientStatus,
    updatePatient,
    addClinicalNote,
    addPrescription,
    addNotification,
    insuranceApprovals,
    addInsuranceApproval,
    currentUser,
    currentRole,
  } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [patientViewTab, setPatientViewTab] = useState<'dashboard' | 'previous' | 'notes' | 'prescriptions' | 'services' | 'reports' | 'advances' | 'all'>('dashboard');
  const [doctorWorkflowTokenId, setDoctorWorkflowTokenId] = useState<string | null>(null);
  const [selectedEncounterTokenId, setSelectedEncounterTokenId] = useState<string | null>(null);

  // New Note Form State
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [healthSummary, setHealthSummary] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [selectedIcd10, setSelectedIcd10] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // New Prescription Form State
  const [isAddingRx, setIsAddingRx] = useState(false);
  const [rxDrugName, setRxDrugName] = useState('');
  const [rxDosage, setRxDosage] = useState('');
  const [rxFrequency, setRxFrequency] = useState('');
  const [rxRoute, setRxRoute] = useState('Oral');
  const [rxDuration, setRxDuration] = useState('');
  const [rxInstructions, setRxInstructions] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [serviceCategory, setServiceCategory] = useState<InsuranceApproval['serviceCategory']>('Procedure');
  const [serviceCode, setServiceCode] = useState('');
  const [serviceCost, setServiceCost] = useState('');

  const normalizeClinicianName = (name: string) =>
    name.toLowerCase().replace(/^dr\.?\s*/, '').replace(/,?\s*(md|facs|do|phd)\b/g, '').replace(/[.,]/g, '').trim();
  const isAssignedDoctorToken = (token: (typeof receptionTokens)[number]) =>
    token.doctorId === currentUser.id ||
    normalizeClinicianName(token.doctorName || '') === normalizeClinicianName(currentUser.name);
  const doctorVisitTokens = currentRole === 'doctor'
    ? receptionTokens.filter((token) => token.patientId !== 'WALK-IN' && isAssignedDoctorToken(token))
      .sort((first, second) =>
        (second.visitDate || second.createdDate || '').localeCompare(first.visitDate || first.createdDate || '') ||
        second.createdTime.localeCompare(first.createdTime)
      )
    : [];
  const doctorPatientIds = new Set(doctorVisitTokens.map((token) => token.patientId));
  const assignedPatients = currentRole === 'doctor'
    ? patients.filter((patient) => doctorPatientIds.has(patient.id))
    : patients;
  const selectedPatient = assignedPatients.find((p) => p.id === selectedPatientId) || assignedPatients[0];

  const latestVitals =
    selectedPatient && Array.isArray(selectedPatient.vitals) && selectedPatient.vitals.length > 0
      ? selectedPatient.vitals[0]
      : null;

  const patientAllergies = selectedPatient?.allergies || [];
  const patientConditions = selectedPatient?.chronicConditions || [];
  const patientNotes = selectedPatient?.clinicalNotes || [];
  const previousDoctorNotes = [...patientNotes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const patientVisits = [...(selectedPatient?.facilityVisits || [])].sort(
    (a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
  );
  const patientEncounterTokens = receptionTokens
    .filter((token) => token.patientId === selectedPatient?.id)
    .sort((first, second) =>
      (second.visitDate || second.createdDate || '').localeCompare(first.visitDate || first.createdDate || '') ||
      second.createdTime.localeCompare(first.createdTime)
    );
  const patientVitalsHistory = [...(selectedPatient?.vitals || [])].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  );
  const patientPrescriptions =
    (selectedPatient?.prescriptions && selectedPatient.prescriptions.length > 0
      ? selectedPatient.prescriptions
      : selectedPatient?.medications?.map((m) => ({
          id: m.id,
          medicationName: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration || 'Ongoing',
          instructions: [m.instructions, `Route: ${m.route}`, `Prescribed by ${m.prescribedBy}`]
            .filter(Boolean)
            .join(' · '),
          status: m.status,
        }))) || [];
  const patientServices = selectedPatient?.services || [];
  const selectedEncounterToken = receptionTokens.find((token) =>
    token.id === selectedEncounterTokenId &&
    token.patientId === selectedPatient?.id &&
    (currentRole !== 'doctor' || isAssignedDoctorToken(token))
  );
  const currentVisitToken = selectedEncounterToken || receptionTokens
    .filter((token) =>
      token.patientId === selectedPatient?.id &&
      token.status !== 'Completed' &&
      token.status !== 'Cancelled' &&
      (token.visitDate || token.createdDate) === new Date().toISOString().slice(0, 10) &&
      (currentRole !== 'doctor' || isAssignedDoctorToken(token))
    )
    .sort((first, second) => second.createdTime.localeCompare(first.createdTime))[0];
  const patientAdvancePayments = advancePayments
    .filter((advance) => advance.patientId === selectedPatient?.id)
    .sort((first, second) =>
      second.date.localeCompare(first.date) ||
      second.time.localeCompare(first.time) ||
      second.id.localeCompare(first.id)
    );
  const totalPatientAdvances = patientAdvancePayments.reduce(
    (sum, advance) => sum + Math.max(0, Number(advance.amount) || 0),
    0
  );
  const availablePatientAdvances = patientAdvancePayments.reduce(
    (sum, advance) => sum + Math.max(0, Number(advance.remainingBalance) || 0),
    0
  );
  const canViewPatientBilling = currentRole === 'admin' || currentRole === 'receptionist';
  const patientServiceApprovals = insuranceApprovals.filter((approval) => approval.patientId === selectedPatient?.id);
  const pendingServiceApprovalCount = patientServiceApprovals.filter(
    (approval) => approval.approvalStatus === 'Pending' || approval.approvalStatus === 'Query Raised'
  ).length;
  const approvedServiceApprovalCount = patientServiceApprovals.filter(
    (approval) => approval.approvalStatus === 'Approved'
  ).length;

  const filteredPatients = assignedPatients.filter((p) => {
    const matchesSearch =
      p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery);

    const matchesStatus =
      statusFilter === 'all' || p.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !chiefComplaint.trim() || !healthSummary.trim() || !selectedIcd10) return;

    addClinicalNote(selectedPatient.id, {
      patientId: selectedPatient.id,
      authorName: currentUser.name || 'Dr. Julian Thorne, MD',
      authorRole: currentUser.role || 'Attending Physician',
      encounterTokenId: currentVisitToken?.id,
      chiefComplaint,
      content: healthSummary,
      assessment: healthSummary,
      treatmentPlan,
      diagnosisCode: selectedIcd10.split(' ')[0],
      diagnoses: [selectedIcd10],
      category: 'Medical Report',
    });

    setChiefComplaint('');
    setHealthSummary('');
    setTreatmentPlan('');
    setSelectedIcd10('');
    setIsAddingNote(false);
  };

  const handleCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !rxDrugName.trim()) return;

    addPrescription(selectedPatient.id, {
      patientId: selectedPatient.id,
      medicationName: rxDrugName,
      dosage: rxDosage,
      frequency: rxFrequency,
      route: rxRoute,
      duration: rxDuration,
      instructions: rxInstructions,
      prescribedBy: currentUser.name || 'Dr. Julian Thorne, MD',
      status: 'Active',
    });

    setIsAddingRx(false);
  };

  const handleAddService = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedPatient || !serviceName.trim() || Number(serviceCost) <= 0) return;
    const service: PatientService = {
      id: `SRV-${Date.now()}`,
      name: serviceName.trim(),
      category: serviceCategory,
      serviceCode: serviceCode.trim() || undefined,
      estimatedCost: Number(serviceCost),
      addedAt: new Date().toISOString(),
      addedBy: currentUser.name,
      encounterTokenId: currentVisitToken?.id,
    };
    updatePatient(selectedPatient.id, { services: [...patientServices, service] });
    addNotification('Patient Service Added', `${service.name} added to ${selectedPatient.firstName} ${selectedPatient.lastName}'s record.`, 'info', selectedPatient.id);
    setServiceName('');
    setServiceCode('');
    setServiceCost('');
  };

  const handleRequestServiceAuthorization = (service: PatientService) => {
    const existingApproval = insuranceApprovals.find((approval) => approval.id === service.insuranceApprovalId);
    if (!selectedPatient || (existingApproval && existingApproval.approvalStatus !== 'Rejected')) return;
    const requestDate = new Date().toISOString().slice(0, 10);
    const request = addInsuranceApproval({
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      patientMrn: selectedPatient.rgNo || selectedPatient.id,
      insuranceProvider: selectedPatient.insurance.provider,
      policyNumber: selectedPatient.insurance.policyNumber,
      approvalNumber: `REQ-${Date.now()}`,
      doctorId: selectedPatient.primaryPhysicianId,
      doctorName: currentUser.name,
      department: currentUser.department,
      serviceCategory: service.category,
      serviceName: service.name,
      serviceCode: service.serviceCode,
      estimatedCost: service.estimatedCost,
      approvedAmount: 0,
      copayPercentage: 0,
      copayAmount: 0,
      approvalStatus: 'Pending',
      approvalDate: requestDate,
      validUntil: '',
      authorisedBy: currentUser.name,
      remarks: 'Requested by attending physician; awaiting medical coder review.',
      serviceRecordId: service.id,
      encounterTokenId: service.encounterTokenId,
    });
    if (!request) {
      addNotification('Authorization Request Not Sent', 'Only the assigned doctor can submit a pending insurance authorization request.', 'warning', selectedPatient.id);
      return;
    }
    updatePatient(selectedPatient.id, {
      services: patientServices.map((item) => item.id === service.id ? { ...item, insuranceApprovalId: request.id } : item),
    });
  };

  const handlePrintChart = () => {
    window.print();
  };

  if (currentRole !== 'doctor') {
    return (
      <div className="mx-auto max-w-3xl p-6 lg:p-10">
        <div className="rounded-lg border border-amber-200 bg-white p-6 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-8 w-8 text-amber-600" />
          <h2 className="mt-3 text-base font-bold text-slate-900">Doctor access required</h2>
          <p className="mt-1 text-sm text-slate-600">
            Patient EMR records are available only to the assigned doctor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-4 p-3 sm:p-4 lg:p-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase text-teal-700">Doctor EMR · registered visits</p>
          <h2 className="text-lg font-bold text-slate-950">My registered patient visits</h2>
        </div>
        <button
          type="button"
          onClick={handlePrintChart}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          title="Print selected patient's chart"
        >
          <Printer className="h-4 w-4" />
          <span className="hidden sm:inline">Print chart</span>
        </button>
      </header>

      <section className="overflow-hidden rounded-xl border border-indigo-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-indigo-100 bg-indigo-50/70 p-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-indigo-950">Visits assigned to {currentUser.name}</h3>
            <p className="mt-0.5 text-[10px] text-indigo-800">Use the registration token to document diagnoses, health summary, services, and medical reports.</p>
          </div>
          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-indigo-800">{doctorVisitTokens.length} tokens</span>
        </div>
        {doctorVisitTokens.length ? (
          <div className="flex gap-2 overflow-x-auto p-3">
            {doctorVisitTokens.map((token) => (
              <article key={token.id} className="min-w-64 rounded-lg border border-slate-200 bg-white p-2.5">
                <button type="button" onClick={() => { setSelectedPatientId(token.patientId); setSelectedEncounterTokenId(token.id); }} className="w-full text-left">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-teal-50 px-2 py-1 font-mono text-xs font-bold text-teal-800">{token.tokenNumber}</span>
                    <span className="truncate text-xs font-bold text-slate-900">{token.patientName}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-600">{token.visitDate || token.createdDate} · {token.department}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">{token.status} · {token.currentStage?.replaceAll('_', ' ') || 'Registration'}</p>
                </button>
                <button type="button" onClick={() => { setSelectedPatientId(token.patientId); setSelectedEncounterTokenId(token.id); setDoctorWorkflowTokenId(token.id); }} className="mt-2 w-full rounded-md bg-indigo-700 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-indigo-800">
                  Open Doctor EMR · {token.tokenNumber}
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="p-4 text-xs text-slate-500">No patient registration tokens are assigned to you.</p>
        )}
      </section>

      <TokenWorkflowModal
        token={receptionTokens.find((token) => token.id === doctorWorkflowTokenId) || null}
        isOpen={Boolean(doctorWorkflowTokenId)}
        initialStage="3_DOCTOR_EMR"
        onClose={() => setDoctorWorkflowTokenId(null)}
      />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
        {/* Left Column: Patient Registry List */}
        <aside className="flex max-h-72 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-3 lg:col-span-3 lg:max-h-[calc(100vh-12rem)] lg:self-start">
          <div className="border-b border-slate-200 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900">My patients</h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{filteredPatients.length}</span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">Assigned to {currentUser.name}</p>
          </div>

          {/* Search and Filter */}
          <div className="space-y-2 border-b border-slate-100 p-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                aria-label="Search patients by name, medical record number, or phone"
                placeholder="Search name, MRN, or phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-3 text-xs text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-1" role="group" aria-label="Filter patients by care status">
              {[
                { id: 'all', label: 'All' },
                { id: 'inpatient', label: 'Inpatient' },
                { id: 'outpatient', label: 'Outpatient' },
                { id: 'emergency', label: 'Emergency' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={statusFilter === tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`min-h-8 rounded-md px-2 text-[11px] font-semibold transition ${
                    statusFilter === tab.id
                      ? 'bg-teal-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Patient Cards List */}
          <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto px-2">
            {filteredPatients.length === 0 ? (
              <div className="px-3 py-8 text-center text-xs text-slate-500">
                {currentRole === 'doctor' && assignedPatients.length === 0
                  ? `No patients are assigned to ${currentUser.name}.`
                  : 'No patients match your search or status filter.'}
              </div>
            ) : filteredPatients.map((p) => {
              const isSelected = p.id === selectedPatient?.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelectedPatientId(p.id);
                    setPatientViewTab('dashboard');
                  }}
                  className={`flex w-full items-center justify-between gap-2 border-l-2 p-3 text-left transition ${
                    isSelected
                      ? 'border-l-teal-700 bg-teal-50 text-teal-950'
                      : 'border-l-transparent text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-xs truncate flex items-center gap-1.5">
                      <span>{p.firstName} {p.lastName}</span>
                    </div>
                    <div className="mt-1 truncate font-mono text-[10px] text-slate-500">
                      {p.id} · {p.age}y · {p.gender}
                    </div>
                    {p.latestTriage && (
                      <div className="text-[10px] mt-1 font-semibold flex items-center gap-1">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] ${
                            p.latestTriage.urgencyLevel.includes('Level 1')
                              ? 'bg-rose-600 text-white'
                              : p.latestTriage.urgencyLevel.includes('Level 2')
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.latestTriage.urgencyLevel.split(' - ')[0]}
                        </span>
                        <span className="text-slate-400">NEWS2: {p.latestTriage.newsScore} pts</span>
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded shrink-0 ${
                      p.status === 'Emergency'
                        ? 'bg-rose-100 text-rose-700'
                        : p.status === 'Inpatient'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {p.status}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Column: Detailed Patient EMR Dossier */}
        {selectedPatient ? (
          <div className="min-w-0 space-y-3 lg:col-span-9">
            <section aria-label="Selected patient summary" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-start">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-900">
                    {`${selectedPatient.firstName[0] || ''}${selectedPatient.lastName[0] || ''}`}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h1 className="truncate text-lg font-bold text-slate-950">{selectedPatient.firstName} {selectedPatient.lastName}</h1>
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700">{selectedPatient.id}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600">{selectedPatient.age} years · {selectedPatient.gender} · DOB {selectedPatient.dob}</p>
                    <p className="mt-1 truncate text-[11px] text-slate-500">Attending: {selectedPatient.primaryPhysicianName} · {selectedPatient.insurance.provider || 'Self-pay'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${selectedPatient.status === 'Emergency' ? 'bg-rose-100 text-rose-800' : selectedPatient.status === 'Inpatient' ? 'bg-blue-100 text-blue-800' : selectedPatient.status === 'Discharged' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-800'}`}>
                    {selectedPatient.status}
                  </span>
                  <button type="button" onClick={() => onOpenTriageModal(selectedPatient.id)} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-rose-200 px-2.5 text-[11px] font-semibold text-rose-800 hover:bg-rose-50">
                    <Activity className="h-3.5 w-3.5" /> Triage
                  </button>
                  <button type="button" onClick={() => onStartTelehealth(selectedPatient.id)} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-300 px-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">
                    <Video className="h-3.5 w-3.5" /> Telehealth
                  </button>
                  <label className="sr-only" htmlFor="patient-emr-status">Patient status</label>
                  <select
                    id="patient-emr-status"
                    aria-label="Update patient status"
                    value={selectedPatient.status}
                    onChange={(event) => updatePatientStatus(selectedPatient.id, event.target.value as Patient['status'])}
                    className="h-8 rounded-md border border-slate-300 bg-white px-2 text-[11px] font-semibold text-slate-700"
                  >
                    <option value="Outpatient">Outpatient</option>
                    <option value="Inpatient">Inpatient</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Discharged">Discharged</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-2">
                  <ShieldAlert className={`h-4 w-4 shrink-0 ${patientAllergies.length ? 'text-rose-600' : 'text-emerald-600'}`} />
                  <span className="shrink-0 text-[10px] font-bold uppercase text-slate-600">Allergies</span>
                  <span className={`truncate text-xs ${patientAllergies.length ? 'font-semibold text-rose-800' : 'text-slate-600'}`}>
                    {patientAllergies.length ? patientAllergies.map((allergy) => typeof allergy === 'string' ? allergy : allergy.allergen).join(', ') : 'None recorded'}
                  </span>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <Activity className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <span className="shrink-0 text-[10px] font-bold uppercase text-slate-600">Conditions</span>
                  <span className="truncate text-xs text-slate-700">{patientConditions.length ? patientConditions.join(', ') : 'None recorded'}</span>
                </div>
              </div>
              <dl className="grid grid-cols-2 divide-y divide-slate-100 border-t border-slate-100 sm:grid-cols-5 sm:divide-x sm:divide-y-0">
                <div className="p-3"><dt className="text-[10px] font-semibold uppercase text-slate-500">Blood pressure</dt><dd className="mt-1 font-mono text-sm font-bold text-slate-900">{latestVitals ? `${latestVitals.bloodPressureSys}/${latestVitals.bloodPressureDia}` : 'Not recorded'}</dd></div>
                <div className="p-3"><dt className="text-[10px] font-semibold uppercase text-slate-500">Pulse</dt><dd className="mt-1 font-mono text-sm font-bold text-slate-900">{latestVitals ? `${latestVitals.heartRate} bpm` : 'Not recorded'}</dd></div>
                <div className="p-3"><dt className="text-[10px] font-semibold uppercase text-slate-500">Oxygen</dt><dd className="mt-1 font-mono text-sm font-bold text-slate-900">{latestVitals ? `${latestVitals.spO2}%` : 'Not recorded'}</dd></div>
                <div className="p-3"><dt className="text-[10px] font-semibold uppercase text-slate-500">Temperature</dt><dd className="mt-1 font-mono text-sm font-bold text-slate-900">{latestVitals ? `${latestVitals.temperature}°F` : 'Not recorded'}</dd></div>
                <div className="p-3"><dt className="text-[10px] font-semibold uppercase text-slate-500">Respiratory rate</dt><dd className="mt-1 font-mono text-sm font-bold text-slate-900">{latestVitals ? `${latestVitals.respiratoryRate}/min` : 'Not recorded'}</dd></div>
              </dl>
            </section>

            {/* EMR Sub-Navigation Tabs */}
            <nav aria-label="Patient record sections" className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm [&>button]:shrink-0 [&>button]:whitespace-nowrap">
                <button
                  type="button"
              aria-pressed={patientViewTab === 'dashboard'}
                  onClick={() => setPatientViewTab('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    patientViewTab === 'dashboard'
                      ? 'bg-teal-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </button>

                <button
                  type="button"
                  aria-pressed={patientViewTab === 'previous'}
                  onClick={() => setPatientViewTab('previous')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    patientViewTab === 'previous'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>History ({patientVisits.length + patientNotes.length})</span>
                </button>

                <button
                  type="button"
                  aria-pressed={patientViewTab === 'notes'}
                  onClick={() => setPatientViewTab('notes')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    patientViewTab === 'notes'
                      ? 'bg-teal-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Notes ({patientNotes.length})</span>
                </button>

                <button
                  type="button"
                  aria-pressed={patientViewTab === 'prescriptions'}
                  onClick={() => setPatientViewTab('prescriptions')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    patientViewTab === 'prescriptions'
                      ? 'bg-teal-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Pill className="w-3.5 h-3.5" />
                  <span>Meds ({patientPrescriptions.length})</span>
                </button>

                <button
                  type="button"
                  aria-pressed={patientViewTab === 'services'}
                  onClick={() => setPatientViewTab('services')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    patientViewTab === 'services'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <CircleDollarSign className="w-3.5 h-3.5" />
                  <span>Facility &amp; insurance ({patientServices.length})</span>
                </button>

                {canViewPatientBilling && (
                  <button
                    type="button"
                    aria-pressed={patientViewTab === 'advances'}
                    onClick={() => setPatientViewTab('advances')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      patientViewTab === 'advances'
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <CircleDollarSign className="w-3.5 h-3.5" />
                    <span>Advances ({patientAdvancePayments.length})</span>
                  </button>
                )}

                <button
                  type="button"
                  aria-pressed={patientViewTab === 'reports'}
                  onClick={() => setPatientViewTab('reports')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    patientViewTab === 'reports'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Reports ({selectedPatient?.labResults?.length || 0})</span>
                </button>

                <button
                  type="button"
                  aria-pressed={patientViewTab === 'all'}
                  onClick={() => setPatientViewTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    patientViewTab === 'all'
                      ? 'bg-teal-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>Full chart</span>
                </button>
            </nav>

            {patientViewTab === 'advances' && canViewPatientBilling && (
              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Patient advance deposits</h3>
                      <p className="mt-0.5 text-xs text-slate-500">Receipts listed by collection date. Available funds can be applied during invoice settlement.</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase text-slate-500">Total collected</p>
                        <p className="mt-0.5 font-mono text-sm font-bold text-slate-900">${totalPatientAdvances.toFixed(2)}</p>
                      </div>
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase text-emerald-700">Available balance</p>
                        <p className="mt-0.5 font-mono text-sm font-bold text-emerald-800">${availablePatientAdvances.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {patientAdvancePayments.length === 0 ? (
                  <p className="p-5 text-center text-xs text-slate-500">No advance deposits have been collected for this patient.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-xs">
                      <thead className="bg-white text-[10px] font-bold uppercase text-slate-500">
                        <tr>
                          <th className="px-3 py-2.5">Collection date</th>
                          <th className="px-3 py-2.5">Receipt</th>
                          <th className="px-3 py-2.5">Purpose</th>
                          <th className="px-3 py-2.5">Payment method</th>
                          <th className="px-3 py-2.5 text-right">Collected</th>
                          <th className="px-3 py-2.5 text-right">Available</th>
                          <th className="px-3 py-2.5">Utilized date & amount</th>
                          <th className="px-3 py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {patientAdvancePayments.map((advance) => (
                          <tr key={advance.id}>
                            <td className="whitespace-nowrap px-3 py-2.5 font-mono text-slate-700">{advance.date}{advance.time ? ` · ${advance.time}` : ''}</td>
                            <td className="px-3 py-2.5 font-mono font-semibold text-slate-800">{advance.receiptNumber}</td>
                            <td className="px-3 py-2.5 text-slate-700">{advance.purpose}</td>
                            <td className="px-3 py-2.5 text-slate-700">{advance.paymentMethod}</td>
                            <td className="px-3 py-2.5 text-right font-mono font-semibold text-slate-800">${Number(advance.amount).toFixed(2)}</td>
                            <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-700">${Number(advance.remainingBalance).toFixed(2)}</td>
                            <td className="px-3 py-2.5">
                              {advance.utilizationHistory?.length ? (
                                <div className="space-y-0.5">
                                  {[...advance.utilizationHistory]
                                    .sort((first, second) => second.date.localeCompare(first.date))
                                    .map((utilization) => (
                                      <p key={`${utilization.transactionId}-${utilization.date}`} className="whitespace-nowrap text-[10px] text-slate-700">
                                        {new Date(utilization.date).toLocaleString()} · <span className="font-mono font-semibold">${utilization.amount.toFixed(2)}</span>
                                        <span className="ml-1 font-mono text-slate-400">{utilization.invoiceId}</span>
                                      </p>
                                    ))}
                                </div>
                              ) : <span className="text-slate-400">Not utilized</span>}
                            </td>
                            <td className="px-3 py-2.5 text-slate-700">{advance.status}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-bold">
                          <td className="px-3 py-2.5 text-slate-700" colSpan={4}>Total</td>
                          <td className="px-3 py-2.5 text-right font-mono text-slate-900">${totalPatientAdvances.toFixed(2)}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-emerald-800">${availablePatientAdvances.toFixed(2)}</td>
                          <td className="px-3 py-2.5 text-slate-600" colSpan={2}>{patientAdvancePayments.length} receipts</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {patientViewTab === 'services' && (
              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-col justify-between gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Facility Services &amp; Insurance Authorizations</h3>
                    <p className="mt-0.5 text-xs text-slate-500">Record facility care and request payer pre-authorization for medical coder review.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] font-semibold">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">{patientServices.length} services</span>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">{pendingServiceApprovalCount} pending / queried</span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800">{approvedServiceApprovalCount} approved</span>
                  </div>
                </div>

                <form onSubmit={handleAddService} className="mb-4 grid grid-cols-1 gap-2 rounded-lg bg-slate-50 p-3 sm:grid-cols-2 xl:grid-cols-5">
                  <label className="text-[11px] font-semibold text-slate-700 sm:col-span-2 xl:col-span-1">
                    Service name
                    <input required value={serviceName} onChange={(event) => setServiceName(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs font-normal" placeholder="e.g. MRI Knee" />
                  </label>
                  <label className="text-[11px] font-semibold text-slate-700">
                    Category
                    <select value={serviceCategory} onChange={(event) => setServiceCategory(event.target.value as InsuranceApproval['serviceCategory'])} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs font-normal">
                      {(['Procedure', 'Lab Test', 'Radiology', 'Consultation', 'IPD Admission'] as const).map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </label>
                  <label className="text-[11px] font-semibold text-slate-700">
                    Service code
                    <input value={serviceCode} onChange={(event) => setServiceCode(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs font-normal" placeholder="Optional" />
                  </label>
                  <label className="text-[11px] font-semibold text-slate-700">
                    Estimated cost ($)
                    <input required type="number" min="0.01" step="0.01" value={serviceCost} onChange={(event) => setServiceCost(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs font-normal" />
                  </label>
                  <div className="flex items-end sm:col-span-2 xl:col-span-1">
                    <button type="submit" className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-blue-700 px-3 py-2 text-xs font-bold text-white hover:bg-blue-800">
                      <Plus className="h-3.5 w-3.5" /> Add service
                    </button>
                  </div>
                </form>

                {patientServices.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-300 px-3 py-8 text-center text-xs text-slate-500">No services have been added to this patient record.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {[...patientServices].reverse().map((service) => {
                      const approval = patientServiceApprovals.find((item) => item.id === service.insuranceApprovalId);
                      return (
                        <article key={service.id} className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900">{service.name}</h4>
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{service.category}</span>
                              {service.serviceCode && <span className="font-mono text-[10px] text-slate-500">{service.serviceCode}</span>}
                            </div>
                            <p className="mt-1 text-[11px] text-slate-600">Estimated ${service.estimatedCost.toFixed(2)} · Added by {service.addedBy} · {new Date(service.addedAt).toLocaleDateString()}</p>
                            {approval && (
                              <div className="mt-1 space-y-0.5 text-[10px] text-slate-500">
                                <p>{approval.approvalNumber || 'Authorization pending'} · {approval.insuranceProvider} · Policy {approval.policyNumber || 'not recorded'}</p>
                                {approval.approvalStatus === 'Approved' && <p>Approved ${approval.approvedAmount.toFixed(2)} · {approval.copayPercentage}% copay (${approval.copayAmount.toFixed(2)}) · Valid until {approval.validUntil || 'not specified'}</p>}
                                {approval.remarks && <p>{approval.remarks}</p>}
                              </div>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {approval && approval.approvalStatus !== 'Rejected' ? (
                              <span className={`rounded border px-2.5 py-1 text-[10px] font-bold ${
                                approval.approvalStatus === 'Approved' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' :
                                approval.approvalStatus === 'Pending' ? 'border-amber-200 bg-amber-50 text-amber-800' :
                                approval.approvalStatus === 'Query Raised' ? 'border-orange-200 bg-orange-50 text-orange-800' :
                                'border-rose-200 bg-rose-50 text-rose-800'
                              }`}>
                                {approval.approvalStatus}
                              </span>
                            ) : (
                              <button type="button" onClick={() => handleRequestServiceAuthorization(service)} className="inline-flex items-center gap-1.5 rounded-md border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800 hover:bg-teal-100">
                                <ShieldCheck className="h-3.5 w-3.5" /> {approval ? 'Request again' : 'Request authorization'}
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* TAB 1: PATIENT DASHBOARD (Health Trends, Lab Results, Upcoming Appointments) */}
            {(patientViewTab === 'dashboard' || patientViewTab === 'all') && (
              <>
                <PatientDashboard
                  patient={selectedPatient}
                  onOpenTriageModal={onOpenTriageModal}
                  onStartTelehealth={onStartTelehealth}
                  onNavigateToNotes={() => setPatientViewTab('notes')}
                  onNavigateToPrescriptions={() => setPatientViewTab('prescriptions')}
                  onNavigateToReports={() => setPatientViewTab('reports')}
                />

                {patientViewTab === 'dashboard' && (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Users className="h-4 w-4 text-teal-700" />
                        <h3 className="text-sm font-bold text-slate-900">Registered Patient Details</h3>
                      </div>
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        <div><dt className="text-slate-500">Medical record no.</dt><dd className="font-semibold text-slate-900">{selectedPatient.id}</dd></div>
                        <div><dt className="text-slate-500">Date of birth</dt><dd className="font-semibold text-slate-900">{selectedPatient.dob} · {selectedPatient.age}y</dd></div>
                        <div><dt className="text-slate-500">Gender</dt><dd className="font-semibold text-slate-900">{selectedPatient.gender}</dd></div>
                        <div><dt className="text-slate-500">Blood group</dt><dd className="font-semibold text-slate-900">{selectedPatient.bloodGroup}</dd></div>
                        <div><dt className="text-slate-500">Phone</dt><dd className="font-semibold text-slate-900">{selectedPatient.phone || 'Not recorded'}</dd></div>
                        <div><dt className="text-slate-500">Email</dt><dd className="font-semibold text-slate-900 break-all">{selectedPatient.email || 'Not recorded'}</dd></div>
                        <div className="col-span-2"><dt className="text-slate-500">Address</dt><dd className="font-semibold text-slate-900">{selectedPatient.address || 'Not recorded'}</dd></div>
                      </dl>
                    </section>

                    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <FlaskConical className="h-4 w-4 text-teal-700" />
                          <h3 className="text-sm font-bold text-slate-900">Lab & Radiology</h3>
                        </div>
                        <button type="button" onClick={() => setPatientViewTab('reports')} className="text-xs font-semibold text-teal-700 hover:text-teal-900">
                          All reports
                        </button>
                      </div>
                      {selectedPatient.labResults.length === 0 ? (
                        <p className="py-3 text-xs text-slate-500">No lab or radiology reports recorded.</p>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {[...selectedPatient.labResults]
                            .sort((a, b) => (b.resultDate || b.orderedDate).localeCompare(a.resultDate || a.orderedDate))
                            .slice(0, 4)
                            .map((report) => (
                              <div key={report.id} className="py-2 first:pt-0 last:pb-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-xs font-semibold text-slate-900">{report.testName}</p>
                                  <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">{report.status}</span>
                                </div>
                                <p className="mt-0.5 text-[11px] text-slate-500">{report.department || report.category} · {report.resultDate || report.orderedDate}</p>
                                <p className="mt-0.5 text-xs text-slate-700">{report.impression || report.findings || report.value}</p>
                              </div>
                            ))}
                        </div>
                      )}
                    </section>

                    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-emerald-700" />
                          <h3 className="text-sm font-bold text-slate-900">Prescriptions</h3>
                        </div>
                        <button type="button" onClick={() => setPatientViewTab('prescriptions')} className="text-xs font-semibold text-teal-700 hover:text-teal-900">
                          Manage
                        </button>
                      </div>
                      {patientPrescriptions.length === 0 ? (
                        <p className="py-3 text-xs text-slate-500">No prescriptions recorded.</p>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {patientPrescriptions.slice(0, 4).map((prescription, index) => (
                            <div key={prescription.id || `${prescription.medicationName}-${index}`} className="py-2 first:pt-0 last:pb-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-900">{prescription.medicationName}</p>
                                <span className="text-[10px] font-semibold text-emerald-700">{prescription.status || 'Active'}</span>
                              </div>
                              <p className="mt-0.5 text-[11px] text-slate-600">{prescription.dosage} · {prescription.frequency} · {prescription.duration || 'Ongoing'}</p>
                              {prescription.instructions && <p className="mt-0.5 text-[11px] text-slate-500">{prescription.instructions}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-teal-700" />
                          <h3 className="text-sm font-bold text-slate-900">Medical Reports</h3>
                        </div>
                        <button type="button" onClick={() => setPatientViewTab('notes')} className="text-xs font-semibold text-teal-700 hover:text-teal-900">
                          All notes
                        </button>
                      </div>
                      {patientNotes.length === 0 ? (
                        <p className="py-3 text-xs text-slate-500">No medical reports or clinical notes recorded.</p>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {patientNotes.slice(0, 3).map((note) => (
                            <div key={note.id} className="py-2 first:pt-0 last:pb-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-900">{note.chiefComplaint || note.category || 'Clinical report'}</p>
                                <span className="shrink-0 text-[10px] text-slate-500">{note.date}</span>
                              </div>
                              <p className="mt-0.5 text-[11px] text-slate-700">{note.assessment || note.content || 'Report recorded.'}</p>
                              {(note.diagnoses?.length || note.diagnosisCode) && (
                                <p className="mt-0.5 text-[10px] font-medium text-teal-800">Diagnosis: {note.diagnoses?.join(', ') || note.diagnosisCode}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  </div>
                )}
              </>
            )}

            {/* TAB: DIAGNOSTIC & CLINICAL REPORTS (DATE & DEPARTMENT-WISE) */}
            {(patientViewTab === 'reports' || patientViewTab === 'all') && (
              <div className="space-y-4">
                <PatientDiagnosticReportsView patient={selectedPatient} />
              </div>
            )}

            {patientViewTab === 'previous' && (
              <div className="space-y-4">
                <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex flex-col gap-1 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Previous Doctor EMR</h3>
                      <p className="text-xs text-slate-500">
                        {selectedPatient.firstName} {selectedPatient.lastName} · {selectedPatient.id}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-500">{patientVisits.length + patientEncounterTokens.length} encounters · {patientNotes.length} clinical notes</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <div>
                      <h4 className="mb-2 text-xs font-bold uppercase text-slate-700">Patient Visit Tokens</h4>
                      {patientEncounterTokens.length === 0 ? (
                        <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">No registered visit tokens are recorded for this patient.</p>
                      ) : (
                        <div className="mb-4 max-h-[34rem] space-y-3 overflow-y-auto pr-1">
                          {patientEncounterTokens.map((token) => (
                            <article key={token.id} className="rounded-lg border border-blue-200 bg-blue-50/30 p-3 text-xs">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h5 className="font-bold text-slate-900">Token {token.tokenNumber} · {token.registrationSource || 'Visit'}</h5>
                                  <p className="mt-0.5 text-[11px] text-slate-600">{token.doctorName || 'Clinician not assigned'} · {token.department} · {token.serviceType}</p>
                                </div>
                                <span className="shrink-0 rounded bg-white px-2 py-1 text-[10px] font-semibold text-slate-600">{token.status}</span>
                              </div>
                              <p className="mt-2 text-slate-700">{token.visitPurpose || token.visitComplaint || 'Visit reason not recorded'}</p>
                              <p className="mt-1 text-[10px] text-slate-500">
                                {token.visitDate || token.createdDate || 'Date not recorded'} · {token.createdTime} · {token.currentStage || '1_REGISTRATION'}
                                {token.bookingChannel ? ` · Booked via ${token.bookingChannel}` : ''}
                              </p>
                              {token.vitals && (
                                <p className="mt-2 rounded bg-white p-2 text-[11px] text-slate-700">
                                  Nursing: BP {token.vitals.bpSystolic}/{token.vitals.bpDiastolic} · HR {token.vitals.heartRate} · SpO2 {token.vitals.spO2}% · {token.vitals.triageLevel}
                                </p>
                              )}
                              {token.doctorOrders && (
                                <div className="mt-2 rounded bg-white p-2 text-[11px] text-slate-700">
                                  <p><strong>Doctor:</strong> {token.doctorOrders.orderedByDoctorName} · {token.doctorOrders.clinicalAssessment || token.doctorOrders.healthSummary || 'Assessment not recorded'}</p>
                                  <p className="mt-1"><strong>Diagnosis:</strong> {token.doctorOrders.diagnoses.map((diagnosis) => `${diagnosis.code} ${diagnosis.description}`).join(', ') || 'Not recorded'}</p>
                                  <p className="mt-1"><strong>Lab / Radiology:</strong> {[...token.doctorOrders.labRequests.map((order) => order.testName), ...token.doctorOrders.radiologyRequests.map((order) => order.studyName)].join(', ') || 'None ordered'}</p>
                                </div>
                              )}
                              {token.billingSummary && (
                                <p className="mt-2 rounded bg-white p-2 text-[11px] text-slate-700">
                                  Cashier: {token.billingSummary.cashierName} · ${token.billingSummary.totalPaid.toFixed(2)} paid · {token.billingSummary.paymentStatus}
                                </p>
                              )}
                              {token.diagnosticReports?.map((report) => (
                                <p key={report.id} className="mt-2 rounded bg-white p-2 text-[11px] text-slate-700">
                                  {report.department}: {report.testOrStudyName} · {report.status} · {report.impression || report.findings}
                                </p>
                              ))}
                              {token.historyLogs && token.historyLogs.length > 0 && (
                                <details className="mt-2">
                                  <summary className="cursor-pointer text-[10px] font-semibold text-blue-800">Visit activity ({token.historyLogs.length})</summary>
                                  <ol className="mt-2 space-y-1 border-l border-blue-200 pl-3">
                                    {token.historyLogs.map((log, index) => (
                                      <li key={`${token.id}-log-${index}`} className="text-[10px] text-slate-600">
                                        {log.timestamp} · {log.actor}: {log.action}
                                      </li>
                                    ))}
                                  </ol>
                                </details>
                              )}
                            </article>
                          ))}
                        </div>
                      )}

                      <h4 className="mb-2 text-xs font-bold uppercase text-slate-700">Past Doctor Visits</h4>
                      {patientVisits.length === 0 ? (
                        <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">No previous doctor visits are recorded for this patient.</p>
                      ) : (
                        <div className="max-h-[34rem] space-y-3 overflow-y-auto pr-1">
                          {patientVisits.map((visit) => (
                            <article key={visit.id} className="rounded-lg border border-slate-200 p-3 text-xs">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h5 className="font-bold text-slate-900">{visit.visitType}</h5>
                                  <p className="mt-0.5 text-[11px] text-slate-600">{visit.doctorName} · {visit.doctorSpecialty}</p>
                                </div>
                                <time className="shrink-0 rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">{visit.visitDate}</time>
                              </div>
                              <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <div><dt className="text-[10px] font-semibold uppercase text-slate-500">Chief complaint</dt><dd className="mt-0.5 text-slate-800">{visit.chiefComplaint}</dd></div>
                                <div><dt className="text-[10px] font-semibold uppercase text-slate-500">Diagnosis</dt><dd className="mt-0.5 text-slate-800">{visit.primaryDiagnosis.code} · {visit.primaryDiagnosis.description}</dd></div>
                                <div className="sm:col-span-2"><dt className="text-[10px] font-semibold uppercase text-slate-500">Assessment</dt><dd className="mt-0.5 text-slate-700">{visit.clinicalAssessment}</dd></div>
                              </dl>
                              <div className="mt-3 rounded-md bg-slate-50 p-2">
                                <p className="mb-1 text-[10px] font-semibold uppercase text-slate-500">Visit vitals</p>
                                <p className="text-[11px] text-slate-700">BP {visit.vitalsSnapshot.bloodPressure} · HR {visit.vitalsSnapshot.heartRate} · SpO2 {visit.vitalsSnapshot.spO2}% · Temp {visit.vitalsSnapshot.temperature}°F · RR {visit.vitalsSnapshot.respiratoryRate}</p>
                              </div>
                              {(visit.medicationsPrescribed.length > 0 || visit.diagnosticOrders.length > 0) && (
                                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                  {visit.medicationsPrescribed.length > 0 && <div><p className="text-[10px] font-semibold uppercase text-slate-500">Medications</p><p className="mt-0.5 text-[11px] text-slate-700">{visit.medicationsPrescribed.join(', ')}</p></div>}
                                  {visit.diagnosticOrders.length > 0 && <div><p className="text-[10px] font-semibold uppercase text-slate-500">Diagnostic orders</p><p className="mt-0.5 text-[11px] text-slate-700">{visit.diagnosticOrders.join(', ')}</p></div>}
                                </div>
                              )}
                              <p className="mt-2 text-[10px] text-slate-500">{visit.department} · {visit.clinicRoom} · {visit.disposition}</p>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="mb-2 text-xs font-bold uppercase text-slate-700">Previous Clinical Notes</h4>
                      {previousDoctorNotes.length === 0 ? (
                        <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">No previous doctor notes are recorded for this patient.</p>
                      ) : (
                        <div className="max-h-[34rem] space-y-3 overflow-y-auto pr-1">
                          {previousDoctorNotes.map((note) => (
                            <article key={note.id} className="rounded-lg border border-slate-200 p-3 text-xs">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h5 className="font-bold text-slate-900">{note.category || 'Clinical Note'}</h5>
                                  <p className="mt-0.5 text-[11px] text-slate-600">{note.authorName || note.doctorName || 'Attending Physician'} · {note.authorRole || note.doctorSpecialty || 'Clinical Staff'}</p>
                                </div>
                                <time className="shrink-0 rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">{note.date}</time>
                              </div>
                              {note.chiefComplaint && <p className="mt-2"><span className="font-semibold text-slate-600">Chief complaint:</span> {note.chiefComplaint}</p>}
                              <p className="mt-2 leading-relaxed text-slate-700">{note.assessment || note.content || 'No assessment documented.'}</p>
                              {(note.diagnoses?.length || note.diagnosisCode) && <p className="mt-2 text-teal-800"><span className="font-semibold">Diagnosis:</span> {note.diagnoses?.join(', ') || note.diagnosisCode}</p>}
                              {note.treatmentPlan && <p className="mt-2 text-slate-700"><span className="font-semibold text-slate-600">Plan:</span> {note.treatmentPlan}</p>}
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            )}

            {patientViewTab === 'all' && (
              <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FileText className="h-4 w-4 text-teal-700" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Longitudinal Patient Repository</h3>
                    <p className="text-[11px] text-slate-500">Medical history, encounters, and recorded vital signs</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                    <h4 className="mb-2 text-xs font-bold text-slate-800">Medical History</h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase text-slate-500">Chronic conditions</p>
                        {patientConditions.length ? (
                          <div className="flex flex-wrap gap-1">
                            {patientConditions.map((condition) => (
                              <span key={condition} className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-900">{condition}</span>
                            ))}
                          </div>
                        ) : <p className="text-slate-500">None recorded</p>}
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase text-slate-500">Allergies</p>
                        {patientAllergies.length ? (
                          <div className="flex flex-wrap gap-1">
                            {patientAllergies.map((allergy, index) => {
                              const label = typeof allergy === 'string' ? allergy : `${allergy.allergen} (${allergy.severity})`;
                              return <span key={`${label}-${index}`} className="rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-rose-800">{label}</span>;
                            })}
                          </div>
                        ) : <p className="text-slate-500">No known allergies recorded</p>}
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase text-slate-500">Diagnoses</p>
                        {selectedPatient.diagnoses?.length ? (
                          <ul className="space-y-1 text-slate-700">
                            {selectedPatient.diagnoses.map((diagnosis) => (
                              <li key={diagnosis.id}><span className="font-semibold">{diagnosis.icdCode}</span> · {diagnosis.description} <span className="text-slate-500">({diagnosis.status})</span></li>
                            ))}
                          </ul>
                        ) : <p className="text-slate-500">No structured diagnoses recorded</p>}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                    <h4 className="mb-2 text-xs font-bold text-slate-800">Past Visits ({patientVisits.length})</h4>
                    {patientVisits.length ? (
                      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                        {patientVisits.map((visit) => (
                          <article key={visit.id} className="border-l-2 border-teal-600 pl-2.5 text-xs">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-slate-900">{visit.visitType}</p>
                              <time className="shrink-0 text-[10px] text-slate-500">{visit.visitDate}</time>
                            </div>
                            <p className="text-[11px] text-slate-600">{visit.department} · {visit.doctorName}</p>
                            <p className="mt-0.5 text-slate-700">{visit.chiefComplaint}</p>
                            <p className="mt-0.5 text-[11px] text-slate-600">Diagnosis: {visit.primaryDiagnosis.code} · {visit.primaryDiagnosis.description}</p>
                            {visit.clinicalAssessment && <p className="mt-0.5 text-[11px] text-slate-600">{visit.clinicalAssessment}</p>}
                          </article>
                        ))}
                      </div>
                    ) : <p className="py-2 text-xs text-slate-500">No past visits recorded.</p>}
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                    <h4 className="mb-2 text-xs font-bold text-slate-800">Recorded Vitals ({patientVitalsHistory.length})</h4>
                    {patientVitalsHistory.length ? (
                      <div className="max-h-72 overflow-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead className="sticky top-0 bg-slate-100 text-[9px] uppercase text-slate-500">
                            <tr>
                              <th className="p-1.5">Recorded</th>
                              <th className="p-1.5">BP</th>
                              <th className="p-1.5">HR</th>
                              <th className="p-1.5">SpO2</th>
                              <th className="p-1.5">Temp</th>
                              <th className="p-1.5">RR</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-slate-700">
                            {patientVitalsHistory.map((vital, index) => (
                              <tr key={`${vital.recordedAt}-${index}`}>
                                <td className="whitespace-nowrap p-1.5">{new Date(vital.recordedAt).toLocaleString()}</td>
                                <td className="p-1.5">{vital.bloodPressureSys}/{vital.bloodPressureDia}</td>
                                <td className="p-1.5">{vital.heartRate}</td>
                                <td className="p-1.5">{vital.spO2}%</td>
                                <td className="p-1.5">{vital.temperature}°F</td>
                                <td className="p-1.5">{vital.respiratoryRate}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : <p className="py-2 text-xs text-slate-500">No recorded vital signs.</p>}
                  </div>
                </div>
              </section>
            )}

            {/* TAB 2: Clinical Encounter & Physician Progress Notes */}
            {(patientViewTab === 'notes' || patientViewTab === 'all') && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                      Medical Reports & Clinical Notes ({patientNotes.length})
                    </h4>
                  </div>
                <button
                  onClick={() => setIsAddingNote(!isAddingNote)}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isAddingNote ? 'Cancel Report' : 'Create Medical Report'}</span>
                </button>
              </div>

              {isAddingNote && (
                <form onSubmit={handleCreateNote} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                  {currentVisitToken && <p className="rounded-md border border-teal-200 bg-teal-50 px-2.5 py-2 text-[10px] font-semibold text-teal-800">This report will be saved to visit token {currentVisitToken.tokenNumber} ({currentVisitToken.visitDate || currentVisitToken.createdDate}).</p>}
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Chief Complaint</label>
                    <input
                      required
                      type="text"
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                      placeholder="Patient's primary concern"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Health Summary & Clinical Assessment</label>
                    <textarea
                      required
                      rows={4}
                      value={healthSummary}
                      onChange={(e) => setHealthSummary(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-2 text-xs"
                      placeholder="Document relevant history, examination findings, and clinical assessment..."
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">ICD-10 Diagnosis</label>
                    <select
                      required
                      value={selectedIcd10}
                      onChange={(e) => setSelectedIcd10(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-medium"
                    >
                      <option value="">Select ICD-10 Code...</option>
                      {ICD10_COMMON_CODES.map((item) => (
                        <option key={item.code} value={`${item.code} ${item.description}`}>
                          {item.code} - {item.description} ({item.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Treatment Plan</label>
                    <textarea
                      rows={3}
                      value={treatmentPlan}
                      onChange={(e) => setTreatmentPlan(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-2 text-xs"
                      placeholder="Plan, follow-up instructions, and monitoring..."
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3 h-3" /> Commit Clinical Note
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {patientNotes.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">No clinical notes recorded yet.</div>
                ) : (
                  patientNotes.map((note) => {
                    const author = note.authorName || note.doctorName || 'Attending Physician';
                    const role = note.authorRole || note.doctorSpecialty || 'Clinical Staff';
                    const noteBody = note.content || note.assessment || 'Clinical encounter recorded.';
                    const diagnoses = note.diagnoses || (note.diagnosisCode ? [note.diagnosisCode] : []);
                    return (
                      <div key={note.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-bold text-slate-800">{author} ({role})</span>
                          <span className="font-mono">{note.date}</span>
                        </div>
                        {note.chiefComplaint && (
                          <p className="text-slate-600"><strong>Chief complaint:</strong> {note.chiefComplaint}</p>
                        )}
                        <p className="text-slate-700 text-xs leading-relaxed">{noteBody}</p>
                        {note.treatmentPlan && (
                          <p className="text-slate-600"><strong>Treatment plan:</strong> {note.treatmentPlan}</p>
                        )}
                        {diagnoses.length > 0 && (
                          <div className="pt-1 flex flex-wrap gap-1">
                            {diagnoses.map((dx) => (
                              <span key={dx} className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-mono text-[10px] font-semibold">
                                {dx}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            )}

            {/* TAB 3: Prescriptions & CPOE */}
            {(patientViewTab === 'prescriptions' || patientViewTab === 'all') && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    Prescriptions & Medications ({patientPrescriptions.length})
                  </h4>
                </div>
                <button
                  onClick={() => setIsAddingRx(!isAddingRx)}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isAddingRx ? 'Cancel Rx' : '+ Prescribe'}</span>
                </button>
              </div>

              {isAddingRx && (
                <form onSubmit={handleCreatePrescription} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Medication Name</label>
                      <input
                        type="text"
                        required
                        value={rxDrugName}
                        onChange={(e) => setRxDrugName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Dosage</label>
                      <input
                        type="text"
                        required
                        value={rxDosage}
                        onChange={(e) => setRxDosage(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Frequency</label>
                      <input
                        type="text"
                        required
                        value={rxFrequency}
                        onChange={(e) => setRxFrequency(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Route</label>
                      <select
                        value={rxRoute}
                        onChange={(e) => setRxRoute(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                      >
                        <option>Oral</option>
                        <option>Intravenous</option>
                        <option>Intramuscular</option>
                        <option>Topical</option>
                        <option>Inhalation</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Duration</label>
                      <input
                        type="text"
                        required
                        value={rxDuration}
                        onChange={(e) => setRxDuration(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Patient Instructions</label>
                    <input
                      type="text"
                      value={rxInstructions}
                      onChange={(e) => setRxInstructions(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3 h-3" /> Authorize & Sign E-Prescription
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {patientPrescriptions.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">No active prescriptions or medications recorded.</div>
                ) : (
                  patientPrescriptions.map((rx: any, idx: number) => (
                    <div key={rx.id || `${rx.medicationName || rx.name}-${idx}`} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{rx.medicationName || rx.name}</span>
                          <span className="font-mono text-[10px] text-slate-400 font-normal">({rx.dosage} · {rx.frequency})</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {rx.instructions || (rx.route ? `Route: ${rx.route} · Prescribed by: ${rx.prescribedBy}` : `Prescribed by: ${rx.prescribedBy}`)}
                          {rx.duration ? ` · Duration: ${rx.duration}` : (rx.startDate ? ` · Started: ${rx.startDate}` : '')}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {rx.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            Select a patient from the left column to view their medical record.
          </div>
        )}
      </div>
    </div>
  );
};
