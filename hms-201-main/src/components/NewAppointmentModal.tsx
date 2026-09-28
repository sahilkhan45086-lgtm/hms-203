import React, { useState, useEffect } from 'react';
import {
  X,
  CalendarPlus,
  Clock,
  User,
  Stethoscope,
  AlertCircle,
  Activity,
  CheckCircle2,
  Calendar,
  Search,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { AppointmentPriority } from '../types';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetDoctorId?: string;
  presetDate?: string;
  presetTimeSlot?: string;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  presetDoctorId,
  presetDate,
  presetTimeSlot,
}) => {
  const { patients, doctors, appointments, addAppointment, addNotification } = useHospital();

  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [doctorId, setDoctorId] = useState(presetDoctorId || doctors[0]?.id || '');
  const [date, setDate] = useState(presetDate || new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState(presetTimeSlot || '10:00 AM');
  const [priority, setPriority] = useState<AppointmentPriority>('Normal');
  const [isTelehealth, setIsTelehealth] = useState(false);
  const [chiefComplaint, setChiefComplaint] = useState('Routine clinical consultation & review');
  const [patientQuery, setPatientQuery] = useState('');

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

  const searchablePatients = patients.filter((patient) => {
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
    ].filter(Boolean) as string[];

    return searchableValues.some((value) => value.toLowerCase().includes(search));
  });

  const selectedPatient = patients.find((p) => p.id === patientId);
  const selectedDoc = doctors.find((d) => d.id === doctorId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient || !selectedDoc) {
      addNotification('Selection Missing', 'Please select both a patient and an attending doctor.', 'warning');
      return;
    }

    addAppointment({
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      patientAge: selectedPatient.age,
      patientGender: selectedPatient.gender,
      doctorId: selectedDoc.id,
      doctorName: selectedDoc.name,
      department: selectedDoc.department,
      date,
      timeSlot,
      status: 'Scheduled',
      priority,
      type: isTelehealth ? 'Telehealth Consultation' : 'General Consultation',
      reason: chiefComplaint,
      chiefComplaint,
      estimatedWaitMinutes: priority === 'Emergency' ? 0 : priority === 'Urgent' ? 5 : 15,
      isTelehealth,
      telehealthDetails: isTelehealth
        ? {
            platform: 'WebRTC Clinical Room',
            roomId: `TH-${selectedDoc.id}-${date.replace(/-/g, '')}`,
            meetingLink: `https://telehealth.medcore.health/room/TH-${selectedDoc.id}-${selectedPatient.id}`,
            patientStatus: 'Waiting in Room',
            telehealthConsentSigned: true,
          }
        : undefined,
    });

    addNotification(
      'Appointment Confirmed',
      `Booked slot for ${selectedPatient.firstName} ${selectedPatient.lastName} with ${selectedDoc.name} on ${date} at ${timeSlot}.`,
      'success',
      selectedPatient.id
    );

    onClose();
  };

  const addDays = (base: Date, days: number) => {
    const result = new Date(base);
    result.setDate(result.getDate() + days);
    return result;
  };

  const formatISODate = (value: Date) => value.toISOString().split('T')[0];

  const TIME_SLOTS = [
    '08:00 AM',
    '08:30 AM',
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
    '12:30 PM',
    '01:00 PM',
    '01:30 PM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
    '04:30 PM',
    '05:00 PM',
  ];

  const scheduleDates = Array.from({ length: 5 }, (_, index) => {
    const dateValue = addDays(new Date(), index);
    return {
      value: formatISODate(dateValue),
      label: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : dateValue.toLocaleDateString('en-US', { weekday: 'short' }),
      subLabel: dateValue.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });

  const isSlotBooked = (slotDate: string, slotTime: string) =>
    appointments.some(
      (appt) => appt.doctorId === selectedDoc?.id && appt.date === slotDate && appt.timeSlot === slotTime
    );

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Classification Badge */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
              <CalendarPlus className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                  Front Desk & Schedule
                </span>
              </div>
              <h2 className="font-bold text-sm text-white mt-0.5">Book Consultation Slot</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Classification Section 1: Patient & Clinician Selection */}
          <div className="space-y-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              1. Patient & Attending Clinician
            </span>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Select Patient
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={patientQuery}
                  onChange={(e) => setPatientQuery(e.target.value)}
                  placeholder="Search by name, phone, MRN, national ID, or passport"
                  className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-2 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mt-2"
                required
              >
                {searchablePatients.length === 0 ? (
                  <option value="">No patient matches this search</option>
                ) : (
                  searchablePatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} (MRN: {p.id}) — {p.phone || 'No phone'} · {p.emiratesId || p.passportNo || 'No ID'}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Attending Clinician & Specialty
              </label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialty} ({d.department}) · {d.isAvailable ? 'Available' : 'In Consult'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Classification Section 2: Date, Time & Priority */}
          <div className="space-y-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              2. Schedule & Acuity
            </span>

            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Department</div>
                  <div className="font-semibold text-slate-800">{selectedDoc?.department || 'General Medicine'}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Doctor</div>
                  <div className="font-semibold text-slate-800">{selectedDoc?.name || 'Doctor'}</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-[10px]">
                  <thead>
                    <tr>
                      <th className="border border-slate-200 bg-slate-100 px-1.5 py-1 text-left font-bold text-slate-600">Time</th>
                      {scheduleDates.map((day) => (
                        <th key={day.value} className="border border-slate-200 bg-slate-100 px-1 py-1 text-center font-bold text-slate-600 min-w-[62px]">
                          <div>{day.label}</div>
                          <div className="text-[9px] text-slate-500">{day.subLabel}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.map((slot) => (
                      <tr key={slot}>
                        <td className="border border-slate-200 bg-slate-50 px-1.5 py-1 font-mono font-bold text-slate-700 whitespace-nowrap">{slot}</td>
                        {scheduleDates.map((day) => {
                          const slotBooked = isSlotBooked(day.value, slot);
                          const isSelected = day.value === date && slot === timeSlot;

                          return (
                            <td key={`${day.value}-${slot}`} className="border border-slate-200 p-1 text-center">
                              <button
                                type="button"
                                disabled={slotBooked}
                                onClick={() => {
                                  setDate(day.value);
                                  setTimeSlot(slot);
                                }}
                                className={`w-full rounded px-1 py-1 text-[9px] font-bold transition ${
                                  slotBooked
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : isSelected
                                      ? 'bg-blue-600 text-white ring-1 ring-blue-700'
                                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                              >
                                {slotBooked ? 'Booked' : isSelected ? 'Selected' : 'Open'}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Selected Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Consultation Time Slot
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                Acuity Priority
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Normal', 'Urgent', 'Emergency'] as AppointmentPriority[]).map((pr) => {
                  const isSelected = priority === pr;
                  return (
                    <button
                      key={pr}
                      type="button"
                      onClick={() => setPriority(pr)}
                      className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        isSelected
                          ? pr === 'Emergency'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : pr === 'Urgent'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {pr === 'Emergency' ? (
                        <Activity className="w-3.5 h-3.5" />
                      ) : pr === 'Urgent' ? (
                        <AlertCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      <span>{pr}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-3 p-3 bg-violet-50 border border-violet-200 rounded-xl">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wider block">
                  Telehealth Consultation
                </span>
                <span className="text-[11px] text-violet-700/80">Launch secure video consultation with the doctor</span>
              </div>
              <input
                type="checkbox"
                checked={isTelehealth}
                onChange={(e) => setIsTelehealth(e.target.checked)}
                className="h-4 w-4 rounded border-violet-300 text-violet-600 focus:ring-violet-500"
              />
            </label>
          </div>

          {/* Classification Section 3: Clinical Reason */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Clinical Reason / Chief Complaint
            </label>
            <textarea
              rows={2}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Primary symptoms, follow-up purpose, or consultation objective..."
            />
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Book Slot</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

