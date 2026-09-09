import React, { useEffect, useState } from 'react';
import { getModerationQueue, markModerationReviewed, type ModerationLogEntry } from '../api/ai.js';
import {
  Bot,
  ShieldAlert,
  CheckCircle2,
  Activity,
} from 'lucide-react';

export const NoorModerationView: React.FC = () => {
  const [queue, setQueue] = useState<ModerationLogEntry[]>([]);
  const [session, setSession] = useState<ModerationLogEntry | null>(null);
  const [operatorNote, setOperatorNote] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const loadQueue = async (): Promise<void> => {
    const entries = await getModerationQueue();
    setQueue(entries);
    setSession((current) => {
      if (current) {
        return entries.find((entry) => entry.id === current.id) ?? entries[0] ?? null;
      }
      return entries[0] ?? null;
    });
  };

  useEffect(() => {
    void loadQueue();
  }, []);

  const handleModerationAction = async (action: 'approve' | 'redact'): Promise<void> => {
    if (!session) return;
    setIsUpdating(true);
    try {
      await markModerationReviewed(session.id, action);
      await loadQueue();
    } finally {
      setIsUpdating(false);
    }
  };

  if (!session) {
    return <div className="max-w-7xl mx-auto px-4 py-8 text-sm text-slate-500">Loading Noor moderation queue…</div>;
  }

  const flaggedCount = queue.filter((entry) => entry.guardrail_fired === 1 && entry.reviewed === 0).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-500/40">
              AI SAFETY GUARDRAIL ENGINE
            </span>
            <span className="text-xs text-slate-400">FR-SUP-02 Clinical Advice Refusal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1 font-sans">
            Clinical Marketplace Moderation &bull; Live Noor Intercept
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Approve or redact logged Noor responses. Flagged Schedule X / overdose content is queued first.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase font-bold text-slate-400">Unreviewed Safety Intercepts</div>
          <div className="text-base font-black font-mono text-emerald-400">{flaggedCount} Critical Catches</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">Moderation Queue</h3>
          <div className="max-h-[640px] overflow-y-auto space-y-2">
            {queue.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setSession(entry)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition cursor-pointer ${
                  session.id === entry.id
                    ? 'border-emerald-600 bg-emerald-50/70'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold uppercase ${entry.guardrail_fired ? 'text-rose-600' : 'text-slate-500'}`}>
                    {entry.risk_level}
                  </span>
                  {entry.reviewed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <span className="text-[10px] text-amber-600 font-semibold">Open</span>
                  )}
                </div>
                <p className="mt-1 text-slate-800 line-clamp-2">{entry.user_prompt}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Session #{session.session_id.slice(0, 8)}
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">Patient: {session.patient_name}</span>
          </div>

          <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-1 max-w-lg">
              <div className="font-bold text-slate-800">Patient prompt</div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-800 leading-relaxed">
                {session.user_prompt}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Triggered Guardrail: {session.guardrail_fired ? 'Clinical safety review' : 'No automatic guardrail triggered'}</span>
              </div>
              <div className="text-[11px] text-rose-800">
                Risk Classification: <strong className="font-mono">{session.risk_level}</strong>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="space-y-1 max-w-lg">
                <div className="font-bold text-emerald-800">Noor 24/7 AI</div>
                <div className="p-3 rounded-xl bg-emerald-950 text-emerald-100 border border-emerald-800 leading-relaxed">
                  {session.bot_response}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Clinical Operator Action Desk</span>
            </h3>
          </div>

          <button
            onClick={() => { void handleModerationAction('approve'); }}
            disabled={isUpdating || session.reviewed === 1}
            className="w-full text-left p-3 rounded-xl border border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-xs transition cursor-pointer disabled:opacity-50"
          >
            <div className="font-bold text-slate-900">Approve response</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Marks this Noor reply as CDSCO-compliant.</div>
          </button>

          <button
            onClick={() => { void handleModerationAction('redact'); }}
            disabled={isUpdating || session.risk_level === 'REDACTED'}
            className="w-full text-left p-3 rounded-xl border border-rose-200 hover:border-rose-500 hover:bg-rose-50/40 text-xs transition cursor-pointer disabled:opacity-50"
          >
            <div className="font-bold text-slate-900">Redact response</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Replaces hazardous AI text with a statutory redaction notice.</div>
          </button>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="text-xs font-bold text-slate-700 block" htmlFor="operator-note">Operator Audit Log Note</label>
            <textarea
              id="operator-note"
              rows={2}
              value={operatorNote}
              onChange={(e) => setOperatorNote(e.target.value)}
              placeholder="e.g., Patient warned against statin dose doubling; advised bedtime compliance."
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <button
              onClick={() => setOperatorNote('')}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
            >
              Clear Operator Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
