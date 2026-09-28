import React, { useState } from 'react';
import { CalendarCheck, CheckCircle2, Edit3, Eraser, FileText, MapPin, Phone, Save, Search, Ticket, UserPlus, UserRound } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { PaymentSchemeType, ReceptionToken, TokenPaymentScheme } from '../types';

interface PatientRegistrationDeskProps {
  onOpenNewPatient: () => void;
  onEditPatient: (patientId: string) => void;
}

export const PatientRegistrationDesk: React.FC<PatientRegistrationDeskProps> = ({
  onOpenNewPatient,
  onEditPatient,
}) => {
  const {
    patients,
    doctors,
    appointments,
    receptionTokens,
    createReceptionToken,
    advanceTokenWorkflow,
    updatePatient,
    addNotification,
  } = useHospital();
  const [patientQuery, setPatientQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [selectedTokenId, setSelectedTokenId] = useState('');
  const [tokenQuery, setTokenQuery] = useState('');
  const [conversionType, setConversionType] = useState<ReceptionToken['serviceType']>('Consultation');
  const [registrationType, setRegistrationType] = useState<'Consultation' | 'Non-Consultation' | 'Technician'>('Consultation');
  const [physioTechnician, setPhysioTechnician] = useState('Ahmed Hassan - Physiotherapy Technician');
  const [paymentSchemeType, setPaymentSchemeType] = useState<PaymentSchemeType>('Self-Pay');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [coveragePercent, setCoveragePercent] = useState('80');
  const [saving, setSaving] = useState(false);
  const [registrationTab, setRegistrationTab] = useState<'new' | 'existing' | 'appointment' | 'edit'>('existing');

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((appointment) => appointment.date === today && appointment.status !== 'Cancelled');
  const filteredPatients = patients.filter((patient) => {
    const search = patientQuery.trim().toLowerCase();
    if (!search) return true;

    const searchableValues = [
      patient.firstName,
      patient.lastName,
      `${patient.firstName} ${patient.lastName}`,
      patient.id,
      patient.phone,
      patient.emiratesId,
      patient.passportNo,
      patient.email,
      patient.mobile,
      patient.nationality,
    ].filter(Boolean) as string[];

    return searchableValues.some((value) => value.toLowerCase().includes(search));
  }).slice(0, 8);
  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);
  const selectedAppointment = todayAppointments.find((appointment) => appointment.id === selectedAppointmentId);
  const selectedToken = receptionTokens.find((token) => token.id === selectedTokenId);
  const activeTokens = receptionTokens.filter((token) => token.status !== 'Completed' && token.status !== 'Cancelled');
  const quickStats = [
    { label: 'Walk-in queue', value: String(activeTokens.length), tone: 'bg-blue-50 text-blue-700', icon: Ticket },
    { label: 'Today appointments', value: String(todayAppointments.length), tone: 'bg-violet-50 text-violet-700', icon: CalendarCheck },
    { label: 'Registered patients', value: String(patients.length), tone: 'bg-emerald-50 text-emerald-700', icon: UserRound },
    { label: 'Need review', value: String(patients.filter((patient) => patient.status === 'Pending').length), tone: 'bg-amber-50 text-amber-700', icon: FileText },
  ];
  const filteredTokens = activeTokens.filter((token) => {
    const search = tokenQuery.trim().toLowerCase();
    return !search || `${token.patientName} ${token.patientId} ${token.tokenNumber} ${token.id}`.toLowerCase().includes(search);
  }).slice(0, 8);

  const clearForm = () => {
    setPatientQuery('');
    setSelectedPatientId('');
    setSelectedAppointmentId('');
    setSelectedTokenId('');
    setTokenQuery('');
    setConversionType('Consultation');
    setPaymentSchemeType('Self-Pay');
    setPaymentDetails('');
    setCoveragePercent('80');
    setRegistrationType('Consultation');
    setPhysioTechnician('Ahmed Hassan - Physiotherapy Technician');
    setSaving(false);
  };

  const saveExistingPatientToken = () => {
    if (!selectedPatient) {
      addNotification('Select Patient', 'Choose an existing patient before saving registration.', 'warning');
      return;
    }

    setSaving(true);

    const assignedDoctor = doctors.find((doctor) => doctor.id === selectedPatient.primaryPhysicianId) || doctors[0];
    const physioOptions = ['Ahmed Hassan - Physiotherapy Technician', 'Zainab Noor - Physiotherapy Technician', 'Nadia Salem - Physiotherapy Technician'];
    const selectedPhysio = physioOptions.includes(physioTechnician) ? physioTechnician : physioOptions[0];
    const walkInDepartment = registrationType === 'Consultation' ? (selectedPatient.department || 'General Medicine') : registrationType === 'Technician' ? 'Physiotherapy' : 'Registration & Cashier';
    const walkInPurpose = selectedPatient.purposeOfVisit || (registrationType === 'Consultation' ? 'Walk-in consultation' : registrationType === 'Technician' ? 'Physiotherapy treatment session' : 'Administrative registration & billing');
    const insuranceProvider = selectedPatient.insurance?.provider || (selectedPatient.payMode === 'Self' ? 'Self-Pay' : 'Insurance Coverage');
    const insurancePolicy = selectedPatient.insurance?.policyNumber || 'CASH-PATIENT';

    updatePatient(selectedPatient.id, {
      status: selectedPatient.status === 'Inpatient' ? 'Inpatient' : 'Outpatient',
      department: registrationType === 'Consultation' ? walkInDepartment : 'Registration & Cashier',
      purposeOfVisit: walkInPurpose,
      primaryPhysicianId: assignedDoctor?.id || selectedPatient.primaryPhysicianId,
      primaryPhysicianName: assignedDoctor?.name || selectedPatient.primaryPhysicianName,
      insurance: {
        ...(selectedPatient.insurance || {
          provider: 'Self-Pay',
          policyNumber: 'CASH-PATIENT',
          groupNumber: 'GRP-2026',
          status: 'Active',
          coveragePercentage: 100,
          copayAmount: 0,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }),
        provider: insuranceProvider,
        policyNumber: insurancePolicy,
        status: 'Active',
      },
      payMode: selectedPatient.payMode || 'Self',
      updatedAt: new Date().toISOString(),
    });

    const token = createReceptionToken({
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      patientPhone: selectedPatient.phone,
      doctorId: registrationType === 'Consultation' ? (assignedDoctor?.id || selectedPatient.primaryPhysicianId) : undefined,
      doctorName: registrationType === 'Consultation' ? (assignedDoctor?.name || selectedPatient.primaryPhysicianName) : registrationType === 'Technician' ? selectedPhysio : 'Registration Desk',
      department: walkInDepartment,
      serviceType: registrationType === 'Consultation' ? 'Consultation' : registrationType === 'Technician' ? 'Physio Technician' : 'Billing & Cashier',
      priority: 'Normal',
      status: 'Waiting',
      estimatedWaitMins: 0,
      counterOrRoom: registrationType === 'Consultation' ? 'Walk-in Registration Desk' : registrationType === 'Technician' ? 'Physiotherapy Technician Desk' : 'Cashier Desk',
      currentStage: '1_REGISTRATION',
      visitType: registrationType === 'Consultation' ? 'Consultation' : registrationType === 'Technician' ? 'Technician' : 'Billing',
      visitPurpose: walkInPurpose,
      visitComplaint: walkInPurpose,
      registrationSource: 'Walk-in',
      patientAge: selectedPatient.age,
      patientGender: selectedPatient.gender,
      insuranceProvider: insuranceProvider,
      payMode: selectedPatient.payMode || 'Self',
      visitDate: new Date().toISOString().split('T')[0],
      patientVisitSummary: registrationType === 'Consultation'
        ? `${walkInDepartment} • ${assignedDoctor?.name || selectedPatient.primaryPhysicianName} • ${walkInPurpose}`
        : registrationType === 'Technician'
        ? `${walkInDepartment} • ${selectedPhysio} • ${walkInPurpose}`
        : `${walkInDepartment} • Administrative registration & billing • ${walkInPurpose}`,
      paymentScheme:
        selectedPatient.payMode === 'Self' || !selectedPatient.payMode
          ? { schemeType: 'Self-Pay' }
          : { schemeType: 'Insurance', insuranceProvider: insuranceProvider, policyNumber: insurancePolicy, coveragePercent: 80 },
      historyLogs: [
        {
          stage: '1_REGISTRATION',
          timestamp: new Date().toISOString(),
          action: `Walk-in registration for ${selectedPatient.firstName} ${selectedPatient.lastName}. Department: ${walkInDepartment}. ${registrationType === 'Consultation' ? `Doctor: ${assignedDoctor?.name || selectedPatient.primaryPhysicianName}.` : registrationType === 'Technician' ? `Physio technician: ${selectedPhysio}.` : 'Routing to cashier.'} Visit: ${walkInPurpose}`,
          actor: 'Registration Desk',
        },
      ],
    });

    addNotification(
      'Walk-in Registration Saved',
      `${selectedPatient.firstName} ${selectedPatient.lastName} re-registered as a walk-in patient with token ${token.tokenNumber}.`,
      'success',
      selectedPatient.id
    );
    if (registrationType === 'Consultation' && assignedDoctor) {
      addNotification(
        'Doctor Walk-in Alert',
        `Walk-in patient ${selectedPatient.firstName} ${selectedPatient.lastName} has been registered for ${assignedDoctor.name} in ${walkInDepartment}.`,
        'info',
        assignedDoctor.id
      );
    }
    clearForm();
  };

  const saveAppointmentRegistration = () => {
    if (!selectedAppointment) {
      addNotification('Select Appointment', 'Choose a current-day appointment before saving registration.', 'warning');
      return;
    }
    const patient = patients.find((item) => item.id === selectedAppointment.patientId);
    const physioOptions = ['Ahmed Hassan - Physiotherapy Technician', 'Zainab Noor - Physiotherapy Technician', 'Nadia Salem - Physiotherapy Technician'];
    const selectedPhysio = physioOptions.includes(physioTechnician) ? physioTechnician : physioOptions[0];
    const token = createReceptionToken({
      patientId: selectedAppointment.patientId,
      patientName: selectedAppointment.patientName,
      patientPhone: patient?.phone,
      doctorId: registrationType === 'Consultation' ? selectedAppointment.doctorId : undefined,
      doctorName: registrationType === 'Consultation' ? selectedAppointment.doctorName : registrationType === 'Technician' ? selectedPhysio : 'Registration Desk',
      department: registrationType === 'Consultation' ? selectedAppointment.department : registrationType === 'Technician' ? 'Physiotherapy' : 'Registration & Cashier',
      serviceType: registrationType === 'Consultation' ? 'Consultation' : registrationType === 'Technician' ? 'Physio Technician' : 'Billing & Cashier',
      priority: selectedAppointment.priority === 'Urgent' ? 'Urgent' : 'Normal',
      status: 'Waiting',
      estimatedWaitMins: selectedAppointment.estimatedWaitMinutes || 0,
      counterOrRoom: registrationType === 'Consultation' ? selectedAppointment.roomNumber : registrationType === 'Technician' ? 'Physiotherapy Technician Desk' : 'Cashier Desk',
      currentStage: '1_REGISTRATION',
      visitType: registrationType === 'Consultation' ? 'Consultation' : registrationType === 'Technician' ? 'Technician' : 'Billing',
      visitPurpose: selectedAppointment.reason || (registrationType === 'Consultation' ? 'Scheduled consultation' : registrationType === 'Technician' ? 'Physiotherapy treatment session' : 'Administrative registration & billing'),
      visitComplaint: selectedAppointment.reason || (registrationType === 'Consultation' ? 'Scheduled consultation' : registrationType === 'Technician' ? 'Physiotherapy treatment session' : 'Administrative registration & billing'),
      registrationSource: 'Appointment',
      patientAge: patient?.age,
      patientGender: patient?.gender,
      insuranceProvider: patient?.insurance?.provider || 'Self-Pay',
      payMode: patient?.payMode || 'Self',
      visitDate: selectedAppointment.date,
      patientVisitSummary: registrationType === 'Consultation'
        ? `${selectedAppointment.department} • ${selectedAppointment.doctorName} • ${selectedAppointment.reason || 'Scheduled consultation'}`
        : registrationType === 'Technician'
        ? `${selectedAppointment.department} • ${selectedPhysio} • ${selectedAppointment.reason || 'Physiotherapy treatment session'}`
        : `${selectedAppointment.department} • Administrative registration & billing • ${selectedAppointment.reason || 'Scheduled appointment'}`,
      paymentScheme: patient?.payMode === 'Self' ? { schemeType: 'Self-Pay' } : { schemeType: 'Insurance', insuranceProvider: patient?.insurance?.provider, policyNumber: patient?.insurance?.policyNumber },
    });
    addNotification('Appointment Registration Saved', `${selectedAppointment.patientName} received token ${token.tokenNumber} under ${registrationType === 'Consultation' ? 'Consultation' : 'Non-Consultation'} routing.`, 'success', selectedAppointment.patientId);
    clearForm();
  };

  const convertToken = () => {
    if (!selectedToken) {
      addNotification('Select Token', 'Choose a registration token before changing its service.', 'warning');
      return;
    }
    const isConsultation = conversionType === 'Consultation';
    advanceTokenWorkflow(selectedToken.id, isConsultation ? '1_REGISTRATION' : selectedToken.currentStage || '1_REGISTRATION', {
      serviceType: conversionType,
      department: isConsultation ? selectedToken.department : conversionType === 'Physio Technician' ? 'Physiotherapy' : 'Registration & Cashier',
      counterOrRoom: conversionType === 'Physio Technician' ? 'Physiotherapy Technician Desk' : selectedToken.counterOrRoom,
    });
    addNotification('Token Changed', `${selectedToken.tokenNumber} is now classified as ${conversionType}.`, 'success', selectedToken.patientId);
    setSelectedTokenId('');
    setTokenQuery('');
  };

  const changePaymentScheme = () => {
    if (!selectedToken) {
      addNotification('Select Token', 'Choose a registration token before changing its insurance details.', 'warning');
      return;
    }
    if (paymentSchemeType !== 'Self-Pay' && !paymentDetails.trim()) {
      addNotification('Details Required', `Enter the ${paymentSchemeType === 'Corporate' ? 'corporate payer' : 'package'} name or number.`, 'warning');
      return;
    }

    const parsedCoverage = Math.min(100, Math.max(0, Number(coveragePercent) || 0));
    const paymentScheme: TokenPaymentScheme = paymentSchemeType === 'Self-Pay'
      ? { schemeType: 'Self-Pay' }
      : paymentSchemeType === 'Corporate'
      ? { schemeType: 'Corporate', corporateName: paymentDetails.trim(), corporateNumber: paymentDetails.trim(), coveragePercent: parsedCoverage }
      : { schemeType: 'Package', packageName: paymentDetails.trim(), packageNumber: paymentDetails.trim(), coveragePercent: parsedCoverage };

    advanceTokenWorkflow(selectedToken.id, selectedToken.currentStage || '1_REGISTRATION', { paymentScheme });
    addNotification('Insurance Details Changed', `${selectedToken.tokenNumber} is now billed under ${paymentSchemeType}.`, 'success', selectedToken.patientId);
    setSelectedTokenId('');
    setTokenQuery('');
    setPaymentDetails('');
  };

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-3 max-w-[1400px] mx-auto text-xs">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center"><UserRound className="w-5 h-5 text-blue-600" /></div><div><h1 className="text-lg font-bold text-slate-900">Patient Registration</h1><p className="text-slate-500 mt-0.5">Register new patients, search existing patients, manage appointments, or edit patient details.</p></div></div>
        <div className="flex items-center gap-2 self-end"><button onClick={() => setRegistrationTab('existing')} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold flex items-center gap-1.5 cursor-pointer"><Search className="w-3.5 h-3.5" /> Quick Jump</button><button onClick={onOpenNewPatient} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"><UserPlus className="w-3.5 h-3.5" /> Create / Action</button></div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-white rounded-t-xl px-2 pt-2">
        {[
          ['new', UserPlus, 'New Registration'], ['existing', Search, 'Existing Patient'], ['appointment', CalendarCheck, 'Appointment Patient'], ['edit', Edit3, 'Edit'],
        ].map(([tab, Icon, label]) => (
          <button
            key={tab as string}
            onClick={() => {
              setRegistrationTab(tab as typeof registrationTab);
              if (tab === 'new') {
                onOpenNewPatient();
              }
            }}
            className={`px-4 py-2.5 rounded-t-lg font-semibold flex items-center gap-1.5 border-b-2 cursor-pointer ${registrationTab === tab ? 'bg-teal-600 border-teal-600 text-white' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
          >
            <Icon className="w-3.5 h-3.5" /> {label as string}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
        {quickStats.map(({ label, value, tone, icon: Icon }) => (
          <div key={label} className={`rounded-xl border border-slate-200 ${tone} px-3 py-2.5`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2 text-lg font-bold">{value}</div>
          </div>
        ))}
      </div>

      <section className="bg-white border border-slate-200 rounded-b-xl rounded-tr-xl shadow-sm p-3 sm:p-4">
        {registrationTab === 'new' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><UserPlus className="w-4 h-4 text-blue-600" /></div>
                <div>
                  <h2 className="font-bold text-slate-900">New Patient Registration</h2>
                  <p className="text-[10px] text-slate-500">This workflow uses the full patient admission module.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={onOpenNewPatient} className="px-4 py-2 rounded-lg bg-teal-600 text-white font-bold flex items-center gap-1.5 cursor-pointer"><Save className="w-3.5 h-3.5" /> Open Full Form</button>
                <button onClick={clearForm} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-bold flex items-center gap-1.5 cursor-pointer"><Eraser className="w-3.5 h-3.5" /> Clear</button>
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
              <div className="flex items-center gap-2 font-bold text-blue-900">
                <UserPlus className="w-4 h-4 text-blue-600" /> Advanced registration workflow
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-700">
                <div className="rounded-lg bg-white border border-blue-100 p-3">
                  <div className="font-semibold text-slate-900 mb-1">Patient information</div>
                  Demographics, DOB, ID, phone, emergency contact, and photo capture are handled in the full module.
                </div>
                <div className="rounded-lg bg-white border border-blue-100 p-3">
                  <div className="font-semibold text-slate-900 mb-1">Clinical intake</div>
                  Visit purpose, allergies, chronic history, department, and doctor assignment follow the patient module workflow.
                </div>
                <div className="rounded-lg bg-white border border-blue-100 p-3">
                  <div className="font-semibold text-slate-900 mb-1">Insurance details</div>
                  Insurance, discount card, copay rules, and document uploads are handled with the same logic as the new patient module.
                </div>
                <div className="rounded-lg bg-white border border-blue-100 p-3">
                  <div className="font-semibold text-slate-900 mb-1">Token creation</div>
                  New patients are registered with the same token workflow and duplicate checking used by the full intake module.
                </div>
              </div>

              <button
                onClick={onOpenNewPatient}
                className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-bold flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Launch New Patient Module
              </button>
            </div>
          </div>
        )}
        {registrationTab === 'existing' && <ExistingPatientPanel patient={selectedPatient} patientQuery={patientQuery} setPatientQuery={setPatientQuery} filteredPatients={filteredPatients} selectedPatientId={selectedPatientId} setSelectedPatientId={setSelectedPatientId} saveExistingPatientToken={saveExistingPatientToken} onEditPatient={onEditPatient} registrationType={registrationType} setRegistrationType={setRegistrationType} physioTechnician={physioTechnician} setPhysioTechnician={setPhysioTechnician} />}
        {registrationTab === 'appointment' && <AppointmentPanel today={today} todayAppointments={todayAppointments} selectedAppointmentId={selectedAppointmentId} setSelectedAppointmentId={setSelectedAppointmentId} selectedAppointment={selectedAppointment} saveAppointmentRegistration={saveAppointmentRegistration} registrationType={registrationType} setRegistrationType={setRegistrationType} physioTechnician={physioTechnician} setPhysioTechnician={setPhysioTechnician} />}
        {registrationTab === 'edit' && <EditPatientPanel patients={patients} selectedPatientId={selectedPatientId} setSelectedPatientId={setSelectedPatientId} onEditPatient={onEditPatient} />}
      </section>

      
    </div>
  );
};

const RegistrationSection: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode }> = ({ icon: Icon, title, children }) => <div className="mb-3"><div className="flex items-center gap-2 bg-blue-50/70 rounded-md px-3 py-2 text-blue-900 font-bold mb-2"><Icon className="w-4 h-4 text-blue-600" />{title}</div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">{children}</div></div>;

const Field: React.FC<{ label: string; placeholder: string; wide?: boolean }> = ({ label, placeholder, wide }) => <label className={`${wide ? 'sm:col-span-2 lg:col-span-2' : ''} block`}><span className="block text-[10px] font-semibold text-slate-600 mb-1">{label}</span><input placeholder={placeholder} className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none" /></label>;

const ExistingPatientPanel: React.FC<any> = ({ patient, patientQuery, setPatientQuery, filteredPatients, selectedPatientId, setSelectedPatientId, saveExistingPatientToken, onEditPatient, registrationType, setRegistrationType, physioTechnician, setPhysioTechnician }) => (
  <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
    <div className="space-y-3">
      <h2 className="font-bold text-slate-900 flex items-center gap-2"><Search className="w-4 h-4 text-blue-600" /> Search Existing Patient</h2>
      <input value={patientQuery} onChange={(event) => setPatientQuery(event.target.value)} placeholder="Search by name, phone, MRN, national ID, or passport" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
      <div className="mb-3">
        <label className="block text-[10px] font-semibold text-slate-600 mb-1">Visit Type</label>
        <div className="grid grid-cols-3 gap-2">
          {(['Consultation', 'Non-Consultation', 'Technician'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setRegistrationType(type)}
              className={`p-2 rounded-lg border text-[11px] font-semibold transition-colors ${
                registrationType === type
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      {registrationType === 'Technician' && (
        <div className="mb-3">
          <label className="block text-[10px] font-semibold text-slate-600 mb-1">Physio Technician</label>
          <select
            value={physioTechnician}
            onChange={(event) => setPhysioTechnician(event.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {['Ahmed Hassan - Physiotherapy Technician', 'Zainab Noor - Physiotherapy Technician', 'Nadia Salem - Physiotherapy Technician'].map((tech) => (
              <option key={tech} value={tech}>{tech}</option>
            ))}
          </select>
        </div>
      )}
      <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
        {filteredPatients.map((patientItem: any) => (
          <button key={patientItem.id} onClick={() => { setSelectedPatientId(patientItem.id); onEditPatient?.(patientItem.id); }} className={`w-full text-left p-2.5 rounded-lg border cursor-pointer transition ${selectedPatientId === patientItem.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="font-semibold block text-slate-800">{patientItem.firstName} {patientItem.lastName}</span>
                <span className="text-[10px] text-slate-500">{patientItem.id} · {patientItem.phone || 'No phone'} · {patientItem.emiratesId || patientItem.passportNo || 'No ID'}</span>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{patientItem.status || 'Outpatient'}</span>
            </div>
          </button>
        ))}
      </div>
    </div>

    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="font-bold text-slate-900">Selected patient</h3>
        <button onClick={() => onEditPatient?.(selectedPatientId)} disabled={!patient} className="px-2 py-1 rounded-md border border-slate-300 bg-white text-[10px] font-semibold text-slate-600 disabled:opacity-50">Edit</button>
      </div>

      {patient ? (
        <div className="space-y-3 text-[11px] text-slate-700">
          <div className="rounded-lg bg-white border border-slate-200 p-2.5">
            <div className="text-base font-bold text-slate-900">{patient.firstName} {patient.lastName}</div>
            <div className="mt-1 text-slate-500">{patient.id} · {patient.phone || 'No phone'}</div>
            <div className="mt-1 text-[10px] text-slate-500">National ID: {patient.emiratesId || 'Not recorded'} · Passport: {patient.passportNo || 'Not recorded'}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-white border border-slate-200 p-2"><div className="text-[10px] uppercase tracking-wide text-slate-500">Department</div><div className="mt-1 font-semibold">{patient.department || 'General Medicine'}</div></div>
            <div className="rounded-lg bg-white border border-slate-200 p-2"><div className="text-[10px] uppercase tracking-wide text-slate-500">Doctor</div><div className="mt-1 font-semibold">{patient.primaryPhysicianName || 'TBD'}</div></div>
            <div className="rounded-lg bg-white border border-slate-200 p-2"><div className="text-[10px] uppercase tracking-wide text-slate-500">Insurance</div><div className="mt-1 font-semibold">{patient.insurance?.provider || 'Self-Pay'}</div></div>
            <div className="rounded-lg bg-white border border-slate-200 p-2"><div className="text-[10px] uppercase tracking-wide text-slate-500">Visit type</div><div className="mt-1 font-semibold">{patient.purposeOfVisit || 'Walk-in'}</div></div>
          </div>
          <button onClick={saveExistingPatientToken} className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 cursor-pointer"><Save className="w-3.5 h-3.5" /> Save Registration</button>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-center text-slate-500 text-[11px]">Select a patient to see the registration summary and continue.</div>
      )}
    </div>
  </div>
);

const AppointmentPanel: React.FC<any> = ({ today, todayAppointments, selectedAppointmentId, setSelectedAppointmentId, selectedAppointment, saveAppointmentRegistration, registrationType, setRegistrationType, physioTechnician, setPhysioTechnician }) => <div className="max-w-2xl space-y-3"><h2 className="font-bold text-slate-900 flex items-center gap-2"><CalendarCheck className="w-4 h-4 text-indigo-600" /> Register Appointment Patient</h2><p className="text-[10px] text-slate-500">Current day: {today}</p><div className="grid grid-cols-3 gap-2"><button type="button" onClick={() => setRegistrationType('Consultation')} className={`p-2 rounded-lg border text-[11px] font-semibold ${registrationType === 'Consultation' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600'}`}>Consultation</button><button type="button" onClick={() => setRegistrationType('Non-Consultation')} className={`p-2 rounded-lg border text-[11px] font-semibold ${registrationType === 'Non-Consultation' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600'}`}>Non-Consultation</button><button type="button" onClick={() => setRegistrationType('Technician')} className={`p-2 rounded-lg border text-[11px] font-semibold ${registrationType === 'Technician' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600'}`}>Technician</button></div>{registrationType === 'Technician' && <div><label className="block text-[10px] font-semibold text-slate-600 mb-1">Physio Technician</label><select value={physioTechnician} onChange={(event) => setPhysioTechnician(event.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2"><option value="Ahmed Hassan - Physiotherapy Technician">Ahmed Hassan - Physiotherapy Technician</option><option value="Zainab Noor - Physiotherapy Technician">Zainab Noor - Physiotherapy Technician</option><option value="Nadia Salem - Physiotherapy Technician">Nadia Salem - Physiotherapy Technician</option></select></div>}<select value={selectedAppointmentId} onChange={(event) => setSelectedAppointmentId(event.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2"><option value="">Select today&apos;s appointment</option>{todayAppointments.map((appointment: any) => <option key={appointment.id} value={appointment.id}>{appointment.timeSlot} · {appointment.patientName}</option>)}</select>{selectedAppointment && <div className="p-3 bg-indigo-50 rounded-lg text-indigo-900"><strong>{selectedAppointment.patientName}</strong><br />{selectedAppointment.doctorName} · {selectedAppointment.department}</div>}<button onClick={saveAppointmentRegistration} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold flex items-center gap-2 cursor-pointer"><Save className="w-3.5 h-3.5" /> Save Appointment Registration</button></div>;

const EditPatientPanel: React.FC<any> = ({ patients, selectedPatientId, setSelectedPatientId, onEditPatient }) => <div className="max-w-2xl space-y-3"><h2 className="font-bold text-slate-900 flex items-center gap-2"><Edit3 className="w-4 h-4 text-teal-600" /> Edit Registered Patient</h2><p className="text-slate-500">Edit name, gender, insurance, contact, or other registration details.</p><select value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2"><option value="">Select patient to edit</option>{patients.map((patient: any) => <option key={patient.id} value={patient.id}>{patient.firstName} {patient.lastName} · {patient.id}</option>)}</select><button disabled={!selectedPatientId} onClick={() => onEditPatient(selectedPatientId)} className="px-4 py-2 bg-teal-600 disabled:bg-slate-300 text-white rounded-lg font-bold flex items-center gap-2 cursor-pointer"><Edit3 className="w-3.5 h-3.5" /> Edit Details</button></div>;
