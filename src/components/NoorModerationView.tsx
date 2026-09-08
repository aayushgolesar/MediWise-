import React, { useState } from 'react';
import { NOOR_INTERCEPT_SESSION } from '../data/mockData';
import { 
  Bot, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  Phone, 
  Send, 
  User, 
  FileText,
  Activity,
  Sparkles
} from 'lucide-react';

export const NoorModerationView: React.FC = () => {
  const [session, setSession] = useState(NOOR_INTERCEPT_SESSION);
  const [operatorNote, setOperatorNote] = useState<string>('');
  const [escalated, setEscalated] = useState<boolean>(false);

  const handleEscalateToPharmacist = () => {
    setEscalated(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
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
            Real-time human-in-the-loop oversight intercepting high-risk patient inquiries, off-label dosage questions, and drug interactions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Safety Intercepts Today</div>
            <div className="text-base font-black font-mono text-emerald-400">19 Critical Catches</div>
          </div>
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Intercept Session Conversation */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Session #{session.sessionId} &bull; Active Safety Intercept
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">Patient: {session.patientName}</span>
          </div>

          {/* Chat Transcript */}
          <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            {/* User Message */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0">
                AS
              </div>
              <div className="space-y-1 max-w-lg">
                <div className="font-bold text-slate-800">Anika Sharma (Consumer)</div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-2xs leading-relaxed">
                  "{session.userPrompt}"
                </div>
              </div>
            </div>

            {/* AI Guardrail Intercept Flag */}
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Triggered Guardrail: {session.guardrailTriggered}</span>
              </div>
              <div className="text-[11px] text-rose-800">
                Risk Classification: <strong className="font-mono">{session.riskLevel}</strong> &bull; Double dose query on HMG-CoA reductase inhibitor.
              </div>
            </div>

            {/* Bot Response */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="space-y-1 max-w-lg">
                <div className="font-bold text-emerald-800">Noor 24/7 AI (Statutory Refusal)</div>
                <div className="p-3 rounded-xl bg-emerald-950 text-emerald-100 border border-emerald-800 shadow-2xs leading-relaxed font-sans">
                  {session.botSystemResponse}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clinical Operator Actions & Macros */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Clinical Operator Action Desk</span>
            </h3>
            <span className="text-xs text-slate-500">Pharmacist Desk BLR</span>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Automated Response Macros
            </label>

            <button
              onClick={() => alert("Inserted Doctor Tele-Referral Card for Dr. Rajesh Iyer into consumer chat.")}
              className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 text-xs transition cursor-pointer"
            >
              <div className="font-bold text-slate-900">Insert Doctor Tele-Referral Card</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Pushes 1-click callback request to Dr. Rajesh Iyer clinic registry.
              </div>
            </button>

            <button
              onClick={() => alert("Statutory poison control helpline (+91 1800-11-2244) sent to patient SMS.")}
              className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/40 text-xs transition cursor-pointer"
            >
              <div className="font-bold text-slate-900">Dispatch Emergency Helpline Notice</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Sends automated SMS with 24/7 National Poison Information helpline.
              </div>
            </button>

            <button
              onClick={handleEscalateToPharmacist}
              disabled={escalated}
              className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-xs transition cursor-pointer disabled:opacity-50"
            >
              <div className="font-bold text-slate-900">
                {escalated ? 'Escalated to Registered Pharmacist K. Ramesh' : 'Re-route Session to Human Pharmacist'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Opens tele-consultation bridge directly to Hub KA-1204.
              </div>
            </button>
          </div>

          {/* Operator Notes Box */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Operator Audit Log Note</label>
            <textarea
              rows={2}
              value={operatorNote}
              onChange={(e) => setOperatorNote(e.target.value)}
              placeholder="e.g., Patient warned against statin dose doubling; advised bedtime compliance."
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <button
              onClick={() => {
                alert("Audit note committed to DISHA log chain.");
                setOperatorNote('');
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
            >
              Commit Operator Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
