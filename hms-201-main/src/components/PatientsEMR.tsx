import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Activity,
  Heart,
  Thermometer,
  Wind,
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
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { Patient, Prescription, ClinicalNote } from '../types';
import { ICD10_COMMON_CODES } from '../data/icd10Codes';
import { PatientDashboard } from './PatientDashboard';
import { PatientDiagnosticReportsView } from './reports/PatientDiagnosticReportsView';

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
    selectedPatientId,
    setSelectedPatientId,
    updatePatientStatus,
    addClinicalNote,
    addPrescription,
    addNotification,
    currentUser,
    currentRole,
  } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [patientViewTab, setPatientViewTab] = useState<'dashboard' | 'previous' | 'notes' | 'prescriptions' | 'reports' | 'all'>('dashboard');

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

  const normalizeClinicianName = (name: string) =>
    name.toLowerCase().replace(/^dr\.?\s*/, '').replace(/,?\s*(md|facs|do|phd)\b/g, '').replace(/[.,]/g, '').trim();
  const assignedPatients = currentRole === 'doctor'
    ? patients.filter(
        (patient) => normalizeClinicianName(patient.primaryPhysicianName) === normalizeClinicianName(currentUser.name)
      )
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
      chiefComplaint,
      content: healthSummary,
      assessment: healthSummary,
      treatmentPlan,
      diagnosisCode: selectedIcd10.split(' ')[0],
      diagnoses: [selectedIcd10],
      category: 'Physician Progress Note',
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
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Electronic Medical Records (EMR) & Clinical Encounters
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold uppercase">
              HL7 FHIR v4.0 COMPLIANT
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Real-time longitudinal medical records, vital signs telemetry, ICD-10 diagnostic coding, and computerized physician order entry (CPOE).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrintChart}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Chart</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Patient Registry List */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 flex flex-col max-h-[820px]">
          <div className="mb-3 px-1">
            <h3 className="text-sm font-bold text-slate-900">
              {currentRole === 'doctor' ? 'My Patient List' : 'Patient Registry'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {currentRole === 'doctor'
                ? `${filteredPatients.length} patient${filteredPatients.length === 1 ? '' : 's'} assigned to ${currentUser.name}`
                : `${filteredPatients.length} patients in the hospital registry`}
            </p>
          </div>

          {/* Search and Filter */}
          <div className="space-y-2 mb-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient name, MRN, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:ring-2 focus:ring-blue-500/20 text-slate-900"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'inpatient', label: 'Inpatient' },
                { id: 'outpatient', label: 'Outpatient' },
                { id: 'emergency', label: 'ER STAT' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2 py-1 text-[11px] rounded font-semibold transition cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Patient Cards List */}
          <div className="overflow-y-auto divide-y divide-slate-100 flex-1 space-y-1">
            {filteredPatients.length === 0 ? (
              <div className="px-3 py-8 text-center text-xs text-slate-500">
                {currentRole === 'doctor' && assignedPatients.length === 0
                  ? `No patients are assigned to ${currentUser.name}.`
                  : 'No patients match your search or status filter.'}
              </div>
            ) : filteredPatients.map((p) => {
              const isSelected = p.id === selectedPatient?.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPatientId(p.id);
                    setPatientViewTab('dashboard');
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50 border border-blue-200 text-blue-900'
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-xs truncate flex items-center gap-1.5">
                      <span>{p.firstName} {p.lastName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({p.id})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {p.age}y · {p.gender} · Blood: {p.bloodGroup} · {p.primaryPhysicianName}
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Patient EMR Dossier */}
        {selectedPatient ? (
          <div className="lg:col-span-8 space-y-4">
            {/* EMR Sub-Navigation Tabs */}
            <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setPatientViewTab('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    patientViewTab === 'dashboard'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Patient Dashboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPatientViewTab('previous')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    patientViewTab === 'previous'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Previous EMR ({patientVisits.length + patientNotes.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPatientViewTab('notes')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    patientViewTab === 'notes'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Clinical Notes ({patientNotes.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPatientViewTab('prescriptions')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    patientViewTab === 'prescriptions'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Pill className="w-3.5 h-3.5" />
                  <span>Prescriptions ({patientPrescriptions.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPatientViewTab('reports')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    patientViewTab === 'reports'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Diagnostic Reports ({selectedPatient?.labResults?.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPatientViewTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    patientViewTab === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>Full Record</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500 pr-2 shrink-0">
                <span className="font-semibold text-slate-800">{selectedPatient.firstName} {selectedPatient.lastName}</span>
                <span className="text-slate-300">|</span>
                <span className="text-blue-600 font-bold">{selectedPatient.id}</span>
              </div>
            </div>

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
                    <span className="text-[11px] text-slate-500">{patientVisits.length} encounters · {patientNotes.length} clinical notes</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <div>
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

            {/* Dedicated Header for Notes and Prescriptions standalone tabs */}
            {patientViewTab !== 'dashboard' && patientViewTab !== 'previous' && patientViewTab !== 'all' && (
              <>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center font-mono">
                        {selectedPatient.bloodGroup}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <span>{selectedPatient.firstName} {selectedPatient.lastName}</span>
                          <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                            {selectedPatient.id}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          DOB: {selectedPatient.dob} ({selectedPatient.age}y) · {selectedPatient.gender} · Phone: {selectedPatient.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => onOpenTriageModal(selectedPatient.id)}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>Intake Triage</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onStartTelehealth(selectedPatient.id)}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Telehealth</span>
                      </button>

                      <select
                        value={selectedPatient.status}
                        onChange={(e) => updatePatientStatus(selectedPatient.id, e.target.value as any)}
                        className="bg-slate-50 border border-slate-300 rounded-lg py-1 px-2 text-xs font-bold text-slate-700"
                      >
                        <option value="Outpatient">Outpatient</option>
                        <option value="Inpatient">Inpatient</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Discharged">Discharged</option>
                      </select>
                    </div>
                  </div>

                  {/* Vitals Telemetry Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 text-xs">
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                        <Activity className="w-3 h-3 text-blue-500" /> BP (mmHg)
                      </span>
                      <span className="font-bold text-slate-900 font-mono text-sm block mt-0.5">
                        {latestVitals ? `${latestVitals.bloodPressureSys}/${latestVitals.bloodPressureDia}` : 'Not recorded'}
                      </span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-500" /> Pulse (BPM)
                      </span>
                      <span className="font-bold text-slate-900 font-mono text-sm block mt-0.5">
                        {latestVitals ? latestVitals.heartRate : 'Not recorded'}
                      </span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                        <Wind className="w-3 h-3 text-sky-500" /> SpO2 (%)
                      </span>
                      <span className="font-bold text-slate-900 font-mono text-sm block mt-0.5">
                        {latestVitals ? `${latestVitals.spO2}%` : 'Not recorded'}
                      </span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                        <Thermometer className="w-3 h-3 text-amber-500" /> Temp (°F)
                      </span>
                      <span className="font-bold text-slate-900 font-mono text-sm block mt-0.5">
                        {latestVitals ? `${latestVitals.temperature}°F` : 'Not recorded'}
                      </span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded border border-slate-100 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Resp. Rate</span>
                      <span className="font-bold text-slate-900 font-mono text-sm block mt-0.5">
                        {latestVitals ? `${latestVitals.respiratoryRate} /min` : 'Not recorded'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Allergies & Chronic Conditions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 space-y-1.5">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      <span>Drug & Environmental Allergies</span>
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {patientAllergies.length > 0 ? (
                        patientAllergies.map((a, idx) => {
                          const label = typeof a === 'string' ? a : `${a.allergen}${a.severity ? ` (${a.severity})` : ''}`;
                          const key = typeof a === 'string' ? `${a}-${idx}` : `${a.allergen}-${idx}`;
                          return (
                            <span
                              key={key}
                              className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[11px]"
                            >
                              {label}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-slate-400">No known drug allergies (NKDA)</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 space-y-1.5">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-blue-600" />
                      <span>Documented Chronic Conditions</span>
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {patientConditions.length > 0 ? (
                        patientConditions.map((c, idx) => (
                          <span
                            key={`${c}-${idx}`}
                            className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium text-[11px]"
                          >
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400">No chronic conditions listed</span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: Clinical Encounter & Physician Progress Notes */}
            {(patientViewTab === 'notes' || patientViewTab === 'all') && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                      Clinical Encounter Notes ({patientNotes.length})
                    </h4>
                  </div>
                <button
                  onClick={() => setIsAddingNote(!isAddingNote)}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isAddingNote ? 'Cancel Note' : 'Add Note'}</span>
                </button>
              </div>

              {isAddingNote && (
                <form onSubmit={handleCreateNote} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
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
