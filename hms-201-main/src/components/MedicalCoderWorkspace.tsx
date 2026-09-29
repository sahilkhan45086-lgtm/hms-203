import React, { useState } from 'react';
import { CheckCircle2, FileCheck2, FileText, ShieldCheck, XCircle } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { InsuranceApproval, LabResult } from '../types';

const today = () => new Date().toISOString().slice(0, 10);

const approvalStatusClasses: Record<InsuranceApproval['approvalStatus'], string> = {
  Approved: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  Pending: 'border-amber-200 bg-amber-50 text-amber-800',
  'Query Raised': 'border-orange-200 bg-orange-50 text-orange-800',
  Rejected: 'border-rose-200 bg-rose-50 text-rose-800',
};

export const MedicalCoderWorkspace: React.FC = () => {
  const {
    patients,
    insuranceApprovals,
    updateInsuranceApprovalStatus,
    publishInsuranceApproval,
    addLabResult,
    logAuditEvent,
    currentUser,
    currentRole,
  } = useHospital();
  const canManageApprovals = currentRole === 'medical-coder';
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [approvalId, setApprovalId] = useState('');
  const [testName, setTestName] = useState('');
  const [category, setCategory] = useState<LabResult['category']>('Biochemistry');
  const [value, setValue] = useState('');
  const [referenceRange, setReferenceRange] = useState('');
  const [findings, setFindings] = useState('');
  const [impression, setImpression] = useState('');
  const [status, setStatus] = useState<Exclude<LabResult['status'], 'Pending'>>('Normal');
  const [message, setMessage] = useState('');
  const [approvalToPublish, setApprovalToPublish] = useState<InsuranceApproval | null>(null);
  const [publishedApprovalNumber, setPublishedApprovalNumber] = useState('');
  const [publishedAmount, setPublishedAmount] = useState('');
  const [publishedCopay, setPublishedCopay] = useState('');
  const [publishedValidUntil, setPublishedValidUntil] = useState('');

  const patient = patients.find((item) => item.id === patientId);
  const eligibleApprovals = insuranceApprovals.filter(
    (approval) =>
      approval.patientId === patientId &&
      approval.approvalStatus === 'Approved' &&
      approval.validUntil >= today()
  );
  const selectedApproval = eligibleApprovals.find((approval) => approval.id === approvalId);

  const reviewApproval = (approval: InsuranceApproval, decision: Exclude<InsuranceApproval['approvalStatus'], 'Approved'>) => {
    const reviewNote = `Reviewed by ${currentUser.name} on ${today()}: ${decision}.`;
    updateInsuranceApprovalStatus(approval.id, decision, reviewNote);
    logAuditEvent('UPDATE', 'Billing Invoice', approval.id, `Medical coder ${decision.toLowerCase()} insurance approval ${approval.approvalNumber}.`);
  };

  const openPublishApproval = (approval: InsuranceApproval) => {
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);
    setApprovalToPublish(approval);
    setPublishedApprovalNumber('');
    setPublishedAmount(approval.estimatedCost ? String(approval.estimatedCost) : '');
    setPublishedCopay('0');
    setPublishedValidUntil(validUntil.toISOString().slice(0, 10));
  };

  const handlePublishApproval = (event: React.FormEvent) => {
    event.preventDefault();
    if (!approvalToPublish || !publishedApprovalNumber.trim()) return;
    const amount = Number(publishedAmount);
    const copay = Number(publishedCopay);
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(copay) || copay < 0 || copay > 100 || !publishedValidUntil) return;
    publishInsuranceApproval(approvalToPublish.id, {
      approvalNumber: publishedApprovalNumber.trim(),
      approvedAmount: amount,
      copayPercentage: copay,
      validUntil: publishedValidUntil,
    });
    setMessage(`Authorization ${publishedApprovalNumber.trim()} published for billing.`);
    setApprovalToPublish(null);
  };

  const publishReport = (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    if (!patient || !selectedApproval || selectedApproval.validUntil < today()) {
      setMessage('Choose a patient and a currently valid approved insurance authorization before publishing.');
      return;
    }
    if (!testName.trim() || !value.trim() || !findings.trim()) {
      setMessage('Enter the report name, result, and findings before publishing.');
      return;
    }

    const date = today();
    addLabResult(patient.id, {
      testName: testName.trim(),
      category,
      orderedDate: selectedApproval.approvalDate,
      resultDate: date,
      status,
      value: value.trim(),
      referenceRange: referenceRange.trim() || 'Not specified',
      orderedBy: selectedApproval.doctorName,
      department: category === 'Radiology' ? 'Radiology & Imaging' : 'Laboratory',
      cptCode: selectedApproval.serviceCode,
      findings: findings.trim(),
      impression: impression.trim() || undefined,
      sentToPatient: true,
      sentToDoctor: true,
      sentDate: date,
      insuranceApprovalId: selectedApproval.id,
      publishedBy: currentUser.name,
      notes: `Published against insurance approval ${selectedApproval.approvalNumber}.`,
    });
    logAuditEvent('CREATE', 'Lab Result', patient.id, `Medical coder ${currentUser.name} published ${testName.trim()} under insurance approval ${selectedApproval.approvalNumber}.`);
    setMessage(`Report published to ${patient.firstName} ${patient.lastName}'s patient profile.`);
    setTestName('');
    setValue('');
    setReferenceRange('');
    setFindings('');
    setImpression('');
    setApprovalId('');
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 lg:p-6">
      <header className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <FileCheck2 className="h-4 w-4" />
            </span>
            <h1 className="text-base font-bold text-slate-900">Medical Coder Desk</h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">Review insurance authorization and publish completed reports to patient files.</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" /> Patient-linked publication
        </span>
      </header>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <ShieldCheck className="h-4 w-4 text-teal-700" />
          <h2 className="text-sm font-bold text-slate-900">Insurance authorization review</h2>
          <span className="ml-auto text-xs text-slate-500">{insuranceApprovals.length} records</span>
        </div>
        {insuranceApprovals.length === 0 ? (
          <p className="p-5 text-xs text-slate-500">No insurance authorizations are available to review.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-xs">
              <thead className="bg-white text-[10px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2.5">Patient</th>
                  <th className="px-4 py-2.5">Insurer / approval</th>
                  <th className="px-4 py-2.5">Authorized service</th>
                  <th className="px-4 py-2.5">Valid until</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {insuranceApprovals.map((approval) => {
                  const expired = Boolean(approval.validUntil) && approval.validUntil < today();
                  const canReview = approval.approvalStatus === 'Pending' || approval.approvalStatus === 'Query Raised';
                  return (
                    <tr key={approval.id} className="align-top">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{approval.patientName}</p>
                        <p className="font-mono text-[10px] text-slate-500">{approval.patientMrn}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">{approval.insuranceProvider}</p>
                        <p className="text-[10px] text-slate-500">Policy: {approval.policyNumber || 'Not recorded'}</p>
                        <p className="font-mono text-[10px] text-slate-500">{approval.approvalNumber}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <p>{approval.serviceName}</p>
                        <p className="mt-0.5 text-[10px] text-slate-500">Requested: ${approval.estimatedCost.toFixed(2)}</p>
                      </td>
                      <td className={`whitespace-nowrap px-4 py-3 ${expired ? 'font-semibold text-rose-700' : 'text-slate-600'}`}>
                        {approval.validUntil || 'Not yet issued'}{expired ? ' · Expired' : ''}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`whitespace-nowrap rounded border px-2 py-0.5 text-[10px] font-bold ${approvalStatusClasses[approval.approvalStatus]}`}>
                          {approval.approvalStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {canReview && canManageApprovals ? (
                          <div className="flex flex-wrap gap-1.5">
                            <button type="button" onClick={() => openPublishApproval(approval)} className="inline-flex items-center gap-1 rounded border border-emerald-200 px-2 py-1 font-semibold text-emerald-800 hover:bg-emerald-50">
                              <CheckCircle2 className="h-3 w-3" /> Publish
                            </button>
                            {approval.approvalStatus === 'Pending' && (
                              <button type="button" onClick={() => reviewApproval(approval, 'Query Raised')} className="rounded border border-amber-200 px-2 py-1 font-semibold text-amber-800 hover:bg-amber-50">
                                Query
                              </button>
                            )}
                            <button type="button" onClick={() => reviewApproval(approval, 'Rejected')} className="inline-flex items-center gap-1 rounded border border-rose-200 px-2 py-1 font-semibold text-rose-800 hover:bg-rose-50">
                              <XCircle className="h-3 w-3" /> Reject
                            </button>
                          </div>
                        ) : <span className="text-[10px] text-slate-500">{approval.remarks || 'Reviewed'}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {canManageApprovals && approvalToPublish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <form onSubmit={handlePublishApproval} className="w-full max-w-lg space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div>
              <h2 className="text-base font-bold text-slate-900">Publish insurer approval</h2>
              <p className="mt-1 text-xs text-slate-600">{approvalToPublish.patientName} · {approvalToPublish.serviceName}</p>
            </div>
            <label className="block text-xs font-semibold text-slate-700">
              Insurer approval number
              <input required value={publishedApprovalNumber} onChange={(event) => setPublishedApprovalNumber(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" autoFocus />
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="text-xs font-semibold text-slate-700">
                Approved amount ($)
                <input required type="number" min="0.01" step="0.01" value={publishedAmount} onChange={(event) => setPublishedAmount(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Copay (%)
                <input required type="number" min="0" max="100" step="0.01" value={publishedCopay} onChange={(event) => setPublishedCopay(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Valid until
                <input required type="date" min={today()} value={publishedValidUntil} onChange={(event) => setPublishedValidUntil(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setApprovalToPublish(null)} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="inline-flex items-center gap-1.5 rounded-md bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" /> Approve & publish
              </button>
            </div>
          </form>
        </div>
      )}

      {canManageApprovals && <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <FileText className="h-4 w-4 text-teal-700" />
          <h2 className="text-sm font-bold text-slate-900">Publish report to patient file</h2>
        </div>
        <form onSubmit={publishReport} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs font-semibold text-slate-700">
            Patient
            <select required value={patientId} onChange={(event) => { setPatientId(event.target.value); setApprovalId(''); }} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal">
              <option value="">Select patient</option>
              {patients.map((item) => <option key={item.id} value={item.id}>{item.firstName} {item.lastName} · {item.id}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Valid approved authorization
            <select required value={approvalId} onChange={(event) => setApprovalId(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal" disabled={!patient || eligibleApprovals.length === 0}>
              <option value="">{eligibleApprovals.length ? 'Select authorization' : 'No valid approval for patient'}</option>
              {eligibleApprovals.map((approval) => <option key={approval.id} value={approval.id}>{approval.approvalNumber} · {approval.serviceName}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Report name
            <input required value={testName} onChange={(event) => setTestName(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" placeholder="e.g. Complete blood count" />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Report category
            <select value={category} onChange={(event) => setCategory(event.target.value as LabResult['category'])} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal">
              {(['Hematology', 'Biochemistry', 'Pathology', 'Radiology', 'Cardiology'] as const).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Result / value
            <input required value={value} onChange={(event) => setValue(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Reference range
            <input value={referenceRange} onChange={(event) => setReferenceRange(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" placeholder="Optional" />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Result status
            <select value={status} onChange={(event) => setStatus(event.target.value as Exclude<LabResult['status'], 'Pending'>)} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal">
              {(['Normal', 'Elevated', 'Critical'] as const).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-700 sm:col-span-2 lg:col-span-3">
            Findings
            <textarea required value={findings} onChange={(event) => setFindings(event.target.value)} rows={3} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" />
          </label>
          <label className="text-xs font-semibold text-slate-700 sm:col-span-2 lg:col-span-3">
            Impression
            <textarea value={impression} onChange={(event) => setImpression(event.target.value)} rows={2} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" placeholder="Optional" />
          </label>
          {message && <p role="status" className="text-xs font-semibold text-teal-800 sm:col-span-2 lg:col-span-3">{message}</p>}
          <div className="flex justify-end sm:col-span-2 lg:col-span-3">
            <button type="submit" disabled={!patient || !selectedApproval} className="inline-flex items-center gap-2 rounded-md bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300">
              <FileCheck2 className="h-4 w-4" /> Publish to patient profile
            </button>
          </div>
        </form>
      </section>}
    </div>
  );
};
