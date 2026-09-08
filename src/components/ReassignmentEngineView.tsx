import React, { useState, useEffect } from 'react';
import { REASSIGNMENT_TASK } from '../data/mockData';
import { 
  Clock, 
  ArrowRightLeft, 
  AlertCircle, 
  Building2, 
  CheckCircle2, 
  MapPin, 
  Check, 
  ShieldAlert,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export const ReassignmentEngineView: React.FC = () => {
  const [task, setTask] = useState(REASSIGNMENT_TASK);
  const [countdown, setCountdown] = useState<number>(task.timeRemainingSec);
  const [reassignedHub, setReassignedHub] = useState<string | null>(null);
  const [strikeIssued, setStrikeIssued] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleExecuteReassignment = (hubId: string, hubName: string) => {
    setReassignedHub(hubName);
    setStrikeIssued(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/40">
              ENGINE FR-ORDER-02
            </span>
            <span className="text-xs text-slate-400">Automated 15-min SLA Failover</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1 font-sans">
            Partner SLA Reassignment Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time candidate pharmacy matching matrix that shifts orders before consumer delivery windows breach.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
          <Clock className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Timeout Countdown</div>
            <div className="text-lg font-mono font-black text-amber-400">{formatTimer(countdown)}</div>
          </div>
        </div>
      </div>

      {reassignedHub ? (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg">
            <Check className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Order Successfully Reassigned to {reassignedHub}!
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Order #{task.orderId} was shifted with POS reservation confirmation. MedPlus Indiranagar was issued 1 SLA strike for unacknowledged intake.
          </p>
          <button
            onClick={() => setReassignedHub(null)}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
          >
            Reset Engine View
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Active Timeout Task Detail */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                15-Min SLA Warning
              </span>
              <span className="text-xs font-mono text-slate-500 font-bold">#{task.orderId}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block">Patient Name</span>
                <span className="font-bold text-slate-900 text-sm">{task.patientName}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Medicine Ordered</span>
                <span className="font-semibold text-slate-800">{task.medicineName}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Original Assigned Hub</span>
                <span className="font-semibold text-slate-800">{task.originalHub}</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>{task.timeoutReason}</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-snug">
                  Hub failed to initiate pharmacist tele-audit or scan serial batch within the required 15-minute statutory window.
                </p>
              </div>

              {strikeIssued && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Strike 1 of 3 issued to Hub KA-1204</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Candidate Pharmacy Match Matrix */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                <span>Candidate Pharmacy Match Matrix</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">Ranked by Geo &amp; Stock</span>
            </div>

            <div className="space-y-3">
              {task.candidateHubs.map((candidate) => (
                <div
                  key={candidate.hubId}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-white transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{candidate.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        candidate.status === 'Optimal' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {candidate.matchScore}% Match
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {candidate.distanceKm} km away
                      </span>
                      <span>&bull;</span>
                      <span className="font-semibold text-slate-700">
                        {candidate.stock} units in stock
                      </span>
                      <span>&bull;</span>
                      <span className="text-emerald-700 font-medium">
                        {candidate.slaMinutes}m delivery SLA
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleExecuteReassignment(candidate.hubId, candidate.name)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold whitespace-nowrap transition cursor-pointer self-end sm:self-center shadow-xs"
                  >
                    Reassign to Hub
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
