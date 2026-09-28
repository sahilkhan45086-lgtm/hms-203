import React, { useState } from 'react';
import {
  BedDouble,
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
  Plus,
  ArrowRight,
  ShieldCheck,
  Activity,
  HeartPulse,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { WardBed } from '../types';

interface WardOccupancyViewProps {
  onSelectPatient: (id: string) => void;
}

export const WardOccupancyView: React.FC<WardOccupancyViewProps> = ({ onSelectPatient }) => {
  const { wardBeds, updateBedStatus, setActiveTab } = useHospital();
  const [selectedWard, setSelectedWard] = useState<string>('all');

  const wards = [
    'all',
    'Intensive Care Unit (ICU)',
    'Cardiology Stepdown',
    'Surgical Post-Op',
    'General Medical Ward',
    'Emergency Observation',
  ];

  const filteredBeds = wardBeds.filter(
    (b) => selectedWard === 'all' || b.wardName === selectedWard
  );

  const totalBeds = wardBeds.length;
  const occupiedBeds = wardBeds.filter((b) => b.status === 'Occupied').length;
  const availableBeds = wardBeds.filter((b) => b.status === 'Available').length;
  const maintenanceBeds = wardBeds.filter((b) => b.status === 'Maintenance').length;

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <BedDouble className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Hospital Ward Bed Management & Room Census
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold uppercase">
              IPD CENSUS
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Real-time ICU and ward bed telemetry, patient bed turnover tracking, sanitization status, and clinical nursing assignments.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono">
            <span className="text-emerald-700 font-bold">{availableBeds} Ready</span>
            <span className="text-slate-300">|</span>
            <span className="text-rose-700 font-bold">{occupiedBeds} Occupied</span>
            <span className="text-slate-300">|</span>
            <span className="text-amber-700 font-bold">{maintenanceBeds} Sanitize</span>
          </div>
        </div>
      </div>

      {/* Ward Filter Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">Filter Ward:</span>
        {wards.map((w) => (
          <button
            key={w}
            onClick={() => setSelectedWard(w)}
            className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition cursor-pointer ${
              selectedWard === w
                ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {w === 'all' ? 'All Wards' : w}
          </button>
        ))}
      </div>

      {/* Bed Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBeds.map((bed) => {
          const isOccupied = bed.status === 'Occupied';
          return (
            <div
              key={bed.id}
              className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                isOccupied
                  ? 'bg-white border-slate-200 shadow-sm'
                  : bed.status === 'Maintenance'
                  ? 'bg-amber-50/40 border-amber-200 shadow-2xs'
                  : 'bg-emerald-50/30 border-emerald-200 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <BedDouble className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{bed.bedNumber}</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isOccupied
                        ? 'bg-rose-100 text-rose-800'
                        : bed.status === 'Maintenance'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {bed.status}
                  </span>
                </div>

                <div className="text-[11px] font-semibold text-slate-700 mb-1">
                  {bed.wardName} · Room {bed.roomNumber}
                </div>

                {isOccupied && bed.patientName ? (
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                      <span>{bed.patientName}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-normal">
                        {bed.patientId}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Admitted: {bed.admissionDate}
                    </div>
                    {bed.patientId && (
                      <button
                        onClick={() => {
                          onSelectPatient(bed.patientId!);
                          setActiveTab('patients');
                        }}
                        className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                      >
                        <span>Inspect EMR Chart</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 p-3 rounded-lg border border-dashed border-slate-300 text-center text-xs text-slate-400">
                    {bed.status === 'Maintenance' ? 'Under sterilization protocol' : 'Bed sanitized & available for intake'}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {isOccupied ? (
                  <button
                    onClick={() => updateBedStatus(bed.id, 'Maintenance')}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] transition cursor-pointer"
                  >
                    Discharge & Mark Sanitizing
                  </button>
                ) : bed.status === 'Maintenance' ? (
                  <button
                    onClick={() => updateBedStatus(bed.id, 'Available')}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold text-[11px] transition cursor-pointer"
                  >
                    Verify Ready & Available
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Admission
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
