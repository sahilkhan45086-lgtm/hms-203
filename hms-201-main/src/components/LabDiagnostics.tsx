import React, { useMemo, useState } from 'react';
import { FileText, FlaskConical, Printer, Search, ShieldCheck } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { LabResult } from '../types';

type ReportCategory = 'laboratory' | 'radiology' | 'mammography' | 'pft' | 'ecg' | 'echo' | 'other';
type SearchScope = 'all' | 'patient' | ReportCategory;

const REPORT_CATEGORIES: Array<{ id: 'all' | ReportCategory; label: string }> = [
  { id: 'all', label: 'All Reports' },
  { id: 'laboratory', label: 'Lab Reports' },
  { id: 'radiology', label: 'Radiology' },
  { id: 'mammography', label: 'Mammography' },
  { id: 'pft', label: 'PFT' },
  { id: 'ecg', label: 'ECG' },
  { id: 'echo', label: 'Echo' },
  { id: 'other', label: 'Other' },
];

const getReportCategory = (report: LabResult): ReportCategory => {
  const details = `${report.testName} ${report.department || ''} ${report.category} ${report.modality || ''}`.toLowerCase();
  if (/mammograph|mammogram|breast imaging/.test(details)) return 'mammography';
  if (/pulmonary function|\bpft\b|spirometry|spiromet/.test(details)) return 'pft';
  if (/\becg\b|electrocardio/.test(details)) return 'ecg';
  if (/echocardiogram|\becho\b|cardiac ultrasound/.test(details)) return 'echo';
  if (report.category === 'Radiology' || /radiology|imaging/.test(details) || Boolean(report.modality)) {
    return 'radiology';
  }
  if (
    report.department === 'Laboratory' ||
    ['Hematology', 'Biochemistry', 'Pathology'].includes(report.category)
  ) {
    return 'laboratory';
  }
  return 'other';
};

const statusClasses: Record<LabResult['status'], string> = {
  Pending: 'bg-amber-50 text-amber-800 border-amber-200',
  Normal: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Elevated: 'bg-orange-50 text-orange-800 border-orange-200',
  Critical: 'bg-rose-50 text-rose-800 border-rose-200',
};

export const LabDiagnostics: React.FC = () => {
  const { patients } = useHospital();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | ReportCategory>('all');
  const [searchScope, setSearchScope] = useState<SearchScope>('all');

  const reports = useMemo(
    () =>
      patients
        .flatMap((patient) =>
          (patient.labResults || []).map((report) => ({
            patientId: patient.id,
            patientName: `${patient.firstName} ${patient.lastName}`,
            report,
            category: getReportCategory(report),
          }))
        )
        .sort((a, b) =>
          (b.report.resultDate || b.report.orderedDate).localeCompare(a.report.resultDate || a.report.orderedDate)
        ),
    [patients]
  );

  const categoryCounts = useMemo(
    () => Object.fromEntries(REPORT_CATEGORIES.map(({ id }) => [
      id,
      id === 'all' ? reports.length : reports.filter((item) => item.category === id).length,
    ])) as Record<'all' | ReportCategory, number>,
    [reports]
  );

  const filteredReports = reports.filter(({ report, patientName, patientId, category }) => {
    const matchesCategory = activeCategory === 'all' || category === activeCategory;
    const matchesScope =
      searchScope === 'all' || searchScope === 'patient' || category === searchScope;
    const query = searchQuery.trim().toLowerCase();
    const searchableFields = searchScope === 'patient'
      ? [patientName, patientId]
      : [
          patientName,
          patientId,
          report.testName,
          report.orderedBy,
          report.modality || '',
          report.findings || '',
          report.impression || '',
          report.value,
        ];
    const matchesSearch = !query || searchableFields.some((value) => value.toLowerCase().includes(query));
    return matchesCategory && matchesScope && matchesSearch;
  });

  const handlePrint = () => window.print();

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 lg:p-6">
      <header className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <FileText className="h-4 w-4" />
            </span>
            <h1 className="text-base font-bold text-slate-900">Diagnostic Reports</h1>
            <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
              {reports.length} reports
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Patient-linked laboratory, imaging, and specialty diagnostic results.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Verified patient records</span>
          <button onClick={handlePrint} className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100">
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
        </div>
      </header>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Diagnostic report categories">
            {REPORT_CATEGORIES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeCategory === id}
                onClick={() => {
                  setActiveCategory(id);
                  setSearchScope('all');
                }}
                className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                  activeCategory === id
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                {label} <span className={activeCategory === id ? 'text-teal-100' : 'text-slate-400'}>{categoryCounts[id]}</span>
              </button>
            ))}
          </div>
          <div className="flex w-full shrink-0 gap-2 sm:w-auto">
            <select
              aria-label="Search report scope"
              value={searchScope}
              onChange={(event) => {
                const scope = event.target.value as SearchScope;
                setSearchScope(scope);
                if (scope !== 'all' && scope !== 'patient') setActiveCategory('all');
              }}
              className="min-w-32 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100"
            >
              <option value="all">All fields</option>
              <option value="patient">Patient</option>
              {REPORT_CATEGORIES.filter(({ id }) => id !== 'all').map(({ id, label }) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
            <label className="relative block min-w-0 flex-1 sm:w-56 sm:flex-none">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={searchScope === 'patient' ? 'Name or MRN' : 'Search reports'}
                className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </label>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <FlaskConical className="mx-auto h-8 w-8 text-slate-300" />
            <h2 className="mt-3 text-sm font-semibold text-slate-800">
              {reports.length === 0 ? 'No diagnostic reports recorded' : 'No reports in this category'}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {searchQuery ? 'Try another patient name, report name, or finding.' : 'Completed and pending patient reports will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="bg-slate-100/80 text-[10px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2.5">Patient</th>
                  <th className="px-3 py-2.5">Report</th>
                  <th className="px-3 py-2.5">Department / Modality</th>
                  <th className="px-3 py-2.5">Ordered / Result</th>
                  <th className="px-3 py-2.5">Ordering clinician</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Findings / Impression</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map(({ patientId, patientName, report, category }) => (
                  <tr key={`${patientId}-${report.id}`} className="align-top hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-3 py-3">
                      <p className="font-semibold text-slate-900">{patientName}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-slate-500">{patientId}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-900">{report.testName}</p>
                      {report.cptCode && <p className="mt-0.5 font-mono text-[10px] text-slate-500">{report.cptCode}</p>}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      <p>{report.department || report.category}</p>
                      {report.modality && <p className="mt-0.5 text-[10px] text-slate-500">{report.modality}</p>}
                      <p className="mt-0.5 text-[10px] font-semibold text-teal-800">
                        {REPORT_CATEGORIES.find((item) => item.id === category)?.label}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                      <p>Ordered: {report.orderedDate}</p>
                      <p className="mt-0.5">Result: {report.resultDate || 'Pending'}</p>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{report.orderedBy}</td>
                    <td className="px-3 py-3">
                      <span className={`whitespace-nowrap rounded border px-2 py-0.5 text-[10px] font-bold ${statusClasses[report.status]}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="max-w-xs px-3 py-3 text-slate-700">
                      <p>{report.findings || report.value}</p>
                      {report.impression && <p className="mt-1 text-[11px] text-slate-500">{report.impression}</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};