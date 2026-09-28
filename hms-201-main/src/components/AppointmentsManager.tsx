import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PhoneCall,
  User,
  Stethoscope,
  Video,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { DoctorDutySlotsTable } from './DoctorDutySlotsTable';

interface AppointmentsManagerProps {
  onOpenNewAppointment: (preset?: { doctorId?: string; date?: string; timeSlot?: string }) => void;
  onSelectPatient: (id: string) => void;
  onStartTelehealth?: (patientId: string, doctorName?: string) => void;
}

export const AppointmentsManager: React.FC<AppointmentsManagerProps> = ({
  onOpenNewAppointment,
  onSelectPatient,
  onStartTelehealth,
}) => {
  const {
    appointments,
    updateAppointmentStatus,
    addNotification,
    setActiveTab,
  } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showRosterTable, setShowRosterTable] = useState(true);

  const departmentOptions = Array.from(new Set(appointments.map((appointment) => appointment.department))).sort();

  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch =
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || a.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesDate = !dateFilter || a.date === dateFilter;

    const matchesDepartment =
      selectedDepartment === 'all' || a.department === selectedDepartment;

    return matchesSearch && matchesStatus && matchesDate && matchesDepartment;
  });

  const handleStatusChange = (id: string, newStatus: any, patientName: string) => {
    updateAppointmentStatus(id, newStatus);
    addNotification(
      `Appointment Updated`,
      `${patientName}'s status changed to ${newStatus}.`,
      'info',
      id
    );
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700 mb-1">
                Hospital Management System (2)
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Clinical Appointment & Consultation Scheduling
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Real-time outpatient check-in queue, physician duty roster allocations, and waiting room turnover tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowRosterTable(!showRosterTable)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{showRosterTable ? 'Hide Duty Roster' : 'Physician Duty Slots'}</span>
          </button>
          <button
            onClick={() => onOpenNewAppointment()}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Book Slot</span>
          </button>
        </div>
      </div>

      {showRosterTable && (
        <div className="animate-in fade-in">
          <DoctorDutySlotsTable
            onBookSlot={(docId, date, timeSlot) => {
              onOpenNewAppointment({ doctorId: docId, date, timeSlot });
            }}
          />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, doctor, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:ring-2 focus:ring-blue-500/20 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 flex-wrap justify-end">
          <div className="flex items-center gap-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'scheduled', label: 'Scheduled' },
              { id: 'checked-in', label: 'Checked-In' },
              { id: 'in consultation', label: 'In Clinic' },
              { id: 'completed', label: 'Completed' },
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

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg py-1 px-2 text-xs font-medium text-slate-700"
            title="Filter by department"
          >
            <option value="all">All Departments</option>
            {departmentOptions.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg py-1 px-2 text-xs font-mono text-slate-700"
            title="Filter by consultation date"
          />
        </div>
      </div>

      {/* Appointments Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Appointments Schedule ({filteredAppointments.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Synchronized with Clinic Ward Roster
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/75 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="py-2.5 px-3">Slot / Wait</th>
                <th className="py-2.5 px-3">Patient</th>
                <th className="py-2.5 px-3">Attending Physician</th>
                <th className="py-2.5 px-3">Chief Complaint</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No scheduled appointments matching current filters.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
                      <div className="font-bold text-slate-800">{appt.timeSlot}</div>
                      <div className="text-[10px] text-slate-400">{appt.date}</div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <button
                        onClick={() => {
                          onSelectPatient(appt.patientId);
                          setActiveTab('patients');
                        }}
                        className="text-left group cursor-pointer"
                      >
                        <span className="font-semibold text-slate-900 group-hover:text-blue-600 block">
                          {appt.patientName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {appt.patientId} · {appt.patientAge}y {appt.patientGender}
                        </span>
                      </button>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-700">
                      <div className="font-semibold">{appt.doctorName}</div>
                      <div className="text-[10px] text-slate-400">{appt.department}</div>
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                      {appt.chiefComplaint}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          appt.priority === 'Emergency'
                            ? 'bg-rose-100 text-rose-700'
                            : appt.priority === 'Urgent'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {appt.priority}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          appt.status === 'In Consultation'
                            ? 'bg-blue-100 text-blue-700'
                            : appt.status === 'Checked-In'
                            ? 'bg-emerald-100 text-emerald-700'
                            : appt.status === 'Completed'
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            appt.status === 'In Consultation'
                              ? 'bg-blue-600 animate-pulse'
                              : appt.status === 'Checked-In'
                              ? 'bg-emerald-600'
                              : appt.status === 'Completed'
                              ? 'bg-slate-400'
                              : 'bg-amber-600'
                          }`}
                        />
                        {appt.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-right space-x-1">
                      {(appt.isTelehealth || appt.type === 'Telehealth Consultation') && (
                        <button
                          onClick={() => onStartTelehealth?.(appt.patientId, appt.doctorName)}
                          className="px-2 py-1 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Video className="w-3 h-3" /> Video
                        </button>
                      )}
                      {appt.status === 'Scheduled' && (
                        <button
                          onClick={() => handleStatusChange(appt.id, 'Checked-In', appt.patientName)}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-semibold text-[11px] cursor-pointer"
                        >
                          Check In
                        </button>
                      )}
                      {appt.status === 'Checked-In' && (
                        <button
                          onClick={() => handleStatusChange(appt.id, 'In Consultation', appt.patientName)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <PhoneCall className="w-3 h-3" /> Call In
                        </button>
                      )}
                      {appt.status === 'In Consultation' && (
                        <button
                          onClick={() => handleStatusChange(appt.id, 'Completed', appt.patientName)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded font-semibold text-[11px] cursor-pointer"
                        >
                          Mark Done
                        </button>
                      )}
                      {appt.status !== 'Completed' && appt.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleStatusChange(appt.id, 'Cancelled', appt.patientName)}
                          className="px-2 py-1 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 rounded font-semibold text-[11px] cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
