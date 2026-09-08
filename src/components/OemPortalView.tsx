import React, { useState } from 'react';
import { 
  Factory, 
  ShieldAlert, 
  CheckCircle2, 
  TrendingUp, 
  QrCode, 
  Lock, 
  AlertOctagon, 
  Building2,
  RefreshCw,
  FileCheck
} from 'lucide-react';

export const OemPortalView: React.FC = () => {
  const [recalledBatch, setRecalledBatch] = useState<boolean>(false);
  const [targetBatch, setTargetBatch] = useState<string>('MP-8849-B');

  const handleTriggerRecall = () => {
    setRecalledBatch(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-500/40">
              OEM ENTERPRISE PORTAL
            </span>
            <span className="text-xs text-slate-400">Direct Ex-Works Pricing &amp; Batch Traceability</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1 font-sans">
            Cipla Pharmaceuticals Ltd. &bull; Manufacturer Portal
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time track-and-trace, anti-counterfeit hash verification, and rapid micro-dispensary recall controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>CDSCO Form 28 Approved</span>
          </span>
        </div>
      </div>

      {/* OEM Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Master Formulations</div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">1,420 SKUs</div>
          <div className="text-[11px] text-slate-500 mt-1">Across 12 therapy areas</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Certified Batches</div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">8,940 Active</div>
          <div className="text-[11px] text-emerald-700 mt-1">100% Cryptographic Hash</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Ex-Works Wholesale</div>
          <div className="text-2xl font-black text-blue-600 mt-2 font-mono">₹18.42 Cr</div>
          <div className="text-[11px] text-slate-500 mt-1">Direct to 142 micro-hubs</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Price Parity Index</div>
          <div className="text-2xl font-black text-emerald-600 mt-2 font-mono">99.4%</div>
          <div className="text-[11px] text-slate-500 mt-1">Minimal regional drift</div>
        </div>
      </div>

      {/* Rapid Serialization Freeze & Dispensary Recall Console */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Rapid Serialization Freeze &amp; Dispensary Recall Console
            </h3>
          </div>
          <span className="text-xs text-slate-400">Statutory CDSCO Schedule M Protocol</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Instantly suppress any manufactured batch across all 142 connected dispensary hubs. Blocks POS checkouts and locks shelf inventory within &lt;1.2 seconds of publication.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
          <div className="grow max-w-sm">
            <input
              type="text"
              value={targetBatch}
              onChange={(e) => setTargetBatch(e.target.value)}
              placeholder="Enter batch number (e.g. MP-8849-B)"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleTriggerRecall}
            disabled={recalledBatch}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-md shadow-rose-600/30"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{recalledBatch ? 'Batch Frozen Across All 142 Hubs' : 'Broadcast Rapid Recall Order'}</span>
          </button>
        </div>

        {recalledBatch && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span>
                <strong>Recall In Effect:</strong> Batch <strong>{targetBatch}</strong> locked in 142 tenant schemas. Suppressed from consumer marketplace.
              </span>
            </div>
            <button
              onClick={() => setRecalledBatch(false)}
              className="text-xs font-bold underline hover:text-white cursor-pointer"
            >
              Reset Simulation
            </button>
          </div>
        )}
      </div>

      {/* Canonical Formulations Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-600" />
            <span>Cipla Canonical Formulations &amp; Direct Pricing Matrix</span>
          </h3>
          <span className="text-xs text-slate-500">Ex-Works Benchmark</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Brand Generic Formulation</th>
                <th className="py-3 px-4">Active Salt Composition</th>
                <th className="py-3 px-4">Ex-Works Cost</th>
                <th className="py-3 px-4">Recommended Retail</th>
                <th className="py-3 px-4">Brand Parity Saving</th>
                <th className="py-3 px-4 text-right">CDSCO Registration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition">
                <td className="py-3.5 px-4 font-bold text-slate-900">Atorvastatin Calcium Tablets 20mg</td>
                <td className="py-3.5 px-4 text-slate-600">Atorvastatin IP 20mg</td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">₹82.00 / 30s</td>
                <td className="py-3.5 px-4 font-mono text-emerald-700 font-bold">₹112.50 / 30s</td>
                <td className="py-3.5 px-4 font-bold text-emerald-600">54% vs Lipitor</td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 text-right">MFG-MH-102941</td>
              </tr>
              <tr className="hover:bg-slate-50 transition">
                <td className="py-3.5 px-4 font-bold text-slate-900">Pantoprazole Gastro-Resistant 40mg</td>
                <td className="py-3.5 px-4 text-slate-600">Pantoprazole Sodium 40mg</td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">₹32.00 / 15s</td>
                <td className="py-3.5 px-4 font-mono text-emerald-700 font-bold">₹48.00 / 15s</td>
                <td className="py-3.5 px-4 font-bold text-emerald-600">62% vs Pantocid</td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 text-right">MFG-MH-102988</td>
              </tr>
              <tr className="hover:bg-slate-50 transition">
                <td className="py-3.5 px-4 font-bold text-slate-900">Metformin HCl Sustained Release 500mg</td>
                <td className="py-3.5 px-4 text-slate-600">Metformin HCl 500mg SR</td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">₹11.50 / 20s</td>
                <td className="py-3.5 px-4 font-mono text-emerald-700 font-bold">₹18.00 / 20s</td>
                <td className="py-3.5 px-4 font-bold text-emerald-600">45% vs Glycomet</td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 text-right">MFG-MH-103112</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
