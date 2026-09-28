import React, { useState } from 'react';
import {
  Pill,
  Search,
  AlertTriangle,
  CheckCircle2,
  Plus,
  RefreshCw,
  PackageCheck,
  ShieldCheck,
  DollarSign,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { PharmacyItem } from '../types';

export const PharmacyInventory: React.FC = () => {
  const { pharmacy, dispenseMedication, restockMedication } = useHospital();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredItems = pharmacy.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === 'all' ||
      (filterCategory === 'low' ? item.stockQuantity <= item.minThreshold : item.category.toLowerCase() === filterCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const lowStockCount = pharmacy.filter((p) => p.stockQuantity <= p.minThreshold).length;

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Pill className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Hospital Pharmacy Formulary & Inventory Dispensary
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase">
              DEA SCHEDULE COMPLIANT
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Pharmaceutical stock monitoring, prescription dispensing verification, threshold alerts, and expiration auditing.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {lowStockCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>{lowStockCount} Meds Low Stock</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search brand, generic name, or NDC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Medications' },
            { id: 'low', label: 'Low Stock Alerts' },
            { id: 'Cardiovascular', label: 'Cardio' },
            { id: 'Antibiotic', label: 'Antibiotic' },
            { id: 'Analgesic', label: 'Analgesics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                filterCategory === tab.id
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Medications Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Formulary Stock Ledger ({filteredItems.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/75 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="py-2.5 px-3">Drug Code / NDC</th>
                <th className="py-2.5 px-3">Medication Name</th>
                <th className="py-2.5 px-3">Dosage & Form</th>
                <th className="py-2.5 px-3">Stock Level</th>
                <th className="py-2.5 px-3">Unit Price</th>
                <th className="py-2.5 px-3">Expiry</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No medications matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((med) => {
                  const isLow = med.stockQuantity <= med.minThreshold;
                  return (
                    <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-slate-700">
                        {med.code}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{med.name}</div>
                        <div className="text-[10px] text-slate-400 italic">{med.genericName}</div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                        {med.dosage} ({med.form})
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap font-mono">
                        <span
                          className={`font-bold ${
                            isLow ? 'text-rose-600 animate-pulse' : 'text-slate-800'
                          }`}
                        >
                          {med.stockQuantity} units
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Min: {med.minThreshold}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-slate-800">
                        ${(Number(med.unitPrice) || 0).toFixed(2)}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {med.expiryDate}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-right space-x-1.5">
                        <button
                          onClick={() => dispenseMedication(med.id, 1)}
                          disabled={med.stockQuantity <= 0}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded font-semibold text-[11px] disabled:opacity-40 cursor-pointer"
                        >
                          Dispense (-1)
                        </button>
                        <button
                          onClick={() => restockMedication(med.id, 50)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] cursor-pointer"
                        >
                          + Restock 50
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
