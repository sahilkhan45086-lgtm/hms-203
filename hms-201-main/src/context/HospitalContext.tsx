import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Patient,
  Doctor,
  Appointment,
  Invoice,
  BillItem,
  WardBed,
  LiveNotification,
  AppointmentStatus,
  Vitals,
  Medication,
  ClinicalNote,
  LabResult,
  PaymentTransaction,
  PaymentMethod,
  UserRole,
  StaffMember,
  DepartmentPortal,
  PharmacyItem,
  AuditLog,
  SystemCompliance,
  AppTheme,
  TriageAssessment,
  RoleDefinition,
  AdvancePayment,
  RefundPayment,
  InsuranceApproval,
  PosTransaction,
  ReceptionToken,
  TokenWorkflowStage,
  TokenPaymentScheme,
  TokenVitalsRecord,
  TokenDoctorOrder,
  TokenBillingSummary,
  TokenDiagnosticReport,
  DoctorDutyChangeRequest,
  DoctorDutySchedule,
} from '../types';
import { getPatientPhoto } from '../utils/patientImages';
import {
  initialPatients,
  initialDoctors,
  initialAppointments,
  initialInvoices,
  initialWardBeds,
  initialStaff,
  initialPharmacy,
  initialAuditLogs,
  initialCompliance,
  initialAdvancePayments,
  initialRefundPayments,
  initialInsuranceApprovals,
  initialPosTransactions,
  initialReceptionTokens,
} from '../mockData';

export type NavigationTab =
  | 'overview'
  | 'registration'
  | 'patients'
  | 'enquiry'
  | 'inpatient'
  | 'outpatient'
  | 'triage'
  | 'appointments'
  | 'doctor-rota'
  | 'billing'
  | 'pharmacy'
  | 'labs'
  | 'radiology'
  | 'wards'
  | 'pricelist'
  | 'staff'
  | 'coder'
  | 'reports'
  | 'admin';

export type RegistrationMode = 'new' | 'existing' | 'appointment' | 'edit';

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  admin: {
    role: 'admin',
    label: 'Hospital Administrator',
    description: 'Full supervisory authority across clinical, financial, and compliance modules.',
    permissions: {
      canRegisterPatients: true,
      canEditEMR: true,
      canPrescribeMeds: true,
      canDispenseMeds: true,
      canRunLabTests: true,
      canReviewRadiology: true,
      canManageBilling: true,
      canAccessAuditLogs: true,
    },
  },
  doctor: {
    role: 'doctor',
    label: 'Attending Physician',
    description: 'Diagnose patients, write clinical notes, prescribe meds, review diagnostics.',
    permissions: {
      canRegisterPatients: true,
      canEditEMR: true,
      canPrescribeMeds: true,
      canDispenseMeds: false,
      canRunLabTests: true,
      canReviewRadiology: true,
      canManageBilling: false,
      canAccessAuditLogs: false,
    },
  },
  nurse: {
    role: 'nurse',
    label: 'Registered Nurse',
    description: 'Record vitals, administer medications, manage ward bed allocations.',
    permissions: {
      canRegisterPatients: true,
      canEditEMR: true,
      canPrescribeMeds: false,
      canDispenseMeds: true,
      canRunLabTests: true,
      canReviewRadiology: true,
      canManageBilling: false,
      canAccessAuditLogs: false,
    },
  },
  pharmacist: {
    role: 'pharmacist',
    label: 'Clinical Pharmacist',
    description: 'Formulary inventory management, dispense meds, safety screening.',
    permissions: {
      canRegisterPatients: false,
      canEditEMR: false,
      canPrescribeMeds: false,
      canDispenseMeds: true,
      canRunLabTests: false,
      canReviewRadiology: false,
      canManageBilling: true,
      canAccessAuditLogs: false,
    },
  },
  receptionist: {
    role: 'receptionist',
    label: 'Patient Registrar',
    description: 'Patient check-in, schedule appointments, queue triage, invoicing.',
    permissions: {
      canRegisterPatients: true,
      canEditEMR: false,
      canPrescribeMeds: false,
      canDispenseMeds: false,
      canRunLabTests: false,
      canReviewRadiology: false,
      canManageBilling: true,
      canAccessAuditLogs: false,
    },
  },
  lab: {
    role: 'lab',
    label: 'Lab Technologist',
    description: 'Pathology specimen processing, biochemistry assays, critical flag verification.',
    permissions: {
      canRegisterPatients: false,
      canEditEMR: false,
      canPrescribeMeds: false,
      canDispenseMeds: false,
      canRunLabTests: true,
      canReviewRadiology: false,
      canManageBilling: false,
      canAccessAuditLogs: false,
    },
  },
  radiology: {
    role: 'radiology',
    label: 'Diagnostic Radiologist',
    description: 'DICOM imaging reviews, PACS modality triage, radiologic diagnostic reports.',
    permissions: {
      canRegisterPatients: false,
      canEditEMR: true,
      canPrescribeMeds: false,
      canDispenseMeds: false,
      canRunLabTests: false,
      canReviewRadiology: true,
      canManageBilling: false,
      canAccessAuditLogs: false,
    },
  },
  'medical-coder': {
    role: 'medical-coder',
    label: 'Medical Coder',
    description: 'Review insurance pre-authorizations and publish approved diagnostic reports to patient records.',
    permissions: {
      canRegisterPatients: false,
      canEditEMR: false,
      canPrescribeMeds: false,
      canDispenseMeds: false,
      canRunLabTests: false,
      canReviewRadiology: false,
      canManageBilling: false,
      canAccessAuditLogs: false,
    },
  },
};

