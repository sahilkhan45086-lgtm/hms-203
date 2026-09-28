import React, { useState } from 'react';
import {
  Stethoscope,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UserCheck,
  Plus,
  Mail,
  Phone,
  Award,
  CalendarClock,
  X,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { StaffMember } from '../types';

export const StaffManagement: React.FC = () => {
  const { staff, doctors, currentRole, doctorDutyChangeRequests, reviewDoctorDutyChangeRequest } = useHospital();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === 'all' || s.role.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });
  const pendingDutyRequests = doctorDutyChangeRequests.filter((request) => request.status === 'Pending');

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Stethoscope className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Hospital Clinical Staff Directory & Credentialing
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold uppercase">
              CREDENTIALS VERIFIED
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Medical staff rosters, attending physicians, nursing shift schedules, licensing boards, and institutional directory.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>NPI & Medical License Verified</span>
        </div>
      </div>

      {currentRole === 'admin' && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-teal-700" />
              <h3 className="text-sm font-bold text-slate-900">Doctor Duty Rota Requests</h3>
            </div>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
              {pendingDutyRequests.length} pending
            </span>
          </div>
          {pendingDutyRequests.length === 0 ? (
            <p className="py-3 text-xs text-slate-500">No duty rota changes are waiting for approval.</p>
          ) : (
            <div className="space-y-3">
              {pendingDutyRequests.map((request) => (
                <article key={request.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0 text-xs">
                      <h4 className="font-bold text-slate-900">{request.doctorName}</h4>
                      <p className="mt-1 text-slate-600">
                        Current: {request.currentDays.join(', ')} · {request.currentHours}
                      </p>
                      <p className="mt-0.5 font-semibold text-teal-800">
                        Requested: {request.requestedDays.join(', ')} · {request.requestedHours}
                      </p>
                      <p className="mt-1 text-slate-700">Reason: {request.reason}</p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        Submitted by {request.requesterUserName} · {new Date(request.requestedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => reviewDoctorDutyChangeRequest(request.id, 'Rejected')}
                        className="flex items-center gap-1 rounded-md border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                      >
                        <X className="h-3.5 w-3.5" /> Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => reviewDoctorDutyChangeRequest(request.id, 'Approved')}
                        className="flex items-center gap-1 rounded-md bg-teal-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-800"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search staff name, department, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:ring-2 focus:ring-blue-500/20 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Staff' },
            { id: 'doctor', label: 'Physicians' },
            { id: 'nurse', label: 'Nursing Staff' },
            { id: 'admin', label: 'Administration' },
            { id: 'receptionist', label: 'Admissions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                roleFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((person) => (
          <div
            key={person.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                    {person.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{person.name}</h3>
                    <p className="text-[11px] text-slate-500 capitalize font-medium">
                      {person.role} · {person.department}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                  {person.id}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate text-[11px]">{person.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono text-[11px]">{person.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px]">Shift: {person.shift}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active On-Duty
              </span>
              <span className="text-slate-400 font-mono text-[10px]">
                NPI: 1948271048
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
