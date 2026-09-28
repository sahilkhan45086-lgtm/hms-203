import React, { useState } from 'react';
import {
  DollarSign,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Building,
  Activity,
  Layers,
  Sparkles,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { initialHospitalPriceCatalog } from '../data/hospitalPriceCatalog';
import { HospitalPriceItem } from '../types';

export const HospitalPriceListView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDivision, setSelectedDivision] = useState<'all' | 'Inpatient Only' | 'Outpatient Only'>('all');

  const categories = [
    'all',
    'Consultation',
    'Diagnostic Lab',
    'Radiology & Imaging',
    'Ward & Nursing',
    'Surgical Procedure',
    'Emergency Care',
    'Medication',
  ];

  const filteredItems = initialHospitalPriceCatalog.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.cptCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    const matchesDivision =
      selectedDivision === 'all' ||
      item.applicableType === 'Both IPD & OPD' ||
      item.applicableType === selectedDivision;

    return matchesSearch && matchesCategory && matchesDivision;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Hospital Master Price List & Standard Fee Tariffs
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold uppercase">
              2026 TARIFF REVISION
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-3xl">
            Institutional fee schedule covering Inpatient (IPD), Outpatient (OPD), ICU per-diem beds, laboratory pathology, medical imaging, and major surgical operations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Tariffs</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search procedure code, title, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-semibold text-slate-500 shrink-0">Division:</span>
            {[
              { id: 'all' as const, label: 'All Divisions' },
              { id: 'Outpatient Only' as const, label: 'OPD Ambulatory' },
              { id: 'Inpatient Only' as const, label: 'IPD Inpatient' },
            ].map((div) => (
              <button
                key={div.id}
                onClick={() => setSelectedDivision(div.id)}
                className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition cursor-pointer ${
                  selectedDivision === div.id
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {div.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Price Schedule Items ({filteredItems.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Standard self-pay & pre-insurance list price
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/75 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="py-2.5 px-3">Service Code</th>
                <th className="py-2.5 px-3">CPT Code</th>
                <th className="py-2.5 px-3">Item / Procedure Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Applicable Division</th>
                <th className="py-2.5 px-3">Insurance Coverage</th>
                <th className="py-2.5 px-3 text-right">Standard Fee ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No tariff items found matching current search or filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-indigo-600 text-[11px]">
                      {item.code}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-700 text-[11px]">
                      {item.cptCode || '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{item.description}</div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                      <span className="text-[11px]">{item.category}</span>
                      <span className="block text-[10px] text-slate-400">{item.department}</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.applicableType === 'Both IPD & OPD'
                            ? 'bg-purple-100 text-purple-800'
                            : item.applicableType === 'Inpatient Only'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.applicableType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>~{item.insuranceCoveredApprox}% Covered</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-right font-mono font-bold text-slate-900 text-xs">
                      ${item.standardPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>CMS Hospital Price Transparency Compliant (45 CFR Part 180)</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            TOTAL CATALOGUED SERVICES: {initialHospitalPriceCatalog.length}
          </span>
        </div>
      </div>
    </div>
  );
};