interface HospitalContextType {
  patients: Patient[];
  doctors: Doctor[];
  doctorDutySchedules: DoctorDutySchedule[];
  doctorDutyChangeRequests: DoctorDutyChangeRequest[];
  appointments: Appointment[];
  invoices: Invoice[];
  advancePayments: AdvancePayment[];
  refundPayments: RefundPayment[];
  insuranceApprovals: InsuranceApproval[];
  posTransactions: PosTransaction[];
  receptionTokens: ReceptionToken[];
  wardBeds: WardBed[];
  staff: StaffMember[];
  pharmacy: PharmacyItem[];
  auditLogs: AuditLog[];
  compliance: SystemCompliance;
  notifications: LiveNotification[];
  selectedPatient: Patient | null;
  selectedPatientId: string | null;
  activeTab: NavigationTab;
  registrationMode: RegistrationMode;
  currentRole: UserRole;
  currentUser: StaffMember;
  currentRoleDefinition: RoleDefinition;
  isAuthenticated: boolean;
  authenticatedUser: StaffMember | null;
  departmentPortal: DepartmentPortal | null;
  appTheme: AppTheme;
  setAppTheme: (theme: AppTheme) => void;
  showPortalSelect: boolean;
  setShowPortalSelect: (show: boolean) => void;
  login: (userId: string, password?: string) => { success: boolean; message?: string };
  logout: () => void;
  selectDepartmentPortal: (portal: DepartmentPortal) => void;
  setCurrentRole: (role: UserRole) => void;
  setCurrentUserId: (id: string) => void;
  setActiveTab: (tab: NavigationTab) => void;
  setRegistrationMode: (mode: RegistrationMode) => void;
  setSelectedPatientId: (id: string | null) => void;
  // Patient Actions
  addPatient: (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'vitals' | 'medications' | 'labResults' | 'clinicalNotes'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  updatePatientStatus: (id: string, status: Patient['status']) => void;
  addVitals: (patientId: string, vitals: Omit<Vitals, 'recordedAt'>) => void;
  addTriageAssessment: (patientId: string, assessment: Omit<TriageAssessment, 'id' | 'assessedAt'>) => TriageAssessment;
  addMedication: (patientId: string, medication: Omit<Medication, 'id'>) => void;
  addPrescription: (patientId: string, prescription: any) => void;
  addClinicalNote: (patientId: string, note: Omit<ClinicalNote, 'id' | 'date'>) => void;
  addLabResult: (patientId: string, lab: Omit<LabResult, 'id'>) => void;
  updateLabResult: (patientId: string, labId: string, updates: Partial<LabResult>) => void;
  dischargePatient: (patientId: string) => void;
  // Appointment Actions
  bookAppointment: (aptData: Omit<Appointment, 'id' | 'queueNumber' | 'createdAt'>) => Appointment;
  addAppointment: (aptData: any) => Appointment;
  updateAppointmentStatus: (aptId: string, status: AppointmentStatus, cancellation?: { reason: string; details?: string }) => void;
  callNextAppointment: (doctorId?: string) => void;
  // Billing Actions
  createInvoice: (invData: Omit<Invoice, 'id' | 'subtotal' | 'patientPayable' | 'amountPaid' | 'balanceDue' | 'transactions'>) => Invoice;
  processPayment: (invoiceId: string, paymentData: { amount: number; method: PaymentMethod; cardLast4?: string }) => Promise<{ success: boolean; transaction: PaymentTransaction }>;
  addAdvancePayment: (data: Omit<AdvancePayment, 'id' | 'receiptNumber'>) => AdvancePayment;
  addRefundPayment: (data: Omit<RefundPayment, 'id' | 'voucherNumber'>) => RefundPayment;
  addInsuranceApproval: (data: Omit<InsuranceApproval, 'id'>) => InsuranceApproval | null;
  updateInsuranceApprovalStatus: (id: string, status: Exclude<InsuranceApproval['approvalStatus'], 'Approved'>, remarks?: string) => void;
  publishInsuranceApproval: (id: string, details: Pick<InsuranceApproval, 'approvalNumber' | 'approvedAmount' | 'copayPercentage' | 'validUntil'>) => void;
  addPosTransaction: (data: Omit<PosTransaction, 'id' | 'rrnNumber'>) => PosTransaction;
  createReceptionToken: (data: Omit<ReceptionToken, 'id' | 'tokenNumber' | 'createdTime'>) => ReceptionToken;
  updateReceptionTokenStatus: (id: string, status: ReceptionToken['status']) => void;
  advanceTokenWorkflow: (tokenId: string, nextStage: TokenWorkflowStage, updates?: Partial<ReceptionToken>) => void;
  updateTokenVitals: (tokenId: string, vitals: TokenVitalsRecord) => void;
  updateTokenDoctorOrders: (tokenId: string, orders: TokenDoctorOrder) => void;
  settleTokenBilling: (tokenId: string, billing: TokenBillingSummary) => void;
  completeTokenDiagnosticReport: (tokenId: string, report: TokenDiagnosticReport) => void;
  // Ward Actions
  assignBedToPatient: (bedId: string, patientId: string) => void;
  releaseBed: (bedId: string) => void;
  // Staff Actions
  addStaff: (member: Omit<StaffMember, 'id' | 'isActive'>) => StaffMember | null;
  deactivateStaff: (id: string) => boolean;
  updateStaff: (id: string, updates: Partial<StaffMember>) => void;
  setDoctorDutySchedule: (data: Omit<DoctorDutySchedule, 'id' | 'updatedAt' | 'updatedBy'>) => boolean;
  submitDoctorDutyChangeRequest: (
    doctorId: string,
    updates: { availableDays: string[]; availableHours: string; reason: string }
  ) => DoctorDutyChangeRequest | null;
  reviewDoctorDutyChangeRequest: (requestId: string, decision: 'Approved' | 'Rejected') => void;
  // Pharmacy Actions
  dispensePharmacyItem: (itemId: string, quantity: number, patientId: string) => void;
  restockPharmacyItem: (itemId: string, quantity: number) => void;
  addPharmacyItem: (item: Omit<PharmacyItem, 'id'>) => void;
  // Compliance & Audit
  logAuditEvent: (
    action: AuditLog['action'],
    resourceType: AuditLog['resourceType'],
    resourceId: string,
    details: string,
    complianceFlag?: AuditLog['complianceFlag']
  ) => void;
  updateCompliance: (updates: Partial<SystemCompliance>) => void;
  // Notifications
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (
    title: string,
    message: string,
    type?: LiveNotification['type'],
    relatedEntityId?: string,
    recipient?: { userId?: string; userName?: string }
  ) => void;
  // Database Backup Utility
  lastBackupTimestamp: number | null;
  backupReminderSnoozedUntil: number | null;
  isBackupOverdue: boolean;
  showBackupReminderModal: boolean;
  setShowBackupReminderModal: (show: boolean) => void;
  performDatabaseBackup: (format?: 'json' | 'csv') => { success: boolean; filename: string; recordCounts: Record<string, number> };
  snoozeBackupReminder: (hours?: number) => void;
  dismissBackupReminder: () => void;
  triggerTestBackupReminder: () => void;
  // Utilities
  resetHospitalData: () => void;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PATIENTS: 'medcore_patients_v3',
  DOCTORS: 'medcore_doctors_v3',
  DOCTOR_DUTY_SCHEDULES: 'medcore_doctor_duty_schedules_v1',
  DOCTOR_DUTY_CHANGE_REQUESTS: 'medcore_doctor_duty_change_requests_v1',
  APPOINTMENTS: 'medcore_appointments_v3',
  INVOICES: 'medcore_invoices_v3',
  ADVANCE_PAYMENTS: 'medcore_advance_payments_v1',
  REFUND_PAYMENTS: 'medcore_refund_payments_v1',
  INSURANCE_APPROVALS: 'medcore_insurance_approvals_v1',
  POS_TRANSACTIONS: 'medcore_pos_transactions_v1',
  RECEPTION_TOKENS: 'medcore_reception_tokens_v1',
  WARD_BEDS: 'medcore_ward_beds_v3',
  STAFF: 'medcore_staff_v3',
  PHARMACY: 'medcore_pharmacy_v3',
  AUDIT_LOGS: 'medcore_audit_logs_v3',
  COMPLIANCE: 'medcore_compliance_v3',
  NOTIFICATIONS: 'medcore_notifications_v3',
  ROLE: 'medcore_current_role_v3',
  IS_AUTHENTICATED: 'medcore_is_authenticated_v3',
  AUTH_USER_ID: 'medcore_auth_user_id_v3',
  DEPARTMENT_PORTAL: 'medcore_department_portal_v3',
  APP_THEME: 'medcore_app_theme_v3',
  LAST_BACKUP_TIMESTAMP: 'medcore_last_backup_timestamp_v3',
  BACKUP_SNOOZE_TIMESTAMP: 'medcore_backup_snooze_timestamp_v3',
};

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Patient[];
        return parsed.map((p) => ({
          ...p,
          avatar: p.avatar || getPatientPhoto(p.id, `${p.firstName} ${p.lastName}`, p.gender),
        }));
      } catch (e) {
        return initialPatients;
      }
    }
    return initialPatients;
  });

  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DOCTORS);
    return saved ? JSON.parse(saved) : initialDoctors;
  });

  const [doctorDutySchedules, setDoctorDutySchedules] = useState<DoctorDutySchedule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOCTOR_DUTY_SCHEDULES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [doctorDutyChangeRequests, setDoctorDutyChangeRequests] = useState<DoctorDutyChangeRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOCTOR_DUTY_CHANGE_REQUESTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return saved ? JSON.parse(saved) : initialAppointments;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
      const rawList = saved ? JSON.parse(saved) : initialInvoices;
      if (!Array.isArray(rawList)) return initialInvoices;
      return rawList.map((inv: any) => {
        const subtotal = Number(inv.subtotal) || 0;
        const totalAmount = Number(inv.totalAmount ?? inv.subtotal ?? 0);
        const insuranceCoveredAmount = Number(inv.insuranceCoveredAmount ?? inv.insuranceCovered ?? 0);
        const amountPaid = Number(inv.amountPaid ?? inv.paidAmount ?? 0);
        const patientPayable = Number(inv.patientPayable ?? Math.max(0, totalAmount - insuranceCoveredAmount));
        const balanceDue = Number(inv.balanceDue ?? Math.max(0, patientPayable - amountPaid));
        return {
          ...inv,
          subtotal,
          totalAmount,
          insuranceCoveredAmount,
          insuranceCovered: insuranceCoveredAmount,
          patientPayable,
          amountPaid,
          balanceDue,
          items: Array.isArray(inv.items)
            ? inv.items.map((item: any) => ({
              ...item,
              unitCost: Number(item.unitCost) || 0,
              amount: Number(item.amount ?? item.totalPrice) || 0,
              totalPrice: Number(item.totalPrice ?? item.amount) || 0,
            }))
            : [],
        };
      });
    } catch {
      return initialInvoices;
    }
  });

  const [advancePayments, setAdvancePayments] = useState<AdvancePayment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADVANCE_PAYMENTS);
      return saved ? JSON.parse(saved) : initialAdvancePayments;
    } catch {
      return initialAdvancePayments;
    }
  });

  const [refundPayments, setRefundPayments] = useState<RefundPayment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REFUND_PAYMENTS);
      return saved ? JSON.parse(saved) : initialRefundPayments;
    } catch {
      return initialRefundPayments;
    }
  });

  const [insuranceApprovals, setInsuranceApprovals] = useState<InsuranceApproval[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INSURANCE_APPROVALS);
      return saved ? JSON.parse(saved) : initialInsuranceApprovals;
    } catch {
      return initialInsuranceApprovals;
    }
  });

  const [posTransactions, setPosTransactions] = useState<PosTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POS_TRANSACTIONS);
      return saved ? JSON.parse(saved) : initialPosTransactions;
    } catch {
      return initialPosTransactions;
    }
  });

  const [receptionTokens, setReceptionTokens] = useState<ReceptionToken[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECEPTION_TOKENS);
      return saved ? JSON.parse(saved) : initialReceptionTokens;
    } catch {
      return initialReceptionTokens;
    }
  });

  const [wardBeds, setWardBeds] = useState<WardBed[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WARD_BEDS);
    return saved ? JSON.parse(saved) : initialWardBeds;
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (!saved) return initialStaff;
    const savedStaff: StaffMember[] = JSON.parse(saved);
    return savedStaff.some((member) => member.id === 'STF-08')
      ? savedStaff
      : [...savedStaff, ...initialStaff.filter((member) => member.id === 'STF-08')];
  });

  const [pharmacy, setPharmacy] = useState<PharmacyItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PHARMACY);
    return saved ? JSON.parse(saved) : initialPharmacy;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [compliance, setCompliance] = useState<SystemCompliance>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPLIANCE);
    return saved ? JSON.parse(saved) : initialCompliance;
  });

  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as UserRole) || 'admin';
  });

  const [notifications, setNotifications] = useState<LiveNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'NOTIF-1',
        title: 'Emergency Admission',
        message: 'Patient Amara Okonkwo admitted to ER Triage Bay 2 with acute RLQ abdominal pain.',
        type: 'critical',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        relatedEntityId: 'PT-10494',
      },
      {
        id: 'NOTIF-2',
        title: 'Low Pharmacy Inventory Alert',
        message: 'Metformin HCl 850mg stock (28 units) fell below minimum safe threshold (75 units).',
        type: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        relatedEntityId: 'PHARM-02',
      },
      {
        id: 'NOTIF-3',
        title: 'Live Appointment Queue',
        message: 'Dr. Sarah Jenkins has started consultation with Eleanor Pemberton.',
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        relatedEntityId: 'APT-2026-001',
      },
    ];
  });

  const [activeTab, setActiveTabState] = useState<NavigationTab>('overview');
  const [registrationMode, setRegistrationModeState] = useState<RegistrationMode>('new');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const [appTheme, setAppThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APP_THEME) as AppTheme;
    if (saved) return saved;
    return 'clinical';
  });

  const setAppTheme = (theme: AppTheme) => {
    setAppThemeState(theme);
    localStorage.setItem(STORAGE_KEYS.APP_THEME, theme);
  };

  const setActiveTab = (tab: NavigationTab) => {
    if (currentRole === 'receptionist') {
      const receptionistTabs: NavigationTab[] = [
        'overview',
        'registration',
        'appointments',
        'enquiry',
        'billing',
        'reports',
        'pricelist',
      ];
      if (!receptionistTabs.includes(tab)) {
        addNotification('Reception Portal Policy', 'Reception users only have access to Dashboard, Appointments, Patient Enquiry, Billing & Claims, Financial Reports, and Price List & Tariffs.', 'warning');
        setActiveTabState('overview');
        return;
      }
    }
    if (departmentPortal === 'outpatient' && (tab === 'inpatient' || tab === 'wards')) {
      addNotification('Access Locked', 'Inpatient wards and bed telemetry are restricted in Outpatient Clinic mode.', 'warning');
      setActiveTabState('outpatient');
      return;
    }
    setActiveTabState(tab);
  };

  const setRegistrationMode = (mode: RegistrationMode) => {
    setRegistrationModeState(mode);
    setActiveTab('registration');
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  }, [patients]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
  }, [doctors]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCTOR_DUTY_SCHEDULES, JSON.stringify(doctorDutySchedules));
  }, [doctorDutySchedules]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCTOR_DUTY_CHANGE_REQUESTS, JSON.stringify(doctorDutyChangeRequests));
  }, [doctorDutyChangeRequests]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }, [appointments]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADVANCE_PAYMENTS, JSON.stringify(advancePayments));
  }, [advancePayments]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REFUND_PAYMENTS, JSON.stringify(refundPayments));
  }, [refundPayments]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INSURANCE_APPROVALS, JSON.stringify(insuranceApprovals));
  }, [insuranceApprovals]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POS_TRANSACTIONS, JSON.stringify(posTransactions));
  }, [posTransactions]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECEPTION_TOKENS, JSON.stringify(receptionTokens));
  }, [receptionTokens]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WARD_BEDS, JSON.stringify(wardBeds));
  }, [wardBeds]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
  }, [staff]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PHARMACY, JSON.stringify(pharmacy));
  }, [pharmacy]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPLIANCE, JSON.stringify(compliance));
  }, [compliance]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
  }, [currentRole]);

  // Auth & Session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
    const savedUserId = localStorage.getItem(STORAGE_KEYS.AUTH_USER_ID);
    return saved === 'true' && staff.some((member) => member.id === savedUserId && member.isActive !== false);
  });
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string | null>(() => {
    const savedUserId = localStorage.getItem(STORAGE_KEYS.AUTH_USER_ID);
    return staff.some((member) => member.id === savedUserId && member.isActive !== false) ? savedUserId : null;
  });
  const [departmentPortal, setDepartmentPortalState] = useState<DepartmentPortal | null>(() => {
    return (localStorage.getItem(STORAGE_KEYS.DEPARTMENT_PORTAL) as DepartmentPortal) || null;
  });
  const [showPortalSelect, setShowPortalSelect] = useState<boolean>(false);

  const currentUser: StaffMember =
    (authenticatedUserId ? staff.find((s) => s.id === authenticatedUserId && s.isActive !== false) : null) ||
    staff.find((s) => s.role === currentRole && s.isActive !== false) ||
    staff[0] || {
      id: 'STF-ADMIN',
      name: 'System Administrator',
      role: 'admin',
      department: 'Clinical Governance',
      shift: 'Morning (07:00 - 15:00)',
      phone: '+1 (555) 912-1001',
      email: 'admin@apexhealth.org',
      roomOrStation: 'Control Center',
      licenseNumber: 'FACHE-9921',
      status: 'On Duty',
    };

  const currentRoleDefinition: RoleDefinition = ROLE_DEFINITIONS[currentRole] || ROLE_DEFINITIONS.admin;
  const authenticatedUser = isAuthenticated ? currentUser : null;

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    logAuditEvent('AUTHENTICATE', 'Security Settings', role, `Switched active session view to role: ${role.toUpperCase()}`, 'HIPAA Access Log');
    addNotification('Role Switched', `Active session switched to ${role.toUpperCase()} profile permissions.`, 'info');
  };

  const setCurrentUserId = (id: string) => {
    const matched = staff.find((s) => s.id === id && s.isActive !== false);
    if (matched) {
      setAuthenticatedUserId(matched.id);
      setCurrentRoleState(matched.role);
      localStorage.setItem(STORAGE_KEYS.AUTH_USER_ID, matched.id);
      localStorage.setItem(STORAGE_KEYS.ROLE, matched.role);
      addNotification('User Profile Switched', `Active session profile set to ${matched.name}.`, 'info');
    }
  };

  const login = (userId: string, _password?: string): { success: boolean; message?: string } => {
    const trimmed = userId.trim().toLowerCase();
    if (!trimmed) {
      return { success: false, message: 'Please select or enter your Staff ID' };
    }
    const matchedStaff = staff.find(
      (s) => s.isActive !== false && (
        s.id.toLowerCase() === trimmed ||
        s.email.toLowerCase() === trimmed ||
        s.name.toLowerCase().includes(trimmed)
      )
    );
    if (!matchedStaff) {
      return { success: false, message: 'Staff ID not found in hospital directory' };
    }
    setIsAuthenticated(true);
    setAuthenticatedUserId(matchedStaff.id);
    setCurrentRoleState(matchedStaff.role);
    setShowPortalSelect(true);
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
    localStorage.setItem(STORAGE_KEYS.AUTH_USER_ID, matchedStaff.id);
    localStorage.setItem(STORAGE_KEYS.ROLE, matchedStaff.role);
    logAuditEvent(
      'AUTHENTICATE',
      'Security Settings',
      matchedStaff.id,
      `Staff ${matchedStaff.name} (${matchedStaff.role.toUpperCase()}) authenticated via clinical portal.`,
      'HIPAA Access Log'
    );
    addNotification('Portal Login', `Welcome back, ${matchedStaff.name}.`, 'success');
    return { success: true };
  };

  const logout = () => {
    const prevUser = currentUser;
    setIsAuthenticated(false);
    setAuthenticatedUserId(null);
    setDepartmentPortalState(null);
    setShowPortalSelect(false);
    localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.DEPARTMENT_PORTAL);
    if (prevUser) {
      logAuditEvent(
        'AUTHENTICATE',
        'Security Settings',
        prevUser.id,
        `Staff ${prevUser.name} logged out from session.`,
        'HIPAA Access Log'
      );
    }
  };

  const selectDepartmentPortal = (portal: DepartmentPortal) => {
    setDepartmentPortalState(portal);
    setShowPortalSelect(false);
    localStorage.setItem(STORAGE_KEYS.DEPARTMENT_PORTAL, portal);
    if (portal === 'outpatient') {
      setActiveTabState('outpatient');
      setAppTheme('emerald');
      addNotification('Outpatient Clinic (OPD)', 'Switched to OPD Clinic Queue & Consultations division. Inpatient IPD access locked.', 'info');
    } else if (portal === 'inpatient') {
      setActiveTabState('inpatient');
      setAppTheme('indigo');
      addNotification('Inpatient Hospital (IPD)', 'Switched to IPD Ward Beds & Admissions division.', 'info');
    } else {
      setActiveTabState('overview');
    }
    logAuditEvent(
      'READ',
      'Security Settings',
      portal,
      `Navigated to hospital division portal: ${portal.toUpperCase()}`,
      'HIPAA Access Log'
    );
  };

  const logAuditEvent = (
    action: AuditLog['action'],
    resourceType: AuditLog['resourceType'],
    resourceId: string,
    details: string,
    complianceFlag: AuditLog['complianceFlag'] = 'HIPAA Access Log'
  ) => {
    if (!compliance.hipaaAuditLogEnabled) return;
    const newLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      userName: currentUser.name,
      userRole: currentRole,
      action,
      resourceType,
      resourceId,
      details,
      complianceFlag,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  const updateCompliance = (updates: Partial<SystemCompliance>) => {
    setCompliance((prev) => ({ ...prev, ...updates }));
    logAuditEvent('UPDATE', 'Security Settings', 'SYS-CONF', `Compliance governance parameters updated`, 'HIPAA Access Log');
    addNotification('Security Settings Updated', 'System compliance settings synchronized successfully.', 'info');
  };

  const addNotification = (
    title: string,
    message: string,
    type: LiveNotification['type'] = 'info',
    relatedEntityId?: string,
    recipient?: { userId?: string; userName?: string }
  ) => {
    const newNotif: LiveNotification = {
      id: `NOTIF-${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      relatedEntityId,
      recipientUserId: recipient?.userId,
      recipientUserName: recipient?.userName,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 24)]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const appendPatientVisit = (patientId: string, visitDetails: Partial<FacilityVisit>) => {
    setPatients((prev) =>
      prev.map((patient) => {
        if (patient.id !== patientId) return patient;

        const latestVitals = Array.isArray(patient.vitals) ? patient.vitals[0] : undefined;
        const visitTimestamp = new Date().toISOString();
        const visit: FacilityVisit = {
          id: `VIS-${Date.now().toString().slice(-5)}`,
          visitDate: visitDetails.visitDate || visitTimestamp.split('T')[0],
          doctorName: visitDetails.doctorName || patient.primaryPhysicianName || 'Attending Physician',
          doctorSpecialty: visitDetails.doctorSpecialty || patient.department || 'General Medicine',
          department: visitDetails.department || patient.department || 'General Medicine',
          clinicRoom: visitDetails.clinicRoom || patient.wardOrRoom || 'OPD / Consultation',
          visitType: visitDetails.visitType || 'Outpatient Follow-up',
          chiefComplaint: visitDetails.chiefComplaint || patient.purposeOfVisit || 'Clinical review',
          clinicalAssessment: visitDetails.clinicalAssessment || 'Clinical review completed.',
          primaryDiagnosis: visitDetails.primaryDiagnosis || { code: 'Z00.00', description: 'General medical examination' },
          vitalsSnapshot: visitDetails.vitalsSnapshot || {
            bloodPressure: latestVitals ? `${latestVitals.bloodPressureSys}/${latestVitals.bloodPressureDia}` : 'N/A',
            heartRate: latestVitals?.heartRate ?? 0,
            spO2: latestVitals?.spO2 ?? 0,
            temperature: latestVitals?.temperature ?? 0,
            respiratoryRate: latestVitals?.respiratoryRate ?? 0,
          },
          medicationsPrescribed: visitDetails.medicationsPrescribed || [],
          diagnosticOrders: visitDetails.diagnosticOrders || [],
          disposition: visitDetails.disposition || 'Follow-up Scheduled',
          signedAt: visitDetails.signedAt || visitTimestamp,
        };

        return {
          ...patient,
          facilityVisits: [visit, ...(patient.facilityVisits || [])],
          updatedAt: visitTimestamp,
        };
      })
    );
  };

  const addPatient = (
    patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'vitals' | 'medications' | 'labResults' | 'clinicalNotes'>,
    registrationType: 'Consultation' | 'Non-Consultation' = 'Consultation'
  ): Patient => {
    const nextNum = 10492 + patients.length + 1;
    const newId = `PT-${nextNum}`;
    const nowIso = new Date().toISOString();
    const newPatient: Patient = {
      ...patientData,
      id: newId,
      vitals: [],
      medications: [],
      labResults: [],
      clinicalNotes: [],
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setPatients((prev) => [newPatient, ...prev]);

    const registrationToken = createReceptionToken({
      patientId: newPatient.id,
      patientName: `${newPatient.firstName} ${newPatient.lastName}`,
      patientPhone: newPatient.phone,
      doctorId: registrationType === 'Consultation' ? newPatient.primaryPhysicianId : undefined,
      doctorName: registrationType === 'Consultation' ? newPatient.primaryPhysicianName : 'Registration Desk',
      department: registrationType === 'Consultation' ? (newPatient.department || 'General Medicine') : 'Registration & Cashier',
      serviceType: registrationType === 'Consultation' ? 'Consultation' : 'Billing & Cashier',
      priority: newPatient.status === 'Emergency' ? 'Urgent' : 'Normal',
      status: 'Waiting',
      estimatedWaitMins: newPatient.status === 'Emergency' ? 10 : 20,
      counterOrRoom: registrationType === 'Consultation' ? (newPatient.status === 'Emergency' ? 'ER Triage Desk' : 'Registration Counter 1') : 'Cashier Desk',
      currentStage: '1_REGISTRATION',
      visitType: registrationType === 'Consultation' ? (newPatient.purposeOfVisit ? 'Consultation' : 'Walk-in') : 'Billing',
      visitPurpose: registrationType === 'Consultation' ? (newPatient.purposeOfVisit || 'New patient assessment') : 'Administrative registration & billing',
      visitComplaint: registrationType === 'Consultation' ? (newPatient.purposeOfVisit || 'Initial clinical assessment') : 'Registration and billing review',
      registrationSource: 'New Registration',
      patientAge: newPatient.age,
      patientGender: newPatient.gender,
      insuranceProvider: newPatient.insurance?.provider || 'Self-Pay',
      payMode: newPatient.payMode || 'Self',
      visitDate: nowIso.split('T')[0],
      patientVisitSummary: registrationType === 'Consultation'
        ? `${newPatient.department || 'General Medicine'} • ${newPatient.primaryPhysicianName || 'Attending Physician'} • ${newPatient.purposeOfVisit || 'Initial consultation'}`
        : `${newPatient.department || 'General Medicine'} • Registration & billing • ${newPatient.purposeOfVisit || 'Administrative review'}`,
      historyLogs: [
        {
          stage: '1_REGISTRATION',
          timestamp: nowIso,
          action: registrationType === 'Consultation'
            ? `New registration token created for ${newPatient.firstName} ${newPatient.lastName}. Visit: ${newPatient.purposeOfVisit || 'Initial consultation'} • Department: ${newPatient.department || 'General Medicine'} • Doctor: ${newPatient.primaryPhysicianName || 'To be assigned'}`
            : `New non-consultation registration created for ${newPatient.firstName} ${newPatient.lastName}. Route: Registration & Cashier • Department: ${newPatient.department || 'General Medicine'}`,
          actor: 'Patient Registrar',
        },
      ],
    });

    if (newPatient.wardOrRoom) {
      setWardBeds((prev) =>
        prev.map((bed) =>
          bed.bedNumber.toLowerCase() === newPatient.wardOrRoom?.toLowerCase() ||
            bed.wardName.toLowerCase().includes(newPatient.wardOrRoom?.toLowerCase() || '___')
            ? {
              ...bed,
              status: 'Occupied',
              patientId: newId,
              patientName: `${newPatient.firstName} ${newPatient.lastName}`,
              assignedDoctor: newPatient.primaryPhysicianName,
              admissionDate: nowIso.split('T')[0],
            }
            : bed
        )
      );
    }
    logAuditEvent(
      'CREATE',
      'Patient Record',
      newId,
      `Registered ${newPatient.firstName} ${newPatient.lastName} (${newPatient.status}) and issued token ${registrationToken.tokenNumber}.`,
      'HIPAA Access Log'
    );
    addNotification(
      'New Patient Admitted',
      `${newPatient.firstName} ${newPatient.lastName} (${newId}) admitted to ${newPatient.status} with token ${registrationToken.tokenNumber}.`,
      newPatient.status === 'Emergency' ? 'critical' : 'success',
      newId
    );
    addNotification(
      'SMS Notification Sent',
      `Registration SMS sent to ${newPatient.phone || 'patient mobile'} for ${newPatient.firstName} ${newPatient.lastName}.`,
      'info',
      newId
    );
    return newPatient;
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
    setReceptionTokens((prev) =>
      prev.map((token) => {
        if (token.patientId !== id) return token;
        const existing = patients.find((patient) => patient.id === id);
        return {
          ...token,
          patientName:
            updates.firstName || updates.lastName
              ? `${updates.firstName || existing?.firstName || ''} ${updates.lastName || existing?.lastName || ''}`.trim()
              : token.patientName,
          patientPhone: updates.phone || token.patientPhone,
          doctorId: updates.primaryPhysicianId || token.doctorId,
          doctorName: updates.primaryPhysicianName || token.doctorName,
          department: updates.department || token.department,
        };
      })
    );
    logAuditEvent('UPDATE', 'Patient Record', id, `Updated patient clinical and demographic info`, 'HIPAA Access Log');
  };

  const addVitals = (patientId: string, vitalsData: Omit<Vitals, 'recordedAt'>) => {
    const recordedAt = new Date().toISOString();
    const newVitals: Vitals = { ...vitalsData, recordedAt };
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            vitals: [newVitals, ...p.vitals],
            updatedAt: recordedAt,
          };
        }
        return p;
      })
    );
    const patient = patients.find((p) => p.id === patientId);
    const pName = patient ? `${patient.firstName} ${patient.lastName}` : patientId;
    logAuditEvent('UPDATE', 'Patient Record', patientId, `Recorded vitals: HR ${vitalsData.heartRate}, BP ${vitalsData.bloodPressureSys}/${vitalsData.bloodPressureDia}, SpO2 ${vitalsData.spO2}%`);
    if (vitalsData.spO2 < 92 || vitalsData.bloodPressureSys > 160 || vitalsData.heartRate > 120) {
      addNotification(
        'Critical Vitals Alert',
        `Telemetry alert for ${pName}: HR ${vitalsData.heartRate} bpm, BP ${vitalsData.bloodPressureSys}/${vitalsData.bloodPressureDia}, SpO2 ${vitalsData.spO2}%.`,
        'critical',
        patientId
      );
    } else {
      addNotification(
        'Vitals Synchronized',
        `Logged vitals for ${pName}: SpO2 ${vitalsData.spO2}%, Pulse ${vitalsData.heartRate} bpm.`,
        'info',
        patientId
      );
    }
  };

  const addTriageAssessment = (
    patientId: string,
    assessmentData: Omit<TriageAssessment, 'id' | 'assessedAt'>
  ): TriageAssessment => {
    const assessedAt = new Date().toISOString();
    const newAssessment: TriageAssessment = {
      ...assessmentData,
      id: `TRG-${Date.now().toString().slice(-4)}`,
      assessedAt,
    };
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          const updatedVitals = [newAssessment.vitals, ...p.vitals];
          const isCritical =
            newAssessment.urgencyLevel.includes('Level 1') ||
            newAssessment.urgencyLevel.includes('Level 2') ||
            newAssessment.acuityColor === 'red' ||
            newAssessment.acuityColor === 'orange';
          return {
            ...p,
            status: isCritical ? 'Emergency' : p.status === 'Inpatient' ? 'Inpatient' : 'Outpatient',
            vitals: updatedVitals,
            latestTriage: newAssessment,
            triageAssessments: [newAssessment, ...(p.triageAssessments || [])],
            updatedAt: assessedAt,
          };
        }
        return p;
      })
    );
    const targetPatient = patients.find((p) => p.id === patientId);
    const pName = targetPatient ? `${targetPatient.firstName} ${targetPatient.lastName}` : patientId;
    logAuditEvent(
      'CREATE',
      'Patient Record',
      patientId,
      `Triage assessment completed by ${newAssessment.assessedBy}: ${newAssessment.urgencyLevel} [${newAssessment.disposition}]`,
      'HIPAA Access Log'
    );
    const isStatAlert =
      newAssessment.urgencyLevel.includes('Level 1') ||
      newAssessment.urgencyLevel.includes('Level 2') ||
      newAssessment.vitals.spO2 < 90 ||
      newAssessment.vitals.bloodPressureSys > 180;
    if (isStatAlert) {
      addNotification(
        'CRITICAL TRIAGE STAT',
        `STAT: ${pName} assessed at ${newAssessment.urgencyLevel}. Routed to ${newAssessment.disposition}. SpO2 ${newAssessment.vitals.spO2}%, BP ${newAssessment.vitals.bloodPressureSys}/${newAssessment.vitals.bloodPressureDia}, HR ${newAssessment.vitals.heartRate}.`,
        'critical',
        patientId
      );
    } else {
      addNotification(
        'Triage Assessment Logged',
        `Triage logged for ${pName}: ${newAssessment.urgencyLevel}. Acuity: ${newAssessment.acuityColor.toUpperCase()}.`,
        'success',
        patientId
      );
    }
    return newAssessment;
  };

  const addMedication = (patientId: string, medData: Omit<Medication, 'id'>) => {
    const newMed: Medication = {
      ...medData,
      id: `MED-${Date.now().toString().slice(-4)}`,
    };
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          const updatedMeds = [newMed, ...(p.medications || [])];
          return {
            ...p,
            medications: updatedMeds,
            prescriptions: updatedMeds,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
    logAuditEvent('CREATE', 'Prescription', newMed.id, `Prescribed ${newMed.name} (${newMed.dosage}) by ${newMed.prescribedBy}`);
    addNotification('Prescription Added', `${newMed.name} added to medication chart by ${newMed.prescribedBy}.`, 'info', patientId);
  };

  const addClinicalNote = (patientId: string, noteData: Omit<ClinicalNote, 'id' | 'date'>) => {
    const author = noteData.authorName || noteData.doctorName || currentUser.name || 'Attending Physician';
    const role = noteData.authorRole || noteData.doctorSpecialty || currentUser.role || 'Clinical Staff';
    const newNote: ClinicalNote = {
      ...noteData,
      id: `NOTE-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      authorName: author,
      doctorName: author,
      authorRole: role,
      doctorSpecialty: role,
      content: noteData.content || noteData.assessment || noteData.chiefComplaint || 'Clinical encounter recorded.',
      assessment: noteData.assessment || noteData.content || 'Assessment completed.',
      treatmentPlan: noteData.treatmentPlan || 'Continue management.',
      diagnosisCode: noteData.diagnosisCode || (noteData.diagnoses && noteData.diagnoses[0]) || 'Z00.00',
    };
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            clinicalNotes: [newNote, ...(p.clinicalNotes || [])],
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
    appendPatientVisit(patientId, {
      visitDate: newNote.date,
      doctorName: author,
      doctorSpecialty: role,
      department: newNote.category || 'General Medicine',
      clinicRoom: 'OPD / Consultation',
      visitType: 'Outpatient Follow-up',
      chiefComplaint: newNote.chiefComplaint || 'Clinical review',
      clinicalAssessment: newNote.assessment || newNote.content || 'Assessment completed.',
      primaryDiagnosis: {
        code: newNote.diagnosisCode || 'Z00.00',
        description: newNote.assessment || 'Clinical review',
      },
      medicationsPrescribed: [],
      diagnosticOrders: [],
      disposition: 'Follow-up Scheduled',
      signedAt: new Date().toISOString(),
    });
    logAuditEvent('CREATE', 'Patient Record', patientId, `Encounter clinical note recorded by ${author}`);
    addNotification('Clinical Note Logged', `Note by ${author} (${newNote.diagnosisCode}).`, 'info', patientId);
  };

  const normalizeClinicianName = (name: string) =>
    name
      .toLowerCase()
      .replace(/^dr\.?\s*/, '')
      .replace(/,?\s*(md|facs|do|phd)\b/g, '')
      .replace(/[.,]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const notifyOrderingDoctor = (patientId: string, lab: LabResult) => {
    const patient = patients.find((item) => item.id === patientId);
    const orderingDoctor =
      lab.orderedBy && lab.orderedBy !== 'Attending Physician'
        ? lab.orderedBy
        : patient?.primaryPhysicianName;
    if (!orderingDoctor) return;

    const recipient = staff.find(
      (member) =>
        member.role === 'doctor' && normalizeClinicianName(member.name) === normalizeClinicianName(orderingDoctor)
    );
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Patient';
    const alertType: LiveNotification['type'] =
      lab.status === 'Critical' ? 'critical' : lab.status === 'Elevated' ? 'warning' : 'info';

    addNotification(
      'Diagnostic Report Ready',
      `${lab.testName} for ${patientName} is ready to review. Result: ${lab.value} (${lab.status}).`,
      alertType,
      patientId,
      { userId: recipient?.id, userName: orderingDoctor }
    );
  };

  const addLabResult = (patientId: string, labData: Omit<LabResult, 'id'>) => {
    const newLab: LabResult = {
      ...labData,
      id: `LAB-${Date.now().toString().slice(-4)}`,
    };
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            labResults: [newLab, ...(p.labResults || [])],
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
    appendPatientVisit(patientId, {
      visitDate: newLab.resultDate || newLab.orderedDate,
      doctorName: newLab.orderedBy,
      doctorSpecialty: newLab.department || 'Laboratory',
      department: newLab.department || 'Laboratory',
      clinicRoom: 'Diagnostics Lab',
      visitType: 'Lab & Imaging Review',
      chiefComplaint: `Diagnostic review: ${newLab.testName}`,
      clinicalAssessment: newLab.impression || newLab.notes || `${newLab.testName} result recorded.`,
      primaryDiagnosis: {
        code: 'LAB-RESULT',
        description: newLab.testName,
      },
      diagnosticOrders: [newLab.testName],
      medicationsPrescribed: [],
      disposition: 'Follow-up Scheduled',
      signedAt: new Date().toISOString(),
    });
    logAuditEvent('CREATE', 'Lab Result', newLab.id, `Diagnostics verified: ${newLab.testName} (${newLab.value})`);
    if (newLab.status !== 'Pending') {
      notifyOrderingDoctor(patientId, newLab);
    }
  };

  const updateLabResult = (patientId: string, labId: string, updates: Partial<LabResult>) => {
    const patient = patients.find((item) => item.id === patientId);
    const existingLab = patient?.labResults.find((item) => item.id === labId);
    const updatedLab = existingLab ? { ...existingLab, ...updates } : null;
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            labResults: p.labResults.map((l) => (l.id === labId ? { ...l, ...updates } : l)),
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
    logAuditEvent('UPDATE', 'Lab Result', labId, `Diagnostic assay updated: ${JSON.stringify(updates)}`);
    const reportFinalized = existingLab?.status === 'Pending' && updatedLab?.status !== 'Pending';
    const reportDispatched =
      updates.sentToDoctor === true && existingLab?.sentToDoctor !== true && updatedLab?.status !== 'Pending';
    if (updatedLab && (reportFinalized || reportDispatched)) {
      notifyOrderingDoctor(patientId, updatedLab);
    }
  };

  const dischargePatient = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
            ...p,
            status: 'Discharged',
            wardOrRoom: undefined,
            updatedAt: new Date().toISOString(),
          }
          : p
      )
    );
    setWardBeds((prev) =>
      prev.map((bed) =>
        bed.patientId === patientId
          ? {
            ...bed,
            status: 'Available',
            patientId: undefined,
            patientName: undefined,
            assignedDoctor: undefined,
            admissionDate: undefined,
          }
          : bed
      )
    );
    logAuditEvent('UPDATE', 'Patient Record', patientId, `Discharged patient ${patient.firstName} ${patient.lastName}`);
    addNotification(
      'Patient Discharged',
      `${patient.firstName} ${patient.lastName} discharged. Bed sanitization protocol initialized.`,
      'success',
      patientId
    );
  };

  const updatePatientStatus = (id: string, status: Patient['status']) => {
    updatePatient(id, { status });
  };

  const addPrescription = (patientId: string, rx: any) => {
    addMedication(patientId, {
      name: rx.medicationName || rx.name,
      dosage: rx.dosage || 'Standard',
      frequency: rx.frequency || 'Daily',
      route: rx.route || 'Oral',
      duration: rx.duration,
      instructions: rx.instructions,
      prescribedBy: rx.prescribedBy || currentUser.name,
      startDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    });
    appendPatientVisit(patientId, {
      visitDate: new Date().toISOString().split('T')[0],
      doctorName: rx.prescribedBy || currentUser.name,
      doctorSpecialty: 'Pharmacy / Prescribing',
      department: 'Pharmacy',
      clinicRoom: 'eRx / Pharmacy',
      visitType: 'Prescription / eRx',
      chiefComplaint: rx.reason || 'Medication refill',
      clinicalAssessment: `Prescription issued for ${rx.medicationName || rx.name}.`,
      primaryDiagnosis: { code: 'PRESC-RX', description: 'Medication prescribed' },
      medicationsPrescribed: [rx.medicationName || rx.name],
      diagnosticOrders: [],
      disposition: 'Follow-up Scheduled',
      signedAt: new Date().toISOString(),
    });
  };

  const bookAppointment = (
    aptData: Omit<Appointment, 'id' | 'queueNumber' | 'createdAt'>
  ): Appointment => {
    const queueNum = appointments.filter((a) => a.date === aptData.date).length + 1;
    const newApt: Appointment = {
      ...aptData,
      id: `APT-2026-${String(appointments.length + 1).padStart(3, '0')}`,
      queueNumber: queueNum,
      estimatedWaitMinutes: queueNum * 15,
      createdAt: new Date().toISOString(),
    };
    setAppointments((prev) => [...prev, newApt]);
    logAuditEvent('CREATE', 'Appointment', newApt.id, `Booked slot for ${newApt.patientName} with ${newApt.doctorName}`);
    addNotification(
      'Appointment Confirmed',
      `Live slot confirmed for ${newApt.patientName} with ${newApt.doctorName} on ${newApt.date} at ${newApt.timeSlot}.`,
      'info',
      newApt.id
    );
    return newApt;
  };

  const addAppointment = (aptData: any): Appointment => {
    const patient = patients.find((p) => p.id === aptData.patientId);
    const doctor = doctors.find((d) => d.id === aptData.doctorId);

    const fullData: Omit<Appointment, 'id' | 'queueNumber' | 'createdAt'> = {
      patientId: aptData.patientId,
      patientName:
        aptData.patientName ||
        (patient ? `${patient.firstName} ${patient.lastName}` : 'Patient'),
      patientAge: aptData.patientAge ?? (patient ? patient.age : 35),
      patientGender: aptData.patientGender || (patient ? patient.gender : 'Unknown'),
      doctorId: aptData.doctorId,
      doctorName: aptData.doctorName || (doctor ? doctor.name : 'Attending Physician'),
      department: aptData.department || (doctor ? doctor.department : 'General OPD'),
      roomNumber: aptData.roomNumber || (doctor ? doctor.roomNumber : 'Room 101'),
      date: aptData.date || new Date().toISOString().split('T')[0],
      timeSlot: aptData.timeSlot || '10:00 AM',
      type: aptData.type || 'General Consultation',
      status: aptData.status || 'Scheduled',
      priority: aptData.priority || 'Normal',
      reason:
        aptData.reason ||
        aptData.reasonForVisit ||
        aptData.chiefComplaint ||
        'Clinical Review',
      notes: aptData.notes || '',
      estimatedWaitMinutes:
        aptData.estimatedWaitMinutes ??
        (aptData.priority === 'Emergency' ? 0 : aptData.priority === 'Urgent' ? 5 : 15),
      isTelehealth: aptData.isTelehealth ?? false,
      telehealthDetails: aptData.telehealthDetails,
    };

    return bookAppointment(fullData);
  };

  const updateAppointmentStatus = (
    aptId: string,
    status: AppointmentStatus,
    cancellation?: { reason: string; details?: string }
  ) => {
    if (status === 'Cancelled' && !cancellation?.reason.trim()) return;
    let affectedApt: Appointment | undefined;
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === aptId) {
          affectedApt = {
            ...apt,
            status,
            cancellationReason: status === 'Cancelled' ? cancellation?.reason.trim() : apt.cancellationReason,
            cancellationNotes: status === 'Cancelled' ? cancellation?.details?.trim() : apt.cancellationNotes,
          };
          return affectedApt;
        }
        return apt;
      })
    );
    if (affectedApt) {
      logAuditEvent(
        'UPDATE',
        'Appointment',
        aptId,
        status === 'Cancelled'
          ? `Status updated to Cancelled. Reason: ${affectedApt.cancellationReason}${affectedApt.cancellationNotes ? ` · ${affectedApt.cancellationNotes}` : ''}`
          : `Status updated to ${status}`
      );
      if (status === 'In Consultation') {
        setDoctors((prev) =>
          prev.map((d) => (d.id === affectedApt?.doctorId ? { ...d, status: 'In Consultation' } : d))
        );
        addNotification(
          'Consultation Started',
          `${affectedApt.doctorName} started session with ${affectedApt.patientName}.`,
          'info',
          affectedApt.id
        );
      } else if (status === 'Completed') {
        setDoctors((prev) =>
          prev.map((d) => (d.id === affectedApt?.doctorId ? { ...d, status: 'Available' } : d))
        );
        addNotification(
          'Consultation Finished',
          `Session complete for ${affectedApt.patientName}.`,
          'success',
          affectedApt.id
        );
      }
    }
  };

  const callNextAppointment = (doctorId?: string) => {
    const queue = appointments.filter(
      (a) =>
        (doctorId ? a.doctorId === doctorId : true) &&
        (a.status === 'Checked-In' || a.status === 'Scheduled')
    );
    if (queue.length === 0) {
      addNotification('Queue Empty', 'No waiting patients in queue for this physician.', 'info');
      return;
    }
    const nextPatient = queue[0];
    updateAppointmentStatus(nextPatient.id, 'In Consultation');
  };

  const createInvoice = (
    invData: Omit<Invoice, 'id' | 'subtotal' | 'patientPayable' | 'amountPaid' | 'balanceDue' | 'transactions'>
  ): Invoice => {
    const subtotal = invData.items.reduce(
      (sum, item) => sum + (Number(item.amount ?? item.totalPrice) || 0),
      0
    );
    const insuranceCovered = Number(invData.insuranceCoveredAmount ?? invData.insuranceCovered) || 0;
    const copay = Number(invData.copayAmount) || 0;
    const patientPayable = Math.max(0, subtotal - insuranceCovered + copay);
    const sanitizedItems: BillItem[] = invData.items.map((it) => {
      const amt = Number(it.amount ?? it.totalPrice) || 0;
      return {
        ...it,
        unitCost: Number(it.unitCost) || amt,
        amount: amt,
        totalPrice: Number(it.totalPrice) || amt,
      };
    });

    const newInvoice: Invoice = {
      ...invData,
      id: `INV-2026-${String(invoices.length + 82).padStart(4, '0')}`,
      invoiceTime:
        invData.invoiceTime ||
        new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      createdAt: invData.createdAt || new Date().toISOString(),
      items: sanitizedItems,
      subtotal,
      tax: 0,
      totalAmount: subtotal,
      paidAmount: 0,
      insuranceCoveredAmount: insuranceCovered,
      insuranceCovered,
      copayAmount: copay,
      patientPayable,
      amountPaid: 0,
      balanceDue: patientPayable,
      transactions: [],
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    appendPatientVisit(newInvoice.patientId, {
      visitDate: newInvoice.issueDate,
      doctorName: newInvoice.patientName,
      doctorSpecialty: 'Billing & Finance',
      department: 'Billing & Claims',
      clinicRoom: 'Cashier / Billing Desk',
      visitType: 'Billing & Claims',
      chiefComplaint: 'Invoice generated',
      clinicalAssessment: `Billing record created for ${newInvoice.items.length} service entries.`,
      primaryDiagnosis: { code: 'BILL-ISSUED', description: 'Invoice generated' },
      diagnosticOrders: newInvoice.items.map((item) => item.description),
      medicationsPrescribed: [],
      disposition: 'Follow-up Scheduled',
      signedAt: new Date().toISOString(),
    });
    logAuditEvent(
      'CREATE',
      'Billing Invoice',
      newInvoice.id,
      `Created invoice for ${newInvoice.patientName} total $${subtotal}`,
      'PCI-DSS Payment Log'
    );
    addNotification(
      'Medical Invoice Created',
      `Invoice ${newInvoice.id} generated for ${newInvoice.patientName} ($${(patientPayable || 0).toFixed(2)} due).`,
      'info',
      newInvoice.id
    );
    return newInvoice;
  };

  const processPayment = async (
    invoiceId: string,
    paymentData: { amount: number; method: PaymentMethod; cardLast4?: string }
  ): Promise<{ success: boolean; transaction: PaymentTransaction }> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const payAmt = Number(paymentData.amount) || 0;
    const authCode = `AUTH-${Math.floor(100000 + Math.random() * 900000)}-SEC`;
    const newTxn: PaymentTransaction = {
      transactionId: `TXN-SEC-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      amountPaid: payAmt,
      method: paymentData.method,
      cardLast4: paymentData.cardLast4 || (paymentData.method === 'Credit/Debit Card' ? '4242' : undefined),
      authCode,
      gatewayStatus: 'Success',
    };
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const prevPaid = Number(inv.amountPaid) || 0;
          const payable = Number(inv.patientPayable ?? inv.totalAmount ?? inv.subtotal) || 0;
          const totalPaid = prevPaid + payAmt;
          const newBalance = Math.max(0, payable - totalPaid);
          const newStatus = newBalance <= 0 ? 'Paid' : 'Partially Paid';
          return {
            ...inv,
            amountPaid: totalPaid,
            paidAmount: totalPaid,
            balanceDue: newBalance,
            status: newStatus,
            paymentMethod: paymentData.method,
            transactions: [...(inv.transactions || []), newTxn],
          };
        }
        return inv;
      })
    );
    logAuditEvent(
      'UPDATE',
      'Billing Invoice',
      invoiceId,
      `Payment of $${payAmt.toFixed(2)} settled via ${paymentData.method} (${authCode})`,
      'PCI-DSS Payment Log'
    );
    addNotification(
      'Payment Processed Successfully',
      `Secure payment of $${payAmt.toFixed(2)} approved via ${paymentData.method}.`,
      'success',
      invoiceId
    );
    return { success: true, transaction: newTxn };
  };

  const addAdvancePayment = (data: Omit<AdvancePayment, 'id' | 'receiptNumber'>): AdvancePayment => {
    const seq = advancePayments.length + 1;
    const newId = `ADV-${new Date().getFullYear()}-${String(seq).padStart(3, '0')}`;
    const receiptNumber = `RCP-ADV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: AdvancePayment = {
      ...data,
      id: newId,
      receiptNumber,
    };
    setAdvancePayments((prev) => [newRecord, ...prev]);

    // Auto-record POS transaction for card or cash
    const isCard = data.paymentMethod === 'Credit/Debit Card';
    const isCash = data.paymentMethod === 'Cash';
    if (isCard || isCash) {
      const posTx: PosTransaction = {
        id: `POS-TX-${Date.now().toString().slice(-6)}`,
        terminalId: data.terminalId || (isCard ? 'POS-TERM-01' : 'CASH-DRAWER-01'),
        terminalName: isCard ? 'Desk A - Verifone V200c' : 'Front Desk Cash POS',
        batchNumber: 'BATCH-4092',
        advanceId: newId,
        patientId: data.patientId,
        patientName: data.patientName,
        cardType: isCard ? 'Visa' : 'Cash / POS Drawer',
        cardLast4: isCard ? '8841' : undefined,
        authCode: `APPR-${Math.floor(10000 + Math.random() * 90000)}`,
        rrnNumber: `RRN-${Date.now()}`,
        amount: data.amount,
        status: 'Approved & Settled',
        transactionDate: data.date,
        transactionTime: data.time,
        cashierName: data.cashierName,
      };
      setPosTransactions((prev) => [posTx, ...prev]);
    }

    addNotification(
      'Advance Payment Recorded',
      `Advance receipt ${receiptNumber} generated for ${data.patientName}: $${data.amount.toFixed(2)} (${data.purpose}).`,
      'success'
    );
    logAuditEvent(
      'CREATE',
      'Billing Invoice',
      newId,
      `Advance deposit $${data.amount} collected for ${data.patientName} (${receiptNumber})`,
      'PCI-DSS Payment Log'
    );
    return newRecord;
  };

  const addRefundPayment = (data: Omit<RefundPayment, 'id' | 'voucherNumber'>): RefundPayment => {
    const seq = refundPayments.length + 1;
    const newId = `REF-${new Date().getFullYear()}-${String(seq).padStart(3, '0')}`;
    const voucherNumber = `RFND-VOUCH-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord: RefundPayment = {
      ...data,
      id: newId,
      voucherNumber,
    };
    setRefundPayments((prev) => [newRecord, ...prev]);

    // If refunded against an advance deposit, adjust remaining balance
    if (data.originalReferenceType === 'Advance Deposit') {
      setAdvancePayments((prev) =>
        prev.map((adv) => {
          if (adv.id === data.originalReferenceId || adv.receiptNumber === data.originalReferenceId) {
            const newBal = Math.max(0, adv.remainingBalance - data.amount);
            return {
              ...adv,
              remainingBalance: newBal,
              status: newBal === 0 ? 'Refunded' : 'Partially Utilized',
            };
          }
          return adv;
        })
      );
    }

    addNotification(
      'Refund Voucher Issued',
      `Voucher ${voucherNumber} processed for ${data.patientName}: $${data.amount.toFixed(2)} (${data.reason}) via ${data.refundMethod}.`,
      'info'
    );
    logAuditEvent(
      'UPDATE',
      'Billing Invoice',
      newId,
      `Disbursed refund of $${data.amount} to ${data.patientName}. Voucher ${voucherNumber}`,
      'PCI-DSS Payment Log'
    );
    return newRecord;
  };

  const addInsuranceApproval = (data: Omit<InsuranceApproval, 'id'>): InsuranceApproval | null => {
    if (currentRole !== 'doctor' || data.approvalStatus !== 'Pending') return null;
    const seq = insuranceApprovals.length + 1;
    const newId = `APP-${new Date().getFullYear()}-${String(seq).padStart(3, '0')}`;
    const newRecord: InsuranceApproval = {
      ...data,
      id: newId,
    };
    setInsuranceApprovals((prev) => [newRecord, ...prev]);
    addNotification(
      data.approvalStatus === 'Pending' ? 'Insurance Authorization Requested' : 'Insurance Pre-Auth Approved',
      `${data.approvalStatus === 'Pending' ? 'Authorization requested' : `Auth #${data.approvalNumber} linked`} for ${data.patientName} under ${data.doctorName} (${data.serviceCategory}: ${data.serviceName}).`,
      data.approvalStatus === 'Pending' ? 'info' : 'success'
    );
    logAuditEvent(
      'CREATE',
      'Billing Invoice',
      newId,
      `${data.approvalStatus === 'Pending' ? 'Requested' : 'Linked'} pre-authorisation #${data.approvalNumber} for ${data.patientName} under ${data.doctorName}`,
      'HIPAA Access Log'
    );
    return newRecord;
  };

  const updateInsuranceApprovalStatus = (
    id: string,
    status: Exclude<InsuranceApproval['approvalStatus'], 'Approved'>,
    remarks?: string
  ) => {
    if (currentRole !== 'medical-coder') return;
    setInsuranceApprovals((prev) =>
      prev.map((app) =>
        app.id === id
          ? {
            ...app,
            approvalStatus: status,
            remarks: remarks !== undefined ? remarks : app.remarks,
          }
          : app
      )
    );
    addNotification('Insurance Pre-Auth Status Updated', `Authorisation ${id} status set to ${status}.`, 'info');
  };

  const publishInsuranceApproval = (
    id: string,
    details: Pick<InsuranceApproval, 'approvalNumber' | 'approvedAmount' | 'copayPercentage' | 'validUntil'>
  ) => {
    if (currentRole !== 'medical-coder') return;
    const approval = insuranceApprovals.find((item) => item.id === id);
    if (!approval || (approval.approvalStatus !== 'Pending' && approval.approvalStatus !== 'Query Raised')) return;
    const copayAmount = (details.approvedAmount * details.copayPercentage) / 100;
    setInsuranceApprovals((prev) => prev.map((item) => item.id === id
      ? {
          ...item,
          ...details,
          copayAmount,
          approvalStatus: 'Approved',
          approvalDate: new Date().toISOString().slice(0, 10),
          authorisedBy: currentUser.name,
          remarks: `Approval published by ${currentUser.name}.`,
        }
      : item
    ));
    addNotification('Insurance Approval Published', `Authorization ${details.approvalNumber} for ${approval.patientName} is approved and available to billing.`, 'success');
    logAuditEvent('UPDATE', 'Billing Invoice', id, `Medical coder ${currentUser.name} published insurance authorization ${details.approvalNumber}.`, 'HIPAA Access Log');
  };

  const addPosTransaction = (data: Omit<PosTransaction, 'id' | 'rrnNumber'>): PosTransaction => {
    const newId = `POS-TX-${Date.now().toString().slice(-6)}`;
    const rrnNumber = `RRN-${Date.now()}`;
    const newRecord: PosTransaction = {
      ...data,
      id: newId,
      rrnNumber,
    };
    setPosTransactions((prev) => [newRecord, ...prev]);
    addNotification(
      'POS Transaction Recorded',
      `Card/Drawer transaction of $${data.amount.toFixed(2)} logged at ${data.terminalName}.`,
      'success'
    );
    return newRecord;
  };

  const createReceptionToken = (data: Omit<ReceptionToken, 'id' | 'tokenNumber' | 'createdDate' | 'createdTime'>): ReceptionToken => {
    const seq = 100 + receptionTokens.length + 1;
    const tokenNumber = `T-${seq}`;
    const id = `TOK-${seq}`;
    const now = new Date();
    const nowDate = now.toISOString().split('T')[0];
    const nowTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const newRecord: ReceptionToken = {
      ...data,
      id,
      tokenNumber,
      createdDate: nowDate,
      createdTime: nowTime,
      historyLogs: data.historyLogs || [
        {
          stage: '1_REGISTRATION',
          timestamp: now.toISOString(),
          action: 'Patient registered and queued for consultation',
          actor: 'Registration Desk',
        },
      ],
    };
    setReceptionTokens((prev) => [newRecord, ...prev]);
    addNotification(
      'Queue Token Generated',
      `Token ${tokenNumber} issued to ${data.patientName} for ${data.department} (${data.counterOrRoom}).`,
      'success'
    );
    return newRecord;
  };

  const updateReceptionTokenStatus = (id: string, status: ReceptionToken['status']) => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setReceptionTokens((prev) =>
      prev.map((tok) => {
        if (tok.id === id) {
          return {
            ...tok,
            status,
            calledAt: status === 'In Consultation' ? now : tok.calledAt,
            completedAt: status === 'Completed' ? now : tok.completedAt,
          };
        }
        return tok;
      })
    );
    addNotification('Queue Status Updated', `Token ${id} is now ${status}.`, 'info');
  };

  const advanceTokenWorkflow = (
    tokenId: string,
    nextStage: TokenWorkflowStage,
    updates?: Partial<ReceptionToken>
  ) => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setReceptionTokens((prev) =>
      prev.map((tok) => {
        if (tok.id === tokenId) {
          const newStatus: ReceptionToken['status'] =
            nextStage === '6_COMPLETED_REPORTS'
              ? 'Completed'
              : nextStage === '3_DOCTOR_EMR' || nextStage === '5_DIAGNOSTICS_PROCEDURES'
                ? 'In Consultation'
                : 'Waiting';

          const stageLabel =
            nextStage === '1_REGISTRATION'
              ? '1. Registration'
              : nextStage === '2_NURSING_VITALS'
                ? '2. Nursing Vitals'
                : nextStage === '3_DOCTOR_EMR'
                  ? '3. Doctor EMR'
                  : nextStage === '4_CASHIER_BILLING'
                    ? '4. Cashier Billing'
                    : nextStage === '5_DIAGNOSTICS_PROCEDURES'
                      ? '5. Diagnostics & Procedures'
                      : '6. Reports Dispatched';

          const logItem = {
            stage: nextStage,
            timestamp: now,
            action: `Advanced to ${stageLabel}`,
            actor: currentUser?.name || 'Hospital Staff',
          };

          return {
            ...tok,
            ...updates,
            currentStage: nextStage,
            status: newStatus,
            historyLogs: tok.historyLogs ? [...tok.historyLogs, logItem] : [logItem],
            completedAt: nextStage === '6_COMPLETED_REPORTS' ? now : tok.completedAt,
          };
        }
        return tok;
      })
    );
    addNotification('Token Workflow Advanced', `Token ${tokenId} moved to next clinical stage.`, 'info');
  };

  const updateTokenVitals = (tokenId: string, vitals: TokenVitalsRecord) => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setReceptionTokens((prev) =>
      prev.map((tok) => {
        if (tok.id === tokenId) {
          const logItem = {
            stage: '2_NURSING_VITALS' as TokenWorkflowStage,
            timestamp: now,
            action: `Vitals recorded: BP ${vitals.bpSystolic}/${vitals.bpDiastolic}, HR ${vitals.heartRate}, SpO2 ${vitals.spO2}%, Triage ${vitals.triageLevel}`,
            actor: vitals.nurseName,
          };
          return {
            ...tok,
            vitals,
            currentStage: '3_DOCTOR_EMR', // Auto-advances to Doctor EMR!
            status: 'Waiting',
            counterOrRoom: 'Doctor Consultation Suite',
            historyLogs: tok.historyLogs ? [...tok.historyLogs, logItem] : [logItem],
          };
        }
        return tok;
      })
    );

    const targetToken = receptionTokens.find((t) => t.id === tokenId);
    if (targetToken && targetToken.patientId && targetToken.patientId !== 'WALK-IN') {
      addVitals(targetToken.patientId, {
        bloodPressureSys: vitals.bpSystolic,
        bloodPressureDia: vitals.bpDiastolic,
        heartRate: vitals.heartRate,
        spO2: vitals.spO2,
        temperature: vitals.temperature,
        respiratoryRate: vitals.respiratoryRate,
      });
    }

    addNotification(
      'Nursing Vitals Recorded',
      `Vitals captured for Token ${tokenId}. Patient forwarded to Doctor EMR queue.`,
      'success'
    );
  };

  const updateTokenDoctorOrders = (tokenId: string, orders: TokenDoctorOrder) => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setReceptionTokens((prev) =>
      prev.map((tok) => {
        if (tok.id === tokenId) {
          const logItem = {
            stage: '3_DOCTOR_EMR' as TokenWorkflowStage,
            timestamp: now,
            action: `Doctor orders entered: ${orders.diagnoses.map((d) => d.code).join(', ')}. ${orders.labRequests.length} labs, ${orders.radiologyRequests.length} radiology, ${orders.procedureRequests.length} CPT procedures`,
            actor: orders.orderedByDoctorName,
          };
          return {
            ...tok,
            doctorOrders: orders,
            currentStage: '4_CASHIER_BILLING', // Auto-advances to Cashier!
            status: 'Waiting',
            counterOrRoom: 'Cashier Counter',
            historyLogs: tok.historyLogs ? [...tok.historyLogs, logItem] : [logItem],
          };
        }
        return tok;
      })
    );

    const targetToken = receptionTokens.find((t) => t.id === tokenId);
    if (targetToken && targetToken.patientId && targetToken.patientId !== 'WALK-IN') {
      if (orders.clinicalAssessment || orders.healthSummary) {
        addClinicalNote(targetToken.patientId, {
          doctorName: orders.orderedByDoctorName,
          doctorSpecialty: targetToken.department,
          chiefComplaint: orders.chiefComplaint || 'Clinical Consultation',
          assessment: orders.clinicalAssessment || orders.healthSummary || 'Encounter documented',
          treatmentPlan: `Orders: ${[
            ...orders.labRequests.map((l) => l.testName),
            ...orders.radiologyRequests.map((r) => r.studyName),
            ...orders.procedureRequests.map((p) => p.procedureName),
          ].join(', ')}`,
          diagnosisCode: orders.diagnoses[0]?.code ? `ICD-10 ${orders.diagnoses[0].code}` : undefined,
        });
      }
    }

    addNotification(
      'Doctor EMR Orders Finalized',
      `Consultation & diagnostic requests saved for Token ${tokenId}. Patient forwarded to Cashier.`,
      'success'
    );
  };

  const settleTokenBilling = (tokenId: string, billing: TokenBillingSummary) => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setReceptionTokens((prev) =>
      prev.map((tok) => {
        if (tok.id === tokenId) {
          const logItem = {
            stage: '4_CASHIER_BILLING' as TokenWorkflowStage,
            timestamp: now,
            action: `Invoice settled. Subtotal: $${billing.subtotal}, Covered/Discount: $${(billing.insuranceCoveredAmount + billing.discountAmount).toFixed(2)}, Patient Paid: $${billing.totalPaid} (${billing.paymentMethod})`,
            actor: billing.cashierName,
          };

          const hasDiagnostics =
            (tok.doctorOrders?.labRequests && tok.doctorOrders.labRequests.length > 0) ||
            (tok.doctorOrders?.radiologyRequests && tok.doctorOrders.radiologyRequests.length > 0) ||
            (tok.doctorOrders?.procedureRequests && tok.doctorOrders.procedureRequests.length > 0);

          const nextStage: TokenWorkflowStage = hasDiagnostics ? '5_DIAGNOSTICS_PROCEDURES' : '6_COMPLETED_REPORTS';

          return {
            ...tok,
            billingSummary: billing,
            currentStage: nextStage,
            status: hasDiagnostics ? 'Waiting' : 'Completed',
            counterOrRoom: hasDiagnostics ? 'Diagnostics & Imaging Wing' : 'Discharge Complete',
            historyLogs: tok.historyLogs ? [...tok.historyLogs, logItem] : [logItem],
            completedAt: hasDiagnostics ? tok.completedAt : now,
          };
        }
        return tok;
      })
    );

    addNotification(
      'Cashier Invoice Settled',
      `Services invoiced for Token ${tokenId}. Receipt: ${billing.receiptNumber || 'RCP-' + Date.now().toString().slice(-5)}. Forwarded to Diagnostics.`,
      'success'
    );
  };

  const completeTokenDiagnosticReport = (tokenId: string, report: TokenDiagnosticReport) => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setReceptionTokens((prev) =>
      prev.map((tok) => {
        if (tok.id === tokenId) {
          const updatedReports = tok.diagnosticReports ? [...tok.diagnosticReports, report] : [report];
          const logItem = {
            stage: '5_DIAGNOSTICS_PROCEDURES' as TokenWorkflowStage,
            timestamp: now,
            action: `Diagnostic report verified: ${report.testOrStudyName} (${report.department}). Sent to Patient & Doctor.`,
            actor: report.technicianOrRadiologist,
          };
          return {
            ...tok,
            diagnosticReports: updatedReports,
            currentStage: '6_COMPLETED_REPORTS',
            status: 'Completed',
            completedAt: now,
            historyLogs: tok.historyLogs ? [...tok.historyLogs, logItem] : [logItem],
          };
        }
        return tok;
      })
    );

    const targetToken = receptionTokens.find((t) => t.id === tokenId);
    if (targetToken && targetToken.patientId && targetToken.patientId !== 'WALK-IN') {
      const newLabResult: Omit<LabResult, 'id'> = {
        testName: report.testOrStudyName,
        category: report.department === 'Radiology' ? 'Radiology' : report.department === 'Cardiology / Procedures' ? 'Cardiology' : 'Biochemistry',
        department: report.department,
        cptCode: report.cptOrCode,
        orderedDate: new Date().toISOString().split('T')[0],
        resultDate: new Date().toISOString().split('T')[0],
        status: report.status === 'Completed' ? 'Normal' : report.status,
        value: report.resultValue || report.impression || 'Completed',
        referenceRange: report.referenceRange || 'Reference range normal',
        orderedBy: targetToken.doctorName || 'Attending Physician',
        findings: report.findings,
        impression: report.impression,
        technicianOrRadiologist: report.technicianOrRadiologist,
        sentToPatient: true,
        sentToDoctor: true,
        sentDate: `${new Date().toISOString().split('T')[0]} ${now}`,
      };
      addLabResult(targetToken.patientId, newLabResult);
    }

    if (!targetToken?.patientId || targetToken.patientId === 'WALK-IN') {
      addNotification(
        'Diagnostic Report Dispatched',
        `Report for ${report.testOrStudyName} sent to Patient and Doctor EMR.`,
        'success'
      );
    }
  };

  const assignBedToPatient = (bedId: string, patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;
    setWardBeds((prev) =>
      prev.map((bed) => {
        if (bed.id === bedId) {
          return {
            ...bed,
            status: 'Occupied',
            patientId,
            patientName: `${patient.firstName} ${patient.lastName}`,
            assignedDoctor: patient.primaryPhysicianName,
            admissionDate: new Date().toISOString().split('T')[0],
          };
        }
        return bed;
      })
    );
    const bed = wardBeds.find((b) => b.id === bedId);
    updatePatient(patientId, {
      status: 'Inpatient',
      wardOrRoom: `${bed?.wardName} - ${bed?.bedNumber}`,
    });
    logAuditEvent('UPDATE', 'Patient Record', patientId, `Assigned to ${bed?.wardName} (${bed?.bedNumber})`);
    addNotification('Ward Bed Assigned', `${patient.firstName} ${patient.lastName} transferred to ${bed?.bedNumber}.`, 'info', patientId);
  };

  const releaseBed = (bedId: string) => {
    const targetBed = wardBeds.find((b) => b.id === bedId);
    if (!targetBed) return;
    setWardBeds((prev) =>
      prev.map((bed) =>
        bed.id === bedId
          ? {
            ...bed,
            status: 'Available',
            patientId: undefined,
            patientName: undefined,
            assignedDoctor: undefined,
            admissionDate: undefined,
          }
          : bed
      )
    );
    addNotification('Bed Cleared', `Bed ${targetBed.bedNumber} sanitized and available.`, 'info');
  };

  const addStaff = (memberData: Omit<StaffMember, 'id' | 'isActive'>): StaffMember | null => {
    const doctorManagedRoles: UserRole[] = ['doctor', 'nurse', 'lab', 'radiology'];
    const canAdd = currentRole === 'admin' || (
      currentRole === 'doctor' &&
      doctorManagedRoles.includes(memberData.role) &&
      memberData.department === currentUser.department
    );
    if (!canAdd) return null;

    const nextId = staff.reduce((maxId, member) => {
      const sequence = member.id.startsWith('STF-') ? Number(member.id.slice(4)) : 0;
      return Number.isInteger(sequence) ? Math.max(maxId, sequence) : maxId;
    }, 0) + 1;
    const newStaffMember: StaffMember = {
      ...memberData,
      id: `STF-${String(nextId).padStart(2, '0')}`,
      isActive: true,
    };
    setStaff((prev) => [...prev, newStaffMember]);
    logAuditEvent('CREATE', 'Security Settings', newStaffMember.id, `Staff member added: ${newStaffMember.name} (${newStaffMember.role})`);
    addNotification('Staff Registered', `Added ${newStaffMember.name} to ${newStaffMember.department}.`, 'info');
    return newStaffMember;
  };

  const deactivateStaff = (id: string): boolean => {
    const target = staff.find((member) => member.id === id && member.isActive !== false);
    if (!target || target.id === currentUser.id) return false;

    const activeAdminCount = staff.filter((member) => member.role === 'admin' && member.isActive !== false).length;
    const isLastAdmin = target.role === 'admin' && activeAdminCount <= 1;
    const doctorManagedRoles: UserRole[] = ['doctor', 'nurse', 'lab', 'radiology'];
    const canDeactivate = currentRole === 'admin'
      ? !isLastAdmin
      : currentRole === 'doctor' &&
        target.department === currentUser.department &&
        doctorManagedRoles.includes(target.role);
    if (!canDeactivate) return false;

    setStaff((prev) => prev.map((member) => member.id === id
      ? { ...member, isActive: false, status: 'Off Duty' }
      : member
    ));
    logAuditEvent('UPDATE', 'Security Settings', id, `Staff account deactivated: ${target.name} (${target.role}).`);
    addNotification('Staff Account Deactivated', `${target.name}'s account was deactivated.`, 'warning');
    return true;
  };

  const updateStaff = (id: string, updates: Partial<StaffMember>) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    logAuditEvent('UPDATE', 'Security Settings', id, `Updated staff duty profile`);
  };

  const setDoctorDutySchedule = (
    data: Omit<DoctorDutySchedule, 'id' | 'updatedAt' | 'updatedBy'>
  ): boolean => {
    if (currentRole !== 'admin' || data.date < new Date().toISOString().slice(0, 10)) return false;
    if (!doctors.some((doctor) => doctor.id === data.doctorId)) return false;
    if (data.isOnDuty) {
      const isValidTime = (value: string) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
      if (!isValidTime(data.startTime) || !isValidTime(data.endTime) || data.endTime <= data.startTime) return false;
    }

    const id = `${data.doctorId}-${data.date}`;
    const schedule: DoctorDutySchedule = {
      ...data,
      startTime: data.isOnDuty ? data.startTime : '',
      endTime: data.isOnDuty ? data.endTime : '',
      id,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.name,
    };
    setDoctorDutySchedules((previous) => [
      schedule,
      ...previous.filter((item) => item.id !== id),
    ]);
    logAuditEvent(
      'UPDATE',
      'Appointment',
      id,
      `${currentUser.name} set ${data.isOnDuty ? `${data.startTime}-${data.endTime}` : 'off duty'} for ${doctors.find((doctor) => doctor.id === data.doctorId)?.name} on ${data.date}.`
    );
    return true;
  };

  const submitDoctorDutyChangeRequest = (
    doctorId: string,
    updates: { availableDays: string[]; availableHours: string; reason: string }
  ): DoctorDutyChangeRequest | null => {
    if (currentRole !== 'doctor' || updates.availableDays.length === 0 || !updates.reason.trim()) return null;
    const doctor = doctors.find((item) => item.id === doctorId);
    if (!doctor || normalizeClinicianName(doctor.name) !== normalizeClinicianName(currentUser.name)) return null;
    if (doctorDutyChangeRequests.some((request) => request.doctorId === doctorId && request.status === 'Pending')) return null;

    const request: DoctorDutyChangeRequest = {
      id: `ROTA-${Date.now()}`,
      doctorId,
      doctorName: doctor.name,
      requesterUserId: currentUser.id,
      requesterUserName: currentUser.name,
      currentDays: [...doctor.availableDays],
      currentHours: doctor.availableHours,
      requestedDays: updates.availableDays,
      requestedHours: updates.availableHours,
      reason: updates.reason.trim(),
      status: 'Pending',
      requestedAt: new Date().toISOString(),
    };
    setDoctorDutyChangeRequests((previous) => [request, ...previous]);

    const administrators = staff.filter((member) => member.role === 'admin');
    if (administrators.length > 0) {
      administrators.forEach((administrator) =>
        addNotification(
          'Doctor Rota Change Requested',
          `${doctor.name} requested a duty change: ${updates.availableDays.join(', ')} · ${updates.availableHours}.`,
          'warning',
          request.id,
          { userId: administrator.id, userName: administrator.name }
        )
      );
    } else {
      addNotification('Doctor Rota Change Requested', `${doctor.name} submitted a duty change request.`, 'warning', request.id);
    }
    logAuditEvent('CREATE', 'Security Settings', request.id, `Doctor ${doctor.name} requested a rota change.`);
    return request;
  };

  const reviewDoctorDutyChangeRequest = (requestId: string, decision: 'Approved' | 'Rejected') => {
    if (currentRole !== 'admin') return;
    const request = doctorDutyChangeRequests.find((item) => item.id === requestId && item.status === 'Pending');
    if (!request) return;

    setDoctorDutyChangeRequests((previous) =>
      previous.map((item) => item.id === requestId
        ? { ...item, status: decision, reviewedAt: new Date().toISOString(), reviewedBy: currentUser.name }
        : item)
    );

    if (decision === 'Approved') {
      setDoctors((previous) => previous.map((doctor) => doctor.id === request.doctorId
        ? { ...doctor, availableDays: request.requestedDays, availableHours: request.requestedHours }
        : doctor));
    }

    const requester = staff.find((member) => member.id === request.requesterUserId);
    addNotification(
      `Doctor Rota Change ${decision}`,
      `${request.doctorName}'s duty change request was ${decision.toLowerCase()} by ${currentUser.name}.`,
      decision === 'Approved' ? 'success' : 'info',
      request.id,
      { userId: requester?.id, userName: request.requesterUserName }
    );
    logAuditEvent('UPDATE', 'Security Settings', request.id, `Rota request ${decision.toLowerCase()} by ${currentUser.name}.`);
  };

  const dispensePharmacyItem = (itemId: string, quantity: number, patientId: string) => {
    let dispensedItem: PharmacyItem | undefined;
    setPharmacy((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newStock = Math.max(0, item.stockQuantity - quantity);
          dispensedItem = { ...item, stockQuantity: newStock };
          return dispensedItem;
        }
        return item;
      })
    );
    if (dispensedItem) {
      logAuditEvent('DISPENSE', 'Prescription', itemId, `Dispensed ${quantity} units of ${dispensedItem.name} to patient ${patientId}`);
      if (dispensedItem.stockQuantity <= dispensedItem.minThreshold) {
        addNotification(
          'Low Stock Warning',
          `${dispensedItem.name} has only ${dispensedItem.stockQuantity} units left (Min threshold: ${dispensedItem.minThreshold}).`,
          'warning',
          itemId
        );
      } else {
        addNotification('Medication Dispensed', `Dispensed ${quantity} units of ${dispensedItem.name}.`, 'success', itemId);
      }
    }
  };

  const restockPharmacyItem = (itemId: string, quantity: number) => {
    setPharmacy((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, stockQuantity: item.stockQuantity + quantity } : item
      )
    );
    logAuditEvent('UPDATE', 'Prescription', itemId, `Restocked +${quantity} units to inventory`);
    addNotification('Stock Replenished', `Added +${quantity} units to pharmacy inventory.`, 'info', itemId);
  };

  const addPharmacyItem = (itemData: Omit<PharmacyItem, 'id'>) => {
    const newItem: PharmacyItem = {
      ...itemData,
      id: `PHARM-${String(pharmacy.length + 1).padStart(2, '0')}`,
    };
    setPharmacy((prev) => [...prev, newItem]);
    logAuditEvent('CREATE', 'Prescription', newItem.id, `Cataloged new medicine: ${newItem.name}`);
    addNotification('Catalog Updated', `Added ${newItem.name} to pharmacy stock.`, 'info');
  };

  const resetHospitalData = () => {
    setPatients(initialPatients);
    setDoctors(initialDoctors);
    setDoctorDutySchedules([]);
    setDoctorDutyChangeRequests([]);
    setAppointments(initialAppointments);
    setInvoices(initialInvoices);
    setWardBeds(initialWardBeds);
    setStaff(initialStaff);
    setPharmacy(initialPharmacy);
    setAuditLogs(initialAuditLogs);
    setCompliance(initialCompliance);
    setAdvancePayments(initialAdvancePayments);
    setRefundPayments(initialRefundPayments);
    setInsuranceApprovals(initialInsuranceApprovals);
    setPosTransactions(initialPosTransactions);
    setReceptionTokens(initialReceptionTokens);
    localStorage.clear();
    setLastBackupTimestampState(Date.now() - 26 * 60 * 60 * 1000);
    setBackupReminderSnoozedUntilState(null);
    addNotification('System Reset', 'Restored pristine MedCore OS clinical dataset.', 'info');
  };

  const [lastBackupTimestamp, setLastBackupTimestampState] = useState<number | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LAST_BACKUP_TIMESTAMP);
    if (saved) {
      const num = Number(saved);
      return isNaN(num) ? null : num;
    }
    return Date.now() - 26 * 60 * 60 * 1000;
  });

  const [backupReminderSnoozedUntil, setBackupReminderSnoozedUntilState] = useState<number | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BACKUP_SNOOZE_TIMESTAMP);
    if (saved) {
      const num = Number(saved);
      return isNaN(num) ? null : num;
    }
    return null;
  });

  const [showBackupReminderModal, setShowBackupReminderModal] = useState<boolean>(false);
  const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

  const isBackupOverdue = React.useMemo(() => {
    if (currentRole !== 'admin') return false;
    if (backupReminderSnoozedUntil && Date.now() < backupReminderSnoozedUntil) {
      return false;
    }
    if (!lastBackupTimestamp) return true;
    return Date.now() - lastBackupTimestamp >= BACKUP_INTERVAL_MS;
  }, [currentRole, backupReminderSnoozedUntil, lastBackupTimestamp]);

  useEffect(() => {
    if (isBackupOverdue && currentRole === 'admin' && isAuthenticated && !showPortalSelect) {
      setShowBackupReminderModal(true);
    }
  }, [isBackupOverdue, currentRole, isAuthenticated, showPortalSelect]);

  const performDatabaseBackup = (format: 'json' | 'csv' = 'json') => {
    const now = new Date();
    const recordCounts = {
      patients: patients.length,
      doctors: doctors.length,
      doctorDutySchedules: doctorDutySchedules.length,
      appointments: appointments.length,
      invoices: invoices.length,
      wardBeds: wardBeds.length,
      staff: staff.length,
      pharmacy: pharmacy.length,
      auditLogs: auditLogs.length,
    };
    let filename = '';
    if (format === 'json') {
      const hoursStr = String(now.getHours()).padStart(2, '0');
      const minsStr = String(now.getMinutes()).padStart(2, '0');
      filename = `medcore_apexhealth_backup_${now.toISOString().split('T')[0]}_${hoursStr}${minsStr}.json`;
      const exportPayload = {
        hospitalName: 'Apex Health Systems & Clinical Care',
        systemName: 'MedCore OS',
        version: '4.4.0',
        exportTimestamp: now.toISOString(),
        exportedBy: {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
          department: currentUser.department,
        },
        compliance,
        recordCounts,
        database: {
          patients,
          doctors,
          doctorDutySchedules,
          appointments,
          invoices,
          wardBeds,
          staff,
          pharmacy,
          auditLogs,
        },
        checksum: `CRC32-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      };
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      filename = `medcore_apexhealth_patients_archive_${now.toISOString().split('T')[0]}.csv`;
      const headers = 'ID,FirstName,LastName,Gender,Age,BloodGroup,Status,Phone,Email,PrimaryPhysician,ChronicConditions\n';
      const rows = patients
        .map(
          (p) =>
            `"${p.id}","${p.firstName}","${p.lastName}","${p.gender}",${p.age},"${p.bloodGroup}","${p.status}","${p.phone}","${p.email}","${p.primaryPhysicianName}","${p.chronicConditions.join(';')}"`
        )
        .join('\n');
      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', url);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
    }
    const timestamp = Date.now();
    setLastBackupTimestampState(timestamp);
    localStorage.setItem(STORAGE_KEYS.LAST_BACKUP_TIMESTAMP, timestamp.toString());
    setBackupReminderSnoozedUntilState(null);
    localStorage.removeItem(STORAGE_KEYS.BACKUP_SNOOZE_TIMESTAMP);
    setShowBackupReminderModal(false);
    logAuditEvent(
      'BACKUP_EXPORT',
      'Security Settings',
      'SYS-BACKUP-01',
      `Exported full 24h disaster recovery database dump (${format.toUpperCase()}) containing ${patients.length} patients and ${auditLogs.length} audit entries.`,
      'HIPAA Access Log'
    );
    addNotification(
      'Database Backup Saved',
      `Local ${format.toUpperCase()} archive downloaded. 24-hour backup reminder schedule renewed.`,
      'info'
    );
    return { success: true, filename, recordCounts };
  };

  const snoozeBackupReminder = (hours: number = 4) => {
    const snoozeUntil = Date.now() + hours * 60 * 60 * 1000;
    setBackupReminderSnoozedUntilState(snoozeUntil);
    localStorage.setItem(STORAGE_KEYS.BACKUP_SNOOZE_TIMESTAMP, snoozeUntil.toString());
    setShowBackupReminderModal(false);
    addNotification(
      'Backup Reminder Snoozed',
      `Administrator 24h backup prompt deferred for ${hours} hours.`,
      'info'
    );
  };

  const dismissBackupReminder = () => {
    setShowBackupReminderModal(false);
  };

  const triggerTestBackupReminder = () => {
    setShowBackupReminderModal(true);
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || null;

  return (
    <HospitalContext.Provider
      value={{
        patients,
        doctors,
        doctorDutySchedules,
        doctorDutyChangeRequests,
        appointments,
        invoices,
        advancePayments,
        refundPayments,
        insuranceApprovals,
        posTransactions,
        receptionTokens,
        wardBeds,
        staff,
        pharmacy,
        auditLogs,
        compliance,
        notifications,
        selectedPatient,
        selectedPatientId,
        activeTab,
        registrationMode,
        currentRole,
        currentUser,
        currentRoleDefinition,
        isAuthenticated,
        authenticatedUser,
        departmentPortal,
        appTheme,
        setAppTheme,
        showPortalSelect,
        setShowPortalSelect,
        login,
        logout,
        selectDepartmentPortal,
        setCurrentRole,
        setCurrentUserId,
        setActiveTab,
        setRegistrationMode,
        setSelectedPatientId,
        addPatient,
        updatePatient,
        updatePatientStatus,
        addVitals,
        addTriageAssessment,
        addMedication,
        addPrescription,
        addClinicalNote,
        addLabResult,
        updateLabResult,
        dischargePatient,
        bookAppointment,
        addAppointment,
        updateAppointmentStatus,
        callNextAppointment,
        createInvoice,
        processPayment,
        addAdvancePayment,
        addRefundPayment,
        addInsuranceApproval,
        updateInsuranceApprovalStatus,
        addPosTransaction,
        createReceptionToken,
        updateReceptionTokenStatus,
        advanceTokenWorkflow,
        updateTokenVitals,
        updateTokenDoctorOrders,
        settleTokenBilling,
        completeTokenDiagnosticReport,
        assignBedToPatient,
        releaseBed,
        setDoctorDutySchedule,
        addStaff,
        deactivateStaff,
        updateStaff,
        submitDoctorDutyChangeRequest,
        reviewDoctorDutyChangeRequest,
        dispensePharmacyItem,
        restockPharmacyItem,
        addPharmacyItem,
        logAuditEvent,
        updateCompliance,
        markNotificationRead,
        clearAllNotifications,
        addNotification,
        resetHospitalData,
        lastBackupTimestamp,
        backupReminderSnoozedUntil,
        isBackupOverdue,
        showBackupReminderModal,
        setShowBackupReminderModal,
        performDatabaseBackup,
        snoozeBackupReminder,
        dismissBackupReminder,
        triggerTestBackupReminder,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
