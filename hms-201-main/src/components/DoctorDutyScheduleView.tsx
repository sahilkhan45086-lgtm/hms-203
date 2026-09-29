import React, { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Clock, ShieldCheck, Stethoscope } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { Doctor } from '../types';
import { getDoctorDutyWindow } from '../utils/doctorDutySchedule';

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const today = () => formatDate(new Date());

export const DoctorDutyScheduleView: React.FC = () => {
  const { doctors, doctorDutySchedules, currentRole, setDoctorDutySchedule } = useHospital();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(today);
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [feedback, setFeedback] = useState('');

  const departments = useMemo(() => [...new Set(doctors.map((doctor) => doctor.department))], [doctors]);
  const departmentDoctors = useMemo(
    () => doctors.filter((doctor) => !selectedDepartment || doctor.department === selectedDepartment),
    [doctors, selectedDepartment]
  );
  const selectedDoctor = departmentDoctors.find((doctor) => doctor.id === selectedDoctorId) || departmentDoctors[0];
  const dateSchedule = doctorDutySchedules.find((item) => item.doctorId === selectedDoctor?.id && item.date === selectedDate);
  const inheritedDuty = selectedDoctor
    ? getDoctorDutyWindow(selectedDoctor, doctorDutySchedules.filter((item) => item.date !== selectedDate), selectedDate)
    : { isOnDuty: false, startTime: '', endTime: '' };

  useEffect(() => {
    if (!selectedDoctor) return;
    const window = getDoctorDutyWindow(selectedDoctor, doctorDutySchedules, selectedDate);
    setIsOnDuty(window.isOnDuty);
    setStartTime(window.startTime || '09:00');
    setEndTime(window.endTime || '17:00');
    setFeedback('');
  }, [selectedDoctor?.id, selectedDate]);

  const dateOptions = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(`${today()}T12:00:00`);
    date.setDate(date.getDate() + index);
    return {
      value: formatDate(date),
      label: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' }),
      subLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });

  const saveSchedule = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedDoctor) return;
    const saved = setDoctorDutySchedule({
      doctorId: selectedDoctor.id,
      date: selectedDate,
      isOnDuty,
      startTime: isOnDuty ? startTime : '',
      endTime: isOnDuty ? endTime : '',
    });
    setFeedback(saved ? `Duty updated for ${selectedDoctor.name} on ${selectedDate}.` : 'Could not save this duty schedule. Check the selected day and shift times.');
  };

  if (currentRole !== 'admin' && currentRole !== 'doctor') {
    return (
      <section className="mx-auto max-w-2xl rounded-xl border border-amber-200 bg-white p-6 text-center shadow-sm">
        <ShieldCheck className="mx-auto h-8 w-8 text-amber-600" />
        <h2 className="mt-3 text-base font-bold text-slate-900">Duty roster access restricted</h2>
        <p className="mt-1 text-sm text-slate-600">Only administrators and doctors can view duty assignments.</p>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 lg:p-6">
      <header className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-800"><CalendarClock className="h-4.5 w-4.5" /></span>
          <div>
            <h1 className="text-base font-bold text-slate-950">Doctor Duty Roster</h1>
            <p className="mt-0.5 text-xs text-slate-500">Set each doctor’s duty status and shift hours by date.</p>
          </div>
        </div>
        {currentRole === 'admin' && <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800"><ShieldCheck className="h-4 w-4" /> Schedule administrator</span>}
      </header>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Stethoscope className="h-4 w-4 text-teal-800" />
            <h2 className="text-sm font-bold text-slate-900">Select doctor and date</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-700">
              Department
              <select value={selectedDepartment} onChange={(event) => { setSelectedDepartment(event.target.value); setFeedback(''); }} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal">
                <option value="">All departments</option>
                {departments.map((department) => <option key={department} value={department}>{department}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Doctor
              <select value={selectedDoctor?.id || ''} onChange={(event) => {
                const doctor = doctors.find((item) => item.id === event.target.value);
                setSelectedDoctorId(event.target.value);
                if (doctor) setSelectedDepartment(doctor.department);
                setFeedback('');
              }} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal">
                {departmentDoctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name} · {doctor.specialty}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {dateOptions.map((option) => (
              <button key={option.value} type="button" aria-pressed={selectedDate === option.value} onClick={() => setSelectedDate(option.value)} className={`min-w-16 rounded-md border px-2.5 py-1.5 text-center text-[10px] font-bold ${selectedDate === option.value ? 'border-teal-800 bg-teal-800 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
                <span className="block">{option.label}</span><span className="text-[9px] font-normal opacity-80">{option.subLabel}</span>
              </button>
            ))}
          </div>
          <label className="mt-3 block max-w-xs text-xs font-semibold text-slate-700">
            Or choose a date
            <input type="date" min={today()} value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal" />
          </label>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="h-4 w-4 text-teal-800" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Daily duty assignment</h2>
              {selectedDoctor && <p className="mt-0.5 text-[11px] text-slate-500">{selectedDoctor.name} · {selectedDate}</p>}
            </div>
          </div>

          {selectedDoctor && (
            <>
              <div className={`mb-3 rounded-md border px-3 py-2 text-xs ${dateSchedule ? 'border-blue-200 bg-blue-50 text-blue-900' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                {dateSchedule ? 'Date-specific schedule is set.' : inheritedDuty.isOnDuty ? `Using weekly default: ${inheritedDuty.startTime}–${inheritedDuty.endTime}` : 'No weekly duty is set for this day.'}
              </div>
              {currentRole === 'admin' ? (
                <form onSubmit={saveSchedule} className="space-y-3">
                  <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800">
                    <span>Doctor is on duty</span>
                    <input type="checkbox" checked={isOnDuty} onChange={(event) => setIsOnDuty(event.target.checked)} className="h-4 w-4 accent-teal-800" />
                  </label>
                  {isOnDuty && (
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-xs font-semibold text-slate-700">Start time<input required type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" /></label>
                      <label className="text-xs font-semibold text-slate-700">End time<input required type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" /></label>
                    </div>
                  )}
                  {feedback && <p role="status" className="text-xs text-teal-800">{feedback}</p>}
                  <div className="flex justify-end">
                    <button type="submit" className="inline-flex h-9 items-center gap-2 rounded-md bg-teal-800 px-4 text-xs font-bold text-white hover:bg-teal-900"><CheckCircle2 className="h-4 w-4" /> Save daily duty</button>
                  </div>
                </form>
              ) : (
                <div className={`rounded-lg p-4 ${isOnDuty ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                  <p className={`text-sm font-bold ${isOnDuty ? 'text-emerald-800' : 'text-slate-700'}`}>{isOnDuty ? 'On duty' : 'Off duty'}</p>
                  {isOnDuty && <p className="mt-1 font-mono text-sm text-slate-700">{startTime}–{endTime}</p>}
                  <p className="mt-2 text-[11px] text-slate-500">Contact an administrator to change this assignment.</p>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};
