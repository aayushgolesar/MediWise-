import React, { useEffect, useState } from 'react';
import { getQuarantineItems, updateQuarantineItem } from '../api/admin.js';
import { QuarantineItem } from '../types';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Filter, 
  RefreshCw, 
  TrendingDown, 
  Building2,
  XCircle,
  ExternalLink
} from 'lucide-react';

export const QuarantineConsoleView: React.FC = () => {
  const [items, setItems] = useState<QuarantineItem[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'quarantined' | 'scorecard'>('quarantined');

  useEffect(() => {
    void getQuarantineItems().then(setItems).catch(() => setItems([]));
  }, []);

  const filteredItems = items.filter(item => {
    if (selectedSeverity === 'All') return true;
    return item.severity === selectedSeverity;
  });

  const handleRelease = (id: string): void => {
    void updateQuarantineItem(id, 'release').then(({ status }) => {
      setItems(previous => previous.map(item => item.id === id ? { ...item, status: status as QuarantineItem['status'] } : item));
    });
  };

  const handleForceQuarantine = (id: string): void => {
    void updateQuarantineItem(id, 'escalate').then(({ status }) => {
      setItems(previous => previous.map(item => item.id === id ? { ...item, status: status as QuarantineItem['status'] } : item));
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
              CLEARINGHOUSE GOVERNANCE
            </span>
            <span className="text-xs text-slate-400">POS Integration &amp; Price Drift Shield</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1 font-sans">
            Operations &amp; Stale-Offer Quarantine Console
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated micro-fulfillment compliance engine protecting patients from ghost stock, price gouging, and expired batch listings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => alert("Manual POS sweep triggered across all 142 partner hubs...")}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span>Force Ingestion Sweep</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Offer Freshness</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">96.8%</div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
            <span>&uarr; 0.4% from last 1h</span> &bull; <span>Target &gt;95%</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Quarantined SKUs</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2 font-mono">14</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Suppressed from consumer search
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>SLA Breaches</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2 font-mono">3</div>
          <div className="text-[11px] text-rose-700 mt-1">
            &gt;15 min delay on acceptance
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Auto Suppressions</span>
            <AlertTriangle className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">42</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Heartbeat &gt; 30m stale cutoff
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Filter Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Filter Severity:</span>
            {['All', 'Critical', 'High', 'Medium'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedSeverity === sev
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500">
            Showing {filteredItems.length} of {items.length} recorded anomalies
          </div>
        </div>

        {/* Quarantine Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">SKU &amp; Generic</th>
                <th className="py-3 px-4">Pharmacy Hub</th>
                <th className="py-3 px-4">Reported vs Floor</th>
                <th className="py-3 px-4">Discrepancy</th>
                <th className="py-3 px-4">Heartbeat</th>
                <th className="py-3 px-4">Trigger Reason</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{item.skuName}</div>
                    <div className="text-[11px] text-slate-500">{item.genericComposition}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{item.hubName}</div>
                    <div className="text-[11px] font-mono text-slate-400">{item.hubId}</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <div>₹{item.reportedPrice.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-400">Floor: ₹{item.systemFloorPrice.toFixed(2)}</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <span className={`font-bold ${item.discrepancyPercent < 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {item.discrepancyPercent > 0 ? `+${item.discrepancyPercent}%` : `${item.discrepancyPercent}%`}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                    {item.lastHeartbeatAgo}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">{item.reason}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.severity === 'Critical' 
                        ? 'bg-rose-100 text-rose-800' 
                        : item.severity === 'High' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.severity}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {item.status === 'Released' ? (
                      <span className="text-emerald-700 font-semibold text-xs flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Released</span>
                      </span>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleRelease(item.id)}
                          className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 transition cursor-pointer"
                        >
                          Release
                        </button>
                        <button
                          onClick={() => alert(`Hub ${item.hubId} penalized: 1 SLA Strike logged.`)}
                          className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold border border-rose-200 transition cursor-pointer"
                        >
                          Strike
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
