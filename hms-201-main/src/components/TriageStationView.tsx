import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Heart,
  Thermometer,
  Wind,
  Plus,
  Clock,
  CheckCircle2,
  PhoneCall,
  User,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { TriageAssessmentForm } from './TriageAssessmentForm';

interface TriageStationViewProps {
  onSelectPatient: (id: string) => void;
}

export const TriageStationView: React.FC<TriageStationViewProps> = ({ onSelectPatient }) => {
  const { patients, setActiveTab, updatePatientStatus, addNotification } = useHospital();
  const [selectedPatientForForm, setSelectedPatientForForm] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const patientsWithTriage = patients.filter((p) => p.latestTriage);

  const filteredPatients = patientsWithTriage.filter((p) => {
    if (filterLevel === 'all') return true;
    if (filterLevel === 'stat') {
      return (
        p.latestTriage?.urgencyLevel.includes('Level 1') ||
        p.latestTriage?.urgencyLevel.includes('Level 2')
      );
    }
    return p.latestTriage?.urgencyLevel.toLowerCase().includes(filterLevel.toLowerCase());
  });

  const level1Count = patients.filter((p) => p.latestTriage?.urgencyLevel.includes('Level 1')).length;
  const level2Count = patients.filter((p) => p.latestTriage?.urgencyLevel.includes('Level 2')).length;
  const emergencyCount = patients.filter((p) => p.status === 'Emergency').length;

  const handleEscalateToER = (patientId: string, patientName: string) => {
    updatePatientStatus(patientId, 'Emergency');
    addNotification(
      `STAT ER Escalation: ${patientName}`,
      `${patientName} escalated to ER Trauma Bay. Immediate MD bedside attendance dispatched.`,
      'critical',
      patientId
    );
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Triage Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Emergency Intake & Nurse Triage Desk
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold uppercase">
              ESI PROTOCOL ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Real-time physiological stratification, continuous vitals telemetry tracking, and immediate clinical disposition.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700 font-mono text-xs">
            <span className="text-slate-400">STAT Acuity:</span>
            <span className="text-rose-400 font-bold">{level1Count + level2Count} Critical</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-bold">{emergencyCount} in ER</span>
          </div>
          <button
            onClick={() => setSelectedPatientForForm(patients[0]?.id || '')}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Assessment</span>
          </button>
        </div>
      </div>

      {selectedPatientForForm && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xl p-5 mb-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-sm text-slate-800">Record Triage Assessment</h3>
            </div>
            <button
              onClick={() => setSelectedPatientForForm(null)}
              className="text-xs text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
            >
              Close Form ✕
            </button>
          </div>
          <TriageAssessmentForm
            initialPatientId={selectedPatientForForm}
            onAssessmentCompleted={() => setSelectedPatientForForm(null)}
            onCancel={() => setSelectedPatientForForm(null)}
          />
        </div>
      )}

      {/* Main Triage Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Active Triage Queue ({filteredPatients.length})
            </h3>
          </div>

          <div className="flex items-center gap-1">
            {[
              { id: 'all', label: 'All Assessed' },
              { id: 'stat', label: 'Level 1 & 2 STAT' },
              { id: 'urgent', label: 'Urgent' },
              { id: 'non-urgent', label: 'Ambulatory' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterLevel(tab.id)}
                className={`px-2.5 py-1 text-[11px] rounded font-medium transition cursor-pointer ${
                  filterLevel === tab.id
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/75 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="py-2.5 px-3">Acuity Tier</th>
                <th className="py-2.5 px-3">Patient</th>
                <th className="py-2.5 px-3">Vitals Telemetry</th>
                <th className="py-2.5 px-3">NEWS2</th>
                <th className="py-2.5 px-3">Zone & Disposition</th>
                <th className="py-2.5 px-3">Assessed By</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No patients matching the selected triage filter. Click "+ New Assessment" to log intake.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  const t = p.latestTriage!;
                  const isCritical = t.urgencyLevel.includes('Level 1') || t.urgencyLevel.includes('Level 2');
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCritical ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.urgencyLevel.includes('Level 1')
                              ? 'bg-rose-600 text-white animate-pulse'
                              : t.urgencyLevel.includes('Level 2')
                              ? 'bg-rose-100 text-rose-800'
                              : t.urgencyLevel.includes('Level 3')
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {t.urgencyLevel.split(' - ')[0]}
                        </span>
                        <span className="block text-[9px] text-slate-400 font-mono mt-0.5">
                          {t.timestamp.split('T')[1]?.slice(0, 5) || 'Recent'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <button
                          onClick={() => {
                            onSelectPatient(p.id);
                            setActiveTab('patients');
                          }}
                          className="text-left group cursor-pointer"
                        >
                          <span className="font-semibold text-slate-900 group-hover:text-blue-600 block">
                            {p.firstName} {p.lastName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {p.id} · {p.age}y {p.gender} · {p.bloodGroup}
                          </span>
                        </button>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
                        <div className="text-slate-800">
                          BP: <span className="font-bold">{t.bloodPressure}</span> · HR: <span className="font-bold">{t.heartRate}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          SpO2: {t.oxygenSaturation}% · RR: {t.respiratoryRate} · Temp: {t.temperatureF}°F
                        </div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                            t.newsScore >= 7
                              ? 'bg-rose-100 text-rose-700'
                              : t.newsScore >= 5
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {t.newsScore} pts
                        </span>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{t.assignedZone}</div>
                        <div className="text-[10px] text-slate-500">{t.disposition}</div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                        <div>{t.assessedBy}</div>
                        <div className="text-[10px] text-slate-400">{t.assessorRole}</div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-right space-x-1.5">
                        {p.status !== 'Emergency' && (
                          <button
                            onClick={() => handleEscalateToER(p.id, `${p.firstName} ${p.lastName}`)}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded text-[10px] cursor-pointer"
                            title="Escalate to Emergency Care"
                          >
                            Escalate ER
                          </button>
                        )}
                        <button
                          onClick={() => {
                            onSelectPatient(p.id);
                            setActiveTab('patients');
                          }}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded text-[10px] cursor-pointer"
                        >
                          View EMR
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
