import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  AlertCircle,
  Building2,
  CheckCircle2,
  CreditCard,
  FileText,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { BloodGroup, PatientStatus, Patient, PaymentSchemeType } from '../types';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated?: (id: string) => void;
  initialPatientId?: string;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  onPatientCreated,
  initialPatientId,
}) => {
  const { patients, doctors, wardBeds, addPatient, updatePatient, addNotification } = useHospital();

  const [activeTab, setActiveTab] = useState<'demographics' | 'contact' | 'clinical' | 'insurance'>('demographics');

  // Demographics
  const [title, setTitle] = useState('Mr.');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('1990-01-01');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [maritalStatus, setMaritalStatus] = useState<'Single' | 'Married' | 'Divorced' | 'Widowed'>('Single');
  const [photo, setPhoto] = useState('');

  // Contact & ID
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [passportNo, setPassportNo] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Metropolis');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Spouse');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Clinical & Admission
  const [status, setStatus] = useState<PatientStatus>('Outpatient');
  const [department, setDepartment] = useState('General Medicine');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [wardOrRoom, setWardOrRoom] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [allergiesInput, setAllergiesInput] = useState('');
  const [chronicInput, setChronicInput] = useState('');
  const [isReadingCard, setIsReadingCard] = useState(false);

  // Insurance & Billing
  const [payMode, setPayMode] = useState<'Self' | 'Insurance' | 'Discount Card'>('Insurance');
  const [insuranceProvider, setInsuranceProvider] = useState('MetLife Health');
  const [policyNumber, setPolicyNumber] = useState('POL-992014');
  const [tpa, setTpa] = useState('TPA 8');
  const [memberId, setMemberId] = useState('52GM0455892711901');
  const [dhaMemberId, setDhaMemberId] = useState('I137-001-118716420-01');
  const [clientNumber, setClientNumber] = useState('INS137');
  const [copayPercent, setCopayPercent] = useState(20);
  const [registrationType, setRegistrationType] = useState<'Consultation' | 'Non-Consultation' | 'Technician'>('Consultation');
  const [physioTechnician, setPhysioTechnician] = useState('Ahmed Hassan - Physiotherapy Technician');
  const [discountCardName, setDiscountCardName] = useState('Hospital Employee Staff Card');
  const [discountPercent, setDiscountPercent] = useState(20);
  const [insuranceCardImage, setInsuranceCardImage] = useState('');
  const [supportDocumentImage, setSupportDocumentImage] = useState('');
  const [serviceCopay, setServiceCopay] = useState({ consultation: 20, dental: 20, procedure: 20, laboratory: 20, lab: 20, radiology: 20, pharmacy: 20, procedures: 20, surgicalProcedure: 20, emergency: 10 });
  const [copayRules, setCopayRules] = useState({
    consultation: { minPercent: 10, maxPercent: 25, minAmount: 50, maxAmount: 150 },
    dental: { minPercent: 10, maxPercent: 30, minAmount: 40, maxAmount: 120 },
    procedure: { minPercent: 15, maxPercent: 35, minAmount: 75, maxAmount: 250 },
    laboratory: { minPercent: 10, maxPercent: 20, minAmount: 30, maxAmount: 120 },
    lab: { minPercent: 10, maxPercent: 20, minAmount: 30, maxAmount: 120 },
    radiology: { minPercent: 15, maxPercent: 30, minAmount: 60, maxAmount: 220 },
    pharmacy: { minPercent: 5, maxPercent: 20, minAmount: 20, maxAmount: 150 },
    procedures: { minPercent: 15, maxPercent: 35, minAmount: 80, maxAmount: 280 },
    surgicalProcedure: { minPercent: 20, maxPercent: 40, minAmount: 100, maxAmount: 400 },
    emergency: { minPercent: 10, maxPercent: 25, minAmount: 40, maxAmount: 180 },
  });

  // Auto-calculate age from DOB
  const calculateAge = (birthDateString: string): number => {
    if (!birthDateString) return 30;
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  const calculatedAge = calculateAge(dob);

  const clearForm = () => {
    setActiveTab('demographics');
    setTitle('Mr.');
    setFirstName('');
    setMiddleName('');
    setLastName('');
    setDob('1990-01-01');
    setGender('Male');
    setBloodGroup('O+');
    setMaritalStatus('Single');
    setPhoto('');
    setPhone('');
    setEmail('');
    setNationalId('');
    setPassportNo('');
    setAddress('');
    setCity('Metropolis');
    setEmergencyName('');
    setEmergencyRelation('Spouse');
    setEmergencyPhone('');
    setStatus('Outpatient');
    setDepartment('General Medicine');
    setDoctorId(doctors[0]?.id || '');
    setWardOrRoom('');
    setChiefComplaint('');
    setAllergiesInput('');
    setChronicInput('');
    setPayMode('Insurance');
    setInsuranceProvider('MetLife Health');
    setInsuranceCardImage('');
    setSupportDocumentImage('');
    setPolicyNumber('POL-992014');
    setTpa('TPA 8');
    setMemberId('52GM0455892711901');
    setDhaMemberId('I137-001-118716420-01');
    setClientNumber('INS137');
    setCopayPercent(20);
    setRegistrationType('Consultation');
    setPhysioTechnician('Ahmed Hassan - Physiotherapy Technician');
    setDiscountCardName('Hospital Employee Staff Card');
    setDiscountPercent(20);
    setServiceCopay({ consultation: 20, dental: 20, procedure: 20, laboratory: 20, lab: 20, radiology: 20, pharmacy: 20, procedures: 20, surgicalProcedure: 20, emergency: 10 });
    setCopayRules({
      consultation: { minPercent: 10, maxPercent: 25, minAmount: 50, maxAmount: 150 },
      dental: { minPercent: 10, maxPercent: 30, minAmount: 40, maxAmount: 120 },
      procedure: { minPercent: 15, maxPercent: 35, minAmount: 75, maxAmount: 250 },
      laboratory: { minPercent: 10, maxPercent: 20, minAmount: 30, maxAmount: 120 },
      lab: { minPercent: 10, maxPercent: 20, minAmount: 30, maxAmount: 120 },
      radiology: { minPercent: 15, maxPercent: 30, minAmount: 60, maxAmount: 220 },
      pharmacy: { minPercent: 5, maxPercent: 20, minAmount: 20, maxAmount: 150 },
      procedures: { minPercent: 15, maxPercent: 35, minAmount: 80, maxAmount: 280 },
      surgicalProcedure: { minPercent: 20, maxPercent: 40, minAmount: 100, maxAmount: 400 },
      emergency: { minPercent: 10, maxPercent: 25, minAmount: 40, maxAmount: 180 },
    });
  };

  const handleNationalIdCardRead = () => {
    const cardProfiles = [
      {
        nationalId: '784-1990-1234567-1',
        title: 'Ms.',
        firstName: 'Aisha',
        middleName: 'Nabil',
        lastName: 'Al Rahmani',
        dob: '1990-04-18',
        gender: 'Female' as const,
        phone: '+971 50 112 4433',
        email: 'aisha.alrahmani@example.com',
        address: 'Villa 22, Al Nahda Street',
        city: 'Dubai',
        emergencyName: 'Nabil Al Rahmani',
        emergencyRelation: 'Father',
        emergencyPhone: '+971 50 778 9921',
      },
      {
        nationalId: '784-1987-7654321-9',
        title: 'Mr.',
        firstName: 'Omar',
        middleName: 'Hassan',
        lastName: 'Bin Salem',
        dob: '1987-11-24',
        gender: 'Male' as const,
        phone: '+971 55 204 1188',
        email: 'omar.bin-salem@example.com',
        address: 'Apartment 4B, Sheikh Zayed Road',
        city: 'Abu Dhabi',
        emergencyName: 'Hassan Bin Salem',
        emergencyRelation: 'Brother',
        emergencyPhone: '+971 50 345 7654',
      },
    ];

    const matchedProfile =
      cardProfiles.find((profile) => profile.nationalId === nationalId.trim()) || cardProfiles[0];

    setIsReadingCard(true);
    window.setTimeout(() => {
      setTitle(matchedProfile.title);
      setFirstName(matchedProfile.firstName);
      setMiddleName(matchedProfile.middleName);
      setLastName(matchedProfile.lastName);
      setDob(matchedProfile.dob);
      setGender(matchedProfile.gender);
      setPhone(matchedProfile.phone);
      setEmail(matchedProfile.email);
      setNationalId(matchedProfile.nationalId);
      setAddress(matchedProfile.address);
      setCity(matchedProfile.city);
      setEmergencyName(matchedProfile.emergencyName);
      setEmergencyRelation(matchedProfile.emergencyRelation);
      setEmergencyPhone(matchedProfile.emergencyPhone);
      setActiveTab('demographics');
      setIsReadingCard(false);
      addNotification('Emirates ID Read', `${matchedProfile.firstName} ${matchedProfile.lastName} details were loaded from the card reader.`, 'success', matchedProfile.nationalId);
    }, 500);
  };

  // Pre-fill if editing existing
  useEffect(() => {
    if (initialPatientId) {
      const existing = patients.find((p) => p.id === initialPatientId);
      if (existing) {
        setTitle(existing.title || 'Mr.');
        setFirstName(existing.firstName || '');
        setMiddleName(existing.middleName || '');
        setLastName(existing.lastName || '');
        setDob(existing.dob || '1990-01-01');
        setGender(existing.gender || 'Male');
        setBloodGroup(existing.bloodGroup || 'O+');
        setMaritalStatus(existing.maritalStatus || 'Single');
        setPhoto(existing.photo || '');
        setPhone(existing.phone || '');
        setEmail(existing.email || '');
        setNationalId(existing.emiratesId || '');
        setPassportNo(existing.passportNo || '');
        setAddress(existing.address || '');
        setEmergencyName(existing.emergencyContact?.name || '');
        setEmergencyRelation(existing.emergencyContact?.relationship || 'Spouse');
        setEmergencyPhone(existing.emergencyContact?.phone || '');
        setStatus(existing.status || 'Outpatient');
        setDepartment(existing.department || 'General Medicine');
        setDoctorId(existing.primaryPhysicianId || doctors[0]?.id || '');
        setWardOrRoom(existing.wardOrRoom || '');
        setChiefComplaint(existing.purposeOfVisit || '');
        setAllergiesInput(existing.allergies?.map((a) => a.allergen).join(', ') || '');
        setChronicInput(existing.chronicConditions?.join(', ') || '');
        setInsuranceProvider(existing.insurance?.provider || 'MetLife Health');
        setPolicyNumber(existing.insurance?.policyNumber || 'POL-992014');
        setTpa(existing.insurance?.tpa || 'TPA 8');
        setMemberId(existing.insurance?.memberId || '52GM0455892711901');
        setDhaMemberId(existing.insurance?.dhaMemberId || 'I137-001-118716420-01');
        setClientNumber(existing.insurance?.clientNumber || 'INS137');
        setCopayPercent(existing.insurance?.copayPercentage || 20);
        setServiceCopay(existing.insurance?.serviceCopay || { consultation: 20, dental: 20, procedure: 20, laboratory: 20, lab: 20, radiology: 20, pharmacy: 20, procedures: 20, surgicalProcedure: 20, emergency: 10 });
        setInsuranceCardImage(existing.insuranceCardImage || '');
        setSupportDocumentImage(existing.supportDocumentImage || '');
        setPayMode(existing.payMode === 'Discount Card' || existing.payMode === 'Company' ? 'Discount Card' : existing.payMode || 'Insurance');
      }
    }
  }, [initialPatientId, patients, doctors, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      addNotification('Validation Error', 'First name and last name are required.', 'warning');
      return;
    }

    if (duplicateMatches.length > 0) {
      const duplicateName = duplicateMatches[0];
      addNotification(
        'Possible Duplicate Patient',
        `${duplicateName.firstName} ${duplicateName.lastName} already exists with similar registration details. Please review before saving.`,
        'warning',
        duplicateName.id
      );
      setActiveTab('contact');
      return;
    }

    const assignedDoctor = doctors.find((d) => d.id === doctorId) || doctors[0];

    const parsedAllergies = allergiesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((item) => ({
        allergen: item,
        severity: 'Moderate' as const,
      }));

    const parsedChronic = chronicInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (initialPatientId) {
      updatePatient(initialPatientId, {
        title,
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        dob,
        age: calculatedAge,
        gender,
        bloodGroup,
        maritalStatus,
        photo,
        phone,
        email,
        emiratesId: nationalId,
        passportNo,
        address: `${address}${city ? `, ${city}` : ''}`,
        emergencyContact: {
          name: emergencyName || 'Next of Kin',
          relationship: emergencyRelation || 'Family',
          phone: emergencyPhone || phone,
        },
        status,
        department,
        primaryPhysicianId: assignedDoctor?.id || 'DOC-01',
        primaryPhysicianName: assignedDoctor?.name || 'Attending Physician',
        wardOrRoom: status === 'Outpatient' ? undefined : wardOrRoom || undefined,
        purposeOfVisit: chiefComplaint,
        allergies: parsedAllergies,
        chronicConditions: parsedChronic,
        insurance: {
          provider: insuranceProvider,
          policyNumber,
          tpa,
          memberId,
          dhaMemberId,
          clientNumber,
          groupNumber: 'GRP-2026',
          validUntil: '2027-12-31',
          copayPercentage: copayPercent,
          status: 'Active',
          verifiedAt: new Date().toISOString(),
          serviceCopay: {
            consultation: serviceCopay.consultation ?? 20,
            dental: serviceCopay.dental ?? 20,
            procedure: serviceCopay.procedure ?? 20,
            laboratory: serviceCopay.laboratory ?? 20,
            lab: serviceCopay.lab ?? 20,
            radiology: serviceCopay.radiology ?? 20,
            pharmacy: serviceCopay.pharmacy ?? 20,
            procedures: serviceCopay.procedures ?? 20,
            surgicalProcedure: serviceCopay.surgicalProcedure ?? 20,
            emergency: serviceCopay.emergency ?? 10,
          },
        },
        insuranceCardImage: insuranceCardImage || undefined,
        supportDocumentImage: supportDocumentImage || undefined,
      });

      addNotification(
        'Patient Record Updated',
        `Successfully updated record for ${firstName} ${lastName}.`,
        'success',
        initialPatientId
      );

      if (onPatientCreated) {
        onPatientCreated(initialPatientId);
      }
      onClose();
      return;
    }

    // Register new patient
    const newPatient = addPatient({
      title,
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      dob,
      age: calculatedAge,
      gender,
      bloodGroup,
      maritalStatus,
      photo,
      phone: phone || '+1 (555) 234-5678',
      email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@hospital.org`,
      address: address ? `${address}, ${city}` : '100 Medical Center Way, Metro City',
      emiratesId: nationalId,
      passportNo,
      emergencyContact: {
        name: emergencyName || 'Next of Kin',
        relationship: emergencyRelation || 'Family',
        phone: emergencyPhone || phone || '+1 (555) 999-0000',
      },
      status,
      department,
      primaryPhysicianId: assignedDoctor?.id || 'DOC-01',
      primaryPhysicianName: assignedDoctor?.name || 'Attending Physician',
      wardOrRoom: status === 'Outpatient' ? undefined : wardOrRoom || (status === 'Inpatient' ? 'Ward A - Room 102' : undefined),
      purposeOfVisit: chiefComplaint || 'Admission & Clinical Examination',
      allergies: parsedAllergies,
      chronicConditions: parsedChronic,
      insurance: {
        provider: payMode === 'Self' ? 'Self-Pay' : insuranceProvider,
        policyNumber: payMode === 'Self' ? 'CASH-PATIENT' : policyNumber,
        tpa: payMode === 'Self' ? undefined : tpa,
        memberId: payMode === 'Self' ? undefined : memberId,
        dhaMemberId: payMode === 'Self' ? undefined : dhaMemberId,
        clientNumber: payMode === 'Self' ? undefined : clientNumber,
        groupNumber: 'GRP-2026',
        validUntil: '2027-12-31',
        copayPercentage: payMode === 'Self' ? 100 : copayPercent,
        status: 'Active',
        verifiedAt: new Date().toISOString(),
        serviceCopay: {
          consultation: serviceCopay.consultation ?? 20,
          dental: serviceCopay.dental ?? 20,
          procedure: serviceCopay.procedure ?? 20,
          laboratory: serviceCopay.laboratory ?? 20,
          lab: serviceCopay.lab ?? 20,
          radiology: serviceCopay.radiology ?? 20,
          pharmacy: serviceCopay.pharmacy ?? 20,
          procedures: serviceCopay.procedures ?? 20,
          surgicalProcedure: serviceCopay.surgicalProcedure ?? 20,
          emergency: serviceCopay.emergency ?? 10,
        },
      },
      insuranceCardImage: insuranceCardImage || undefined,
      supportDocumentImage: supportDocumentImage || undefined,
      payMode: payMode === 'Discount Card' ? 'Discount Card' : payMode,
    }, registrationType);

    const paymentScheme: {
      schemeType: PaymentSchemeType;
      insuranceProvider?: string;
      policyNumber?: string;
      coveragePercent?: number;
      discountCardName?: string;
      discountPercent?: number;
    } =
      payMode === 'Insurance'
        ? {
            schemeType: 'Insurance',
            insuranceProvider,
            policyNumber,
            coveragePercent: Math.max(0, 100 - copayPercent),
          }
        : payMode === 'Discount Card'
        ? {
            schemeType: 'Discount Card',
            discountCardName,
            discountPercent,
          }
        : { schemeType: 'Self-Pay' };

    addNotification(
      'Patient Admitted Successfully',
      `${newPatient.firstName} ${newPatient.lastName} (${newPatient.id}) registered and queued for ${registrationType === 'Consultation' ? department : 'registration and billing'}.`,
      'success',
      newPatient.id
    );

    if (assignedDoctor && registrationType === 'Consultation') {
      addNotification(
        'Doctor Walk-in Alert',
        `Walk-in patient ${newPatient.firstName} ${newPatient.lastName} has been registered for ${assignedDoctor.name} in ${department}.`,
        'info',
        assignedDoctor.id
      );
    }

    if (onPatientCreated) {
      onPatientCreated(newPatient.id);
    }

    onClose();
  };

  const normalizeValue = (value: string) => value.replace(/[^a-z0-9]/gi, '').toLowerCase();

  const duplicateMatches = patients.filter((patient) => {
    if (initialPatientId && patient.id === initialPatientId) return false;

    const currentFullName = `${firstName} ${middleName} ${lastName}`.trim();
    const patientFullName = `${patient.firstName} ${patient.middleName || ''} ${patient.lastName}`.trim();
    const sameName = currentFullName && patientFullName && normalizeValue(currentFullName) === normalizeValue(patientFullName);
    const sameDob = !!dob && !!patient.dob && dob === patient.dob;
    const samePhone = !!phone && !!patient.phone && normalizeValue(phone) === normalizeValue(patient.phone);
    const sameNationalId = !!nationalId && !!patient.emiratesId && normalizeValue(nationalId) === normalizeValue(patient.emiratesId);
    const samePassport = !!passportNo && !!patient.passportNo && normalizeValue(passportNo) === normalizeValue(patient.passportNo);

    return samePhone || sameNationalId || samePassport || (sameName && sameDob);
  }).slice(0, 3);

  const finalSummary = {
    patient: `${title} ${firstName} ${middleName ? `${middleName} ` : ''}${lastName}`.trim(),
    phone: phone || 'Not provided',
    dob: dob || 'Not provided',
    department: department || 'General Medicine',
    doctor: doctors.find((d) => d.id === doctorId)?.name || 'To be assigned',
    payment: payMode === 'Self' ? 'Self-Pay' : payMode === 'Discount Card' ? 'Discount Card' : 'Insurance / TPA',
    visit: chiefComplaint || 'Not specified',
    insurance: payMode === 'Insurance' ? insuranceProvider : payMode === 'Discount Card' ? discountCardName : 'Self-pay patient',
  };

  const availableBeds = wardBeds.filter((b) => b.status === 'Available');
  const serviceRates = { consultation: 150, laboratory: 120, radiology: 250, pharmacy: 80, procedures: 500, emergency: 300 };
  const estimatedTotal = Object.values(serviceRates).reduce((total, amount) => total + amount, 0);
  const averageCopay = Object.values(serviceCopay).reduce((total, percent) => total + percent, 0) / Object.values(serviceCopay).length;
  const estimatedPatientPayable = payMode === 'Self'
    ? estimatedTotal
    : payMode === 'Discount Card'
    ? Math.round(estimatedTotal * (1 - discountPercent / 100))
    : Math.round(estimatedTotal * (averageCopay / 100));

  const InsuranceColumnPanel = () => (
    <aside className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-3">
      <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Insurance column
      </div>
      <div className="space-y-2 text-[11px] text-slate-700">
        <div className="rounded-lg bg-white border border-slate-200 p-2.5">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">Payment mode</div>
          <div className="mt-1 font-semibold text-slate-900">{payMode}</div>
        </div>
        <div className="rounded-lg bg-white border border-slate-200 p-2.5">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">Provider</div>
          <div className="mt-1 font-semibold text-slate-900">{payMode === 'Insurance' ? insuranceProvider : payMode === 'Discount Card' ? discountCardName : 'Self-pay patient'}</div>
        </div>
        <div className="rounded-lg bg-white border border-slate-200 p-2.5">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">Policy / card</div>
          <div className="mt-1 font-semibold text-slate-900">{payMode === 'Insurance' ? policyNumber : payMode === 'Discount Card' ? 'Discount card active' : 'Cash / direct payment'}</div>
        </div>
        <div className="rounded-lg bg-white border border-slate-200 p-2.5">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">{payMode === 'Insurance' ? 'Co-pay' : payMode === 'Discount Card' ? 'Discount %' : 'Applicable'}</div>
          <div className="mt-1 font-semibold text-slate-900">
            {payMode === 'Insurance' ? `${Math.round(averageCopay)}%` : payMode === 'Discount Card' ? `${discountPercent}%` : 'N/A (self-pay)'}
          </div>
        </div>
      </div>
    </aside>
  );

  const RegistrationSummarySidebar = () => (
    <aside className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Registration snapshot
        </div>
        <div className="space-y-2 text-[11px] text-slate-700">
          <div className="rounded-lg bg-white border border-slate-200 p-2.5">
            <div className="text-[10px] uppercase tracking-wide text-slate-500">Patient</div>
            <div className="mt-1 font-semibold text-slate-900">{finalSummary.patient}</div>
          </div>
          <div className="rounded-lg bg-white border border-slate-200 p-2.5">
            <div className="text-[10px] uppercase tracking-wide text-slate-500">Department</div>
            <div className="mt-1 font-semibold text-slate-900">{finalSummary.department}</div>
          </div>
          <div className="rounded-lg bg-white border border-slate-200 p-2.5">
            <div className="text-[10px] uppercase tracking-wide text-slate-500">Doctor</div>
            <div className="mt-1 font-semibold text-slate-900">{finalSummary.doctor}</div>
          </div>
          <div className="rounded-lg bg-white border border-slate-200 p-2.5">
            <div className="text-[10px] uppercase tracking-wide text-slate-500">Payment</div>
            <div className="mt-1 font-semibold text-slate-900">{finalSummary.payment}</div>
          </div>
        </div>
      </div>

      {duplicateMatches.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-600" /> Possible duplicate record
          </div>
          <ul className="mt-2 space-y-1 text-[11px]">
            {duplicateMatches.map((item) => (
              <li key={item.id}>
                {item.firstName} {item.lastName} — {item.phone || item.emiratesId || item.passportNo || 'similar ID'}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="p-4 bg-blue-50/60 rounded-lg border border-blue-200 space-y-3">
        <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs">
          <FileText className="w-4 h-4 text-blue-600" /> Quick view
        </div>
        <div className="space-y-2 text-[11px]">
          <div><span className="block text-[10px] text-slate-500">Contact</span><strong className="text-slate-900">{finalSummary.phone}</strong></div>
          <div><span className="block text-[10px] text-slate-500">DOB</span><strong className="text-slate-900">{finalSummary.dob}</strong></div>
          <div><span className="block text-[10px] text-slate-500">Chief Complaint</span><strong className="text-slate-900">{finalSummary.visit}</strong></div>
        </div>
      </div>

      <div className="p-4 bg-blue-50/60 rounded-lg border border-blue-200 space-y-3">
        <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs">
          <FileText className="w-4 h-4 text-blue-600" /> Financial summary
        </div>
        <div className="space-y-2 text-[11px]">
          <div><span className="block text-[10px] text-slate-500">Estimated services</span><strong className="text-slate-900">${estimatedTotal}</strong></div>
          <div><span className="block text-[10px] text-slate-500">Average co-pay</span><strong className="text-slate-900">{Math.round(averageCopay)}%</strong></div>
          <div><span className="block text-[10px] text-slate-500">Patient payable</span><strong className="text-amber-700">${estimatedPatientPayable}</strong></div>
        </div>
      </div>
    </aside>
  );

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base text-white">
                {initialPatientId ? 'Update Patient Record' : 'Patient Admission & EMR Registration'}
              </h2>
              <p className="text-xs text-slate-400">
                MedCore Clinical Information System — Intake & Master Patient Index
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 text-xs font-medium pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('demographics')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'demographics'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Patient Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'contact'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            Contact
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('clinical')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'clinical'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            Visit / Doctor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('insurance')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'insurance'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Insurance Details
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: DEMOGRAPHICS */}
          {activeTab === 'demographics' && (
            <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_0.8fr] gap-4">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="w-24 h-24 rounded-lg border border-slate-300 bg-white overflow-hidden flex items-center justify-center shrink-0">
                  {photo ? <img src={photo} alt="Patient preview" className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-slate-300" />}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Patient Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setPhoto(typeof reader.result === 'string' ? reader.result : '');
                      reader.readAsDataURL(file);
                    }}
                    className="w-full text-xs text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Upload a patient reference photo for identification.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Prefix / Title</label>
                  <select
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Master">Master</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. John"
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="Optional"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Doe"
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Date of Birth</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Calculated Age</label>
                  <div className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 font-semibold">
                    {calculatedAge} years old
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="A+">A Positive (A+)</option>
                    <option value="A-">A Negative (A-)</option>
                    <option value="B+">B Positive (B+)</option>
                    <option value="B-">B Negative (B-)</option>
                    <option value="AB+">AB Positive (AB+)</option>
                    <option value="AB-">AB Negative (AB-)</option>
                    <option value="O+">O Positive (O+)</option>
                    <option value="O-">O Negative (O-)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Marital Status</label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                </div>
              </div>
              <div className="space-y-4">
                <InsuranceColumnPanel />
                <RegistrationSummarySidebar />
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT & IDENTIFICATION */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_0.8fr] gap-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Primary Phone Number</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patient@email.com"
                      className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">National ID / Emirates ID / SSN</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      placeholder="784-1990-1234567-1"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleNationalIdCardRead}
                      disabled={isReadingCard}
                      className="px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-[10px] font-bold hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isReadingCard ? 'Reading...' : 'Read ID'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Passport Number</label>
                  <input
                    type="text"
                    value={passportNo}
                    onChange={(e) => setPassportNo(e.target.value)}
                    placeholder="N98234120"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-slate-700 block mb-1">Residential Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="42 Medical Plaza, Suite 300"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">City / Region</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Metropolis"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <h4 className="text-xs font-semibold text-slate-800 mb-2">Emergency Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Relationship</label>
                    <input
                      type="text"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      placeholder="Spouse / Parent / Sibling"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Emergency Phone</label>
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="+1 (555) 999-1234"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
                </div>
              </div>
              <div className="space-y-4">
                <InsuranceColumnPanel />
                <RegistrationSummarySidebar />
              </div>
            </div>
          )}

          {/* TAB 3: CLINICAL & ADMISSION */}
          {activeTab === 'clinical' && (
            <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_0.8fr] gap-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Admission Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PatientStatus)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Outpatient">Outpatient (OPD Walk-in / Scheduled)</option>
                    <option value="Inpatient">Inpatient (Ward Admission)</option>
                    <option value="Emergency">Emergency (Immediate ER / STAT)</option>
                    <option value="Observation">Observation (Day-Care / Clinical Stay)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Clinical Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Emergency Medicine">Emergency Medicine</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Oncology">Oncology</option>
                    <option value="Pulmonology">Pulmonology</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Attending Physician</label>
                  <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.specialty} ({d.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    {status === 'Outpatient' ? 'Consultation Room' : 'Assigned Ward Bed'}
                  </label>
                  {status === 'Outpatient' ? (
                    <input
                      type="text"
                      value={wardOrRoom}
                      onChange={(e) => setWardOrRoom(e.target.value)}
                      placeholder="e.g. OPD Room 104"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  ) : (
                    <select
                      value={wardOrRoom}
                      onChange={(e) => setWardOrRoom(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    >
                      <option value="">-- Select Available Hospital Bed --</option>
                      {availableBeds.map((bed) => (
                        <option key={bed.id} value={bed.bedNumber}>
                          {bed.bedNumber} ({bed.wardName} - {bed.roomType})
                        </option>
                      ))}
                      {!availableBeds.some((b) => b.bedNumber === wardOrRoom) && wardOrRoom && (
                        <option value={wardOrRoom}>{wardOrRoom} (Currently Assigned)</option>
                      )}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Chief Complaint / Purpose of Visit</label>
                <textarea
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Describe patient's symptoms, presentation, or referral reason..."
                  rows={2}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Known Allergies <span className="text-slate-400 font-normal">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={allergiesInput}
                    onChange={(e) => setAllergiesInput(e.target.value)}
                    placeholder="e.g. Penicillin, Latex, NSAIDs"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Chronic Conditions <span className="text-slate-400 font-normal">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={chronicInput}
                    onChange={(e) => setChronicInput(e.target.value)}
                    placeholder="e.g. Hypertension, Type 2 Diabetes"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                </div>
              </div>
              <div className="space-y-4">
                <InsuranceColumnPanel />
                <RegistrationSummarySidebar />
              </div>
            </div>
          )}

          {/* TAB 4: INSURANCE & BILLING */}
          {activeTab === 'insurance' && (
            <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_0.8fr] gap-4">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Registration Queue Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Consultation', 'Non-Consultation', 'Technician'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setRegistrationType(type)}
                        className={`p-3 rounded-lg border text-xs font-medium text-left transition-all cursor-pointer ${
                          registrationType === type
                            ? 'border-blue-600 bg-blue-50/50 text-blue-800 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-semibold">{type} Registration Token</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {type === 'Consultation'
                            ? 'Route to nursing and doctor EMR'
                            : type === 'Technician'
                              ? 'Route to physiotherapy technician desk'
                              : 'Route to cashier, lab, radiology, or procedure'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {registrationType === 'Technician' && (
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Physio Technician</label>
                    <select
                      value={physioTechnician}
                      onChange={(e) => setPhysioTechnician(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    >
                      {['Ahmed Hassan - Physiotherapy Technician', 'Zainab Noor - Physiotherapy Technician', 'Nadia Salem - Physiotherapy Technician'].map((tech) => (
                        <option key={tech} value={tech}>{tech}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Payment Mode</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Insurance', 'Self', 'Discount Card'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPayMode(mode)}
                        className={`p-3 rounded-lg border text-xs font-medium text-center transition-all cursor-pointer ${
                          payMode === mode
                            ? 'border-blue-600 bg-blue-50/50 text-blue-800 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-semibold">{mode === 'Self' ? 'Self-Pay / Cash' : mode === 'Discount Card' ? 'Discount Card' : mode}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {mode === 'Insurance'
                            ? 'Direct TPA Billing'
                            : mode === 'Self'
                            ? 'Immediate Patient Payment'
                            : 'Apply an approved discount card'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {payMode === 'Insurance' ? (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-slate-800 font-medium text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Insurance Policy Verification Details
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">Insurance Company / TPA</label>
                        <input
                          type="text"
                          value={insuranceProvider}
                          onChange={(e) => setInsuranceProvider(e.target.value)}
                          placeholder="e.g. Aetna, Blue Cross, Cigna, Daman"
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">TPA</label>
                        <input
                          type="text"
                          value={tpa}
                          onChange={(e) => setTpa(e.target.value)}
                          placeholder="e.g. TPA 8"
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">Member ID</label>
                        <input
                          type="text"
                          value={memberId}
                          onChange={(e) => setMemberId(e.target.value)}
                          placeholder="Enter member ID"
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">Emirates ID</label>
                        <input
                          type="text"
                          value={nationalId}
                          onChange={(e) => setNationalId(e.target.value)}
                          placeholder="784-0000-0000000-0"
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">DHA Member ID</label>
                        <input
                          type="text"
                          value={dhaMemberId}
                          onChange={(e) => setDhaMemberId(e.target.value)}
                          placeholder="Enter DHA member ID"
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">Policy Number</label>
                        <input
                          type="text"
                          value={policyNumber}
                          onChange={(e) => setPolicyNumber(e.target.value)}
                          placeholder="Enter policy number"
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">Client Number</label>
                        <input
                          type="text"
                          value={clientNumber}
                          onChange={(e) => setClientNumber(e.target.value)}
                          placeholder="e.g. INS137"
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">Patient Copay (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={copayPercent}
                          onChange={(e) => setCopayPercent(Number(e.target.value))}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">Pre-Authorization Status</label>
                        <div className="flex items-center gap-1.5 py-2 text-xs text-emerald-700 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Eligible for Automated Electronic eClaims
                        </div>
                      </div>
                    </div>
                  </div>
                ) : payMode === 'Discount Card' ? (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-slate-800 font-medium text-xs">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      Discount Card Details
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">Card Name</label>
                        <input
                          type="text"
                          value={discountCardName}
                          onChange={(e) => setDiscountCardName(e.target.value)}
                          placeholder="e.g. Senior Citizen Card"
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">Discount (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={discountPercent}
                          onChange={(e) => setDiscountPercent(Number(e.target.value))}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Self-Pay Policy Notice:</span>
                      <p className="mt-0.5 text-amber-700">
                        Patient is registered as self-pay. Hospital tariff items will be billed directly to the patient invoice with zero insurance deduction.
                      </p>
                    </div>
                  </div>
                )}

                {payMode === 'Insurance' && (
                  <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs"><CreditCard className="w-4 h-4 text-blue-600" /> Co-Pay Configuration</div>
                    <p className="text-[10px] text-slate-500">Insurance co-pay applies only when the patient is under insurance coverage.</p>

                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-slate-200 rounded-lg overflow-hidden text-[10px]">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="border border-slate-200 px-2 py-2 text-left font-semibold text-slate-700">Service</th>
                            <th className="border border-slate-200 px-2 py-2 text-center font-semibold text-slate-700">Co-pay %</th>
                            <th className="border border-slate-200 px-2 py-2 text-center font-semibold text-slate-700">Min %</th>
                            <th className="border border-slate-200 px-2 py-2 text-center font-semibold text-slate-700">Max %</th>
                            <th className="border border-slate-200 px-2 py-2 text-center font-semibold text-slate-700">Min Amount</th>
                            <th className="border border-slate-200 px-2 py-2 text-center font-semibold text-slate-700">Max Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {([
                            ['consultation', 'Consultation'], ['dental', 'Dental'], ['procedure', 'Procedure'],
                            ['pharmacy', 'Pharmacy'], ['surgicalProcedure', 'Surgical Procedure'], ['lab', 'Lab'],
                            ['radiology', 'Radiology'], ['laboratory', 'Laboratory'], ['emergency', 'Emergency'],
                          ] as const).map(([key, label]) => (
                            <tr key={key} className="bg-white">
                              <td className="border border-slate-200 px-2 py-2 text-slate-700 font-medium">{label}</td>
                              <td className="border border-slate-200 px-2 py-2">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={serviceCopay[key] ?? 0}
                                  onChange={(e) => setServiceCopay((current) => ({ ...current, [key]: Math.min(100, Math.max(0, Number(e.target.value) || 0)) }))}
                                  className="w-full bg-white border border-slate-300 rounded-md p-1.5 text-center focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                />
                              </td>
                              <td className="border border-slate-200 px-2 py-2">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={copayRules[key].minPercent}
                                  onChange={(e) => setCopayRules((current) => ({
                                    ...current,
                                    [key]: { ...current[key], minPercent: Math.min(100, Math.max(0, Number(e.target.value) || 0)) },
                                  }))}
                                  className="w-full bg-white border border-slate-300 rounded-md p-1.5 text-center focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                />
                              </td>
                              <td className="border border-slate-200 px-2 py-2">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={copayRules[key].maxPercent}
                                  onChange={(e) => setCopayRules((current) => ({
                                    ...current,
                                    [key]: { ...current[key], maxPercent: Math.min(100, Math.max(0, Number(e.target.value) || 0)) },
                                  }))}
                                  className="w-full bg-white border border-slate-300 rounded-md p-1.5 text-center focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                />
                              </td>
                              <td className="border border-slate-200 px-2 py-2">
                                <input
                                  type="number"
                                  min={0}
                                  value={copayRules[key].minAmount}
                                  onChange={(e) => setCopayRules((current) => ({
                                    ...current,
                                    [key]: { ...current[key], minAmount: Math.max(0, Number(e.target.value) || 0) },
                                  }))}
                                  className="w-full bg-white border border-slate-300 rounded-md p-1.5 text-center focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                />
                              </td>
                              <td className="border border-slate-200 px-2 py-2">
                                <input
                                  type="number"
                                  min={0}
                                  value={copayRules[key].maxAmount}
                                  onChange={(e) => setCopayRules((current) => ({
                                    ...current,
                                    [key]: { ...current[key], maxAmount: Math.max(0, Number(e.target.value) || 0) },
                                  }))}
                                  className="w-full bg-white border border-slate-300 rounded-md p-1.5 text-center focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {payMode === 'Discount Card' && (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs"><CreditCard className="w-4 h-4 text-amber-600" /> Discount Card Configuration</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">Discount %</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={discountPercent}
                          onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">Discount Card</label>
                        <div className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-700">{discountCardName || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {payMode === 'Self' && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 text-xs">
                    <div className="font-semibold text-slate-800 mb-1">Self-pay registration</div>
                    Co-pay configuration is not applicable for self-pay patients. Only direct patient billing is used.
                  </div>
                )}

                {(payMode === 'Insurance' || payMode === 'Discount Card') && (
                  <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs"><FileText className="w-4 h-4 text-blue-600" /> Insurance Card & Supporting Document Scan</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-[11px] font-medium text-slate-600 block">Insurance Card Capture</label>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => setInsuranceCardImage(typeof reader.result === 'string' ? reader.result : '');
                            reader.readAsDataURL(file);
                          }}
                          className="w-full text-[10px] text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-blue-50 file:px-2 file:py-1.5 file:text-[10px] file:font-semibold file:text-blue-700"
                        />
                        {insuranceCardImage && <img src={insuranceCardImage} alt="Insurance card preview" className="h-24 w-full object-cover rounded-lg border border-slate-200" />}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-medium text-slate-600 block">Supporting Document Scan</label>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => setSupportDocumentImage(typeof reader.result === 'string' ? reader.result : '');
                            reader.readAsDataURL(file);
                          }}
                          className="w-full text-[10px] text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-blue-50 file:px-2 file:py-1.5 file:text-[10px] file:font-semibold file:text-blue-700"
                        />
                        {supportDocumentImage && <img src={supportDocumentImage} alt="Supporting document preview" className="h-24 w-full object-cover rounded-lg border border-slate-200" />}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <aside className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Insurance Details</div>
                  <div className="space-y-2 text-[11px] text-slate-700">
                    <div className="rounded-lg bg-white border border-slate-200 p-2.5">
                      <div className="text-[10px] uppercase tracking-wide text-slate-500">Payment Mode</div>
                      <div className="mt-1 font-semibold text-slate-900">{payMode}</div>
                    </div>
                    <div className="rounded-lg bg-white border border-slate-200 p-2.5">
                      <div className="text-[10px] uppercase tracking-wide text-slate-500">Provider</div>
                      <div className="mt-1 font-semibold text-slate-900">{payMode === 'Insurance' ? insuranceProvider : payMode === 'Discount Card' ? discountCardName : 'Self-pay patient'}</div>
                    </div>
                    <div className="rounded-lg bg-white border border-slate-200 p-2.5">
                      <div className="text-[10px] uppercase tracking-wide text-slate-500">Policy / Card</div>
                      <div className="mt-1 font-semibold text-slate-900">{payMode === 'Insurance' ? policyNumber : payMode === 'Discount Card' ? 'Discount card active' : 'Cash / direct payment'}</div>
                    </div>
                    <div className="rounded-lg bg-white border border-slate-200 p-2.5">
                      <div className="text-[10px] uppercase tracking-wide text-slate-500">Co-Pay</div>
                      <div className="mt-1 font-semibold text-slate-900">{Math.round(averageCopay)}%</div>
                    </div>
                  </div>
                </div>

                {duplicateMatches.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                    <div className="flex items-center gap-2 text-xs font-semibold"><AlertCircle className="w-4 h-4 text-amber-600" /> Possible duplicate record</div>
                    <ul className="mt-2 space-y-1 text-[11px]">
                      {duplicateMatches.map((item) => (
                        <li key={item.id}>
                          {item.firstName} {item.lastName} — {item.phone || item.emiratesId || item.passportNo || 'similar ID'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-4 bg-blue-50/60 rounded-lg border border-blue-200 space-y-3">
                  <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs"><FileText className="w-4 h-4 text-blue-600" /> Registration Summary</div>
                  <div className="space-y-2 text-[11px]">
                    <div><span className="block text-[10px] text-slate-500">Patient</span><strong className="text-slate-900">{finalSummary.patient}</strong></div>
                    <div><span className="block text-[10px] text-slate-500">Contact</span><strong className="text-slate-900">{finalSummary.phone}</strong></div>
                    <div><span className="block text-[10px] text-slate-500">Doctor</span><strong className="text-slate-900">{finalSummary.doctor}</strong></div>
                    <div><span className="block text-[10px] text-slate-500">Visit</span><strong className="text-slate-900">{finalSummary.visit}</strong></div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50/60 rounded-lg border border-blue-200 space-y-3">
                  <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs"><FileText className="w-4 h-4 text-blue-600" /> Financial Summary</div>
                  <div className="space-y-2 text-[11px]">
                    <div><span className="block text-[10px] text-slate-500">Estimated Services</span><strong className="text-slate-900">${estimatedTotal}</strong></div>
                    <div><span className="block text-[10px] text-slate-500">Average Co-Pay</span><strong className="text-slate-900">{Math.round(averageCopay)}%</strong></div>
                    <div><span className="block text-[10px] text-slate-500">Patient Payable</span><strong className="text-amber-700">${estimatedPatientPayable}</strong></div>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={clearForm}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
            <div className="flex items-center gap-2">
              {activeTab !== 'insurance' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'demographics') setActiveTab('contact');
                    else if (activeTab === 'contact') setActiveTab('clinical');
                    else if (activeTab === 'clinical') setActiveTab('insurance');
                  }}
                  className="px-4 py-2 text-xs font-medium bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Next Step
                </button>
              ) : null}
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                {initialPatientId ? 'Save Changes' : 'Complete Admission'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
