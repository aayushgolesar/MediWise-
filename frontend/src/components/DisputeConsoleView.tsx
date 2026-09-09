import React, { useEffect, useState } from 'react';
import { getDisputeCases, resolveDispute } from '../api/admin.js';
import type { DisputeCase } from '../types';
import { 
  Scale, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Camera, 
  Activity, 
  Lock, 
  Check,
  ChevronRight,
  Split
} from 'lucide-react';

export const DisputeConsoleView: React.FC = () => {
  const [caseData, setCaseData] = useState<DisputeCase | null>(null);
  const [adjudicationChoice, setAdjudicationChoice] = useState<'refund' | 'reject' | 'split' | 'escalate'>('refund');
  const [adjudicated, setAdjudicated] = useState<boolean>(false);
  const [activePhotoView, setActivePhotoView] = useState<'side_by_side' | 'claim' | 'baseline'>('side_by_side');

  useEffect(() => {
    void getDisputeCases().then((cases) => setCaseData(cases[0] ?? null));
  }, []);

  const handleExecuteAdjudication = (): void => {
    if (!caseData) return;
    const resolution = adjudicationChoice === 'refund' ? 'Refund Approved' : adjudicationChoice === 'reject' ? 'Dispute Rejected' : 'Hub Penalized';
    void resolveDispute(caseData.caseId, resolution).then(() => setAdjudicated(true));
  };

  if (!caseData) return <div className="max-w-7xl mx-auto px-4 py-8 text-sm text-slate-500">Loading dispute cases…</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
              DISPUTE TRIAGE FR-DISP-01
            </span>
            <span className="text-xs text-slate-400">Cryptographic Visual Proof &amp; Escrow Adjudication</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1 font-sans">
            Dispute &amp; Return Exception Triage Console
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Active Disputes: <strong className="text-rose-400">19 Cases</strong> &bull; Total Escrow Held: <strong className="text-emerald-400">₹24,800.00</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Active Case:</span>
          <span className="font-mono text-sm font-bold bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 text-slate-200">
            #{caseData.caseId}
          </span>
        </div>
      </div>

      {adjudicated ? (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg">
            <Check className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Escrow Adjudication Executed!
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Case #{caseData.caseId} resolved. Escrow amount of ₹{caseData.escrowAmount.toFixed(2)} was released according to decision: <strong className="uppercase">{adjudicationChoice}</strong>.
          </p>
          <button
            onClick={() => setAdjudicated(false)}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
          >
            Return to Case Triage
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Visual Proof Photographic Audit */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-slate-700" />
                <span>Photographic Evidence Comparison</span>
              </h3>
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setActivePhotoView('side_by_side')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    activePhotoView === 'side_by_side' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Side-by-Side
                </button>
              </div>
            </div>

            {/* Photographic comparison cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Doorstep Claim Photo */}
              <div className="border border-rose-200 rounded-xl p-3 bg-rose-50/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-800">1. Customer Claim (Doorstep)</span>
                  <span className="text-[10px] text-rose-600 font-mono">02:49 PM</span>
                </div>
                <div className="h-48 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 relative group">
                  <img
                    src={caseData.customerClaimPhotoUrl}
                    alt="Customer Doorstep Evidence"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 bg-rose-950/80 text-rose-200 text-[10px] px-2 py-0.5 rounded font-mono">
                    Seal: TORN / TAMPERED
                  </div>
                </div>
                <p className="text-[11px] text-slate-600">
                  Customer reported seal breach upon doorstep delivery handover prior to OTP entry.
                </p>
              </div>

              {/* Pharmacy Dispatch Baseline */}
              <div className="border border-emerald-200 rounded-xl p-3 bg-emerald-50/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-800">2. Dispatch Baseline (Hub KA-1204)</span>
                  <span className="text-[10px] text-emerald-600 font-mono">02:26 PM</span>
                </div>
                <div className="h-48 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 relative group">
                  <img
                    src={caseData.dispatchBaselinePhotoUrl}
                    alt="Pharmacy Dispatch Baseline"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 bg-emerald-950/80 text-emerald-200 text-[10px] px-2 py-0.5 rounded font-mono">
                    Seal: INTACT #HOLO-8849-21
                  </div>
                </div>
                <p className="text-[11px] text-slate-600">
                  Packaging station camera snapshot captured at moment of pharmacist register sign-off.
                </p>
              </div>
            </div>

            {/* Courier Telemetry Audit */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>Courier Telemetry &amp; Inertial Sensor Audit</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-slate-600 pt-1">
                <div>
                  <span className="text-slate-400 block">Doorstep Stop Duration:</span>
                  <span className="font-semibold text-slate-800">{caseData.courierGpsDuration}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Shock / Impact Spike:</span>
                  <span className="font-semibold text-rose-600">{caseData.courierShockSpike}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Case Details & Adjudication Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Case Details
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Escrow: ₹{caseData.escrowAmount.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="font-mono font-bold text-slate-900">#{caseData.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Complainant:</span>
                  <span className="font-semibold text-slate-800">{caseData.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dispute Classification:</span>
                  <span className="font-bold text-rose-700">{caseData.disputeType}</span>
                </div>
              </div>

              {/* Adjudication Radio Form */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  Select Clearinghouse Adjudication
                </label>

                <div className="space-y-2 text-xs">
                  <label className={`flex items-start gap-2.5 p-3 rounded-xl border transition cursor-pointer ${
                    adjudicationChoice === 'refund' ? 'border-emerald-500 bg-emerald-50/60' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="adjudication"
                      value="refund"
                      checked={adjudicationChoice === 'refund'}
                      onChange={() => setAdjudicationChoice('refund')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-bold text-slate-900">1. Full Escrow Refund to Patient</div>
                      <div className="text-[11px] text-slate-500">
                        Release ₹133.50 back to UPI source. Invalidate damaged batch at Hub.
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-start gap-2.5 p-3 rounded-xl border transition cursor-pointer ${
                    adjudicationChoice === 'split' ? 'border-emerald-500 bg-emerald-50/60' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="adjudication"
                      value="split"
                      checked={adjudicationChoice === 'split'}
                      onChange={() => setAdjudicationChoice('split')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-bold text-slate-900">2. Split Liability (Courier Impact)</div>
                      <div className="text-[11px] text-slate-500">
                        Refund patient; debit courier transit insurance due to shock sensor alert.
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-start gap-2.5 p-3 rounded-xl border transition cursor-pointer ${
                    adjudicationChoice === 'reject' ? 'border-emerald-500 bg-emerald-50/60' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="adjudication"
                      value="reject"
                      checked={adjudicationChoice === 'reject'}
                      onChange={() => setAdjudicationChoice('reject')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-bold text-slate-900">3. Reject Dispute</div>
                      <div className="text-[11px] text-slate-500">
                        Release funds to pharmacy hub. Log non-compliance report.
                      </div>
                    </div>
                  </label>
                </div>

                <button
                  onClick={handleExecuteAdjudication}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-md"
                >
                  Execute Adjudication Decision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
