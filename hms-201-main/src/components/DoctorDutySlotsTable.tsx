import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Video,
  UserCheck,
  Stethoscope,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { Doctor } from '../types';

interface DoctorDutySlotsTableProps {
  onBookSlot?: (doctorId: string, date: string, timeSlot: string) => void;
}

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDateValue = (date: Date) => date.toISOString().split('T')[0];

const formatDayLabel = (date: Date, index: number) => {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

const timeToMinutes = (time: string) => {
  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  const hour = Number(match[1]) % 12 + (match[3].toUpperCase() === 'PM' ? 12 : 0);
  return hour * 60 + Number(match[2]);
};

const minutesToTimeLabel = (minutes: number) => {
  const hours24 = Math.floor(minutes / 60);
  const hours12 = hours24 % 12 || 12;
  const suffix = hours24 >= 12 ? 'PM' : 'AM';
  return `${String(hours12).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')} ${suffix}`;
};

export const DoctorDutySlotsTable: React.FC<DoctorDutySlotsTableProps> = ({ onBookSlot }) => {
  const { doctors, appointments } = useHospital();

  const doctorDepartments = useMemo(
    () => [...new Set(doctors.map((doctor) => doctor.department))],
    [doctors]
  );

  const [selectedDepartment, setSelectedDepartment] = useState<string>(doctorDepartments[0] || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(formatDateValue(new Date()));

  const departmentDoctors = useMemo(
    () =>
      doctors.filter((doctor) => {
        if (!selectedDepartment) return true;
        return doctor.department === selectedDepartment;
      }),
    [doctors, selectedDepartment]
  );

  const selectedDoc =
    departmentDoctors.find((doctor) => doctor.id === selectedDoctorId) ||
    departmentDoctors[0] ||
    doctors[0];

  const dateOptions = useMemo(
    () =>
      Array.from({ length: 5 }, (_, index) => {
        const date = addDays(new Date(), index);
        return {
          value: formatDateValue(date),
          label: formatDayLabel(date, index),
          short: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        };
      }),
    []
  );

  const defaultTimeSlots = [
    '08:30 AM',
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '01:00 PM',
    '01:30 PM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
  ];

  const bookedSlots = appointments
    .filter((a) => a.doctorId === selectedDoc?.id && a.date === selectedDate)
    .map((a) => a.timeSlot);
  const selectedWeekday = new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' });
  const dutyHours = selectedDoc?.availableHours.split(/\s+-\s+/) || [];
  const dutyStart = dutyHours.length === 2 ? timeToMinutes(dutyHours[0]) : null;
  const dutyEnd = dutyHours.length === 2 ? timeToMinutes(dutyHours[1]) : null;
  const timeSlots = dutyStart !== null && dutyEnd !== null && dutyEnd > dutyStart
    ? Array.from(
        { length: Math.floor((dutyEnd - dutyStart) / 30) },
        (_, index) => minutesToTimeLabel(dutyStart + index * 30)
      )
    : defaultTimeSlots;
  const isSlotOnDuty = (slot: string) => {
    if (!selectedDoc?.availableDays.includes(selectedWeekday)) return false;
    return timeSlots.includes(slot);
  };

  const doctorsByDepartment = useMemo(
    () =>
      doctors.reduce<Record<string, Doctor[]>>((groups, doctor) => {
        const key = doctor.department;
        groups[key] = groups[key] || [];
        groups[key].push(doctor);
        return groups;
      }, {}),
    [doctors]
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
      <div className="flex flex-col gap-3 pb-3 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Doctor Consultation Duty & Slot Roster
              </h3>
              <p className="text-[11px] text-slate-500">
                Grouped by department with today and upcoming clinic slots
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-2">
          <select
            value={selectedDepartment}
            onChange={(event) => {
              const nextDepartment = event.target.value;
              setSelectedDepartment(nextDepartment);
              const nextDoctor = doctors.find(
                (doctor) => doctor.department === nextDepartment
              );
              if (nextDoctor) {
                setSelectedDoctorId(nextDoctor.id);
              }
            }}
            className="bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs font-medium text-slate-800"
          >
            {doctorDepartments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>

          <select
            value={selectedDoc?.id || ''}
            onChange={(event) => setSelectedDoctorId(event.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs font-medium text-slate-800"
          >
            {Object.entries(doctorsByDepartment).map(([department, departmentDoctorsList]) => (
              <optgroup key={department} label={department}>
                {departmentDoctorsList.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} ({doctor.specialty})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <div className="flex flex-wrap gap-2">
            {dateOptions.map((dateOption) => (
              <button
                key={dateOption.value}
                onClick={() => setSelectedDate(dateOption.value)}
                className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition ${
                  selectedDate === dateOption.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div>{dateOption.label}</div>
                <div className="text-[9px] opacity-80">{dateOption.short}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedDoc && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
              {selectedDoc.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div>
              <div className="font-bold text-slate-900">{selectedDoc.name}</div>
              <div className="text-[11px] text-slate-500">
                {selectedDoc.specialty} · {selectedDoc.department} · Room: {selectedDoc.roomNumber}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selectedDoc.status === 'Available'
                  ? 'bg-emerald-100 text-emerald-800'
                  : selectedDoc.status === 'In Surgery'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
              }`}
            >
              ● {selectedDoc.status}
            </span>
            <span className="text-[11px] text-slate-500">
              Shift: {selectedDoc.availableHours || 'Clinic Schedule'}
            </span>
          </div>
        </div>
      )}

      {/* Slots Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Available Time Slots for {selectedDate}
          </div>
          <div className="text-[10px] text-slate-500">
            {timeSlots.filter((slot) => !bookedSlots.includes(slot) && isSlotOnDuty(slot)).length} slots open
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {timeSlots.map((slot) => {
            const isBooked = bookedSlots.includes(slot);
            const isOnDuty = isSlotOnDuty(slot);
            return (
              <button
                key={slot}
                disabled={isBooked || !isOnDuty}
                onClick={() => selectedDoc && onBookSlot && onBookSlot(selectedDoc.id, selectedDate, slot)}
                className={`p-2.5 rounded-lg border text-center transition flex flex-col items-center justify-between gap-1 ${
                  isBooked || !isOnDuty
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-white border-blue-200 hover:border-blue-600 hover:bg-blue-50 text-slate-800 shadow-2xs cursor-pointer'
                }`}
              >
                <span className="font-mono text-xs font-bold">{slot}</span>
                <span className="text-[9px] font-semibold">
                  {isBooked ? 'Booked' : isOnDuty ? 'Available' : 'Off duty'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
