// src/offline/OfflineFallback.tsx
import React from 'react';

export const OfflineFallback: React.FC = () => (
  <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white px-4 text-center">
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center mb-6 shadow-2xl shadow-emerald-900/40">
      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M6.343 17.657a9 9 0 010-12.728M9.172 15.536a5 5 0 010-7.072M12 12h.01" />
      </svg>
    </div>
    <h1 className="text-2xl font-black tracking-tight mb-2">You're Offline</h1>
    <p className="text-slate-400 max-w-sm text-sm leading-relaxed mb-6">
      MediWise requires an internet connection to verify prescriptions and process orders safely.
      Please check your connection and try again.
    </p>
    <button
      onClick={() => window.location.reload()}
      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition text-sm font-bold shadow-lg"
    >
      Retry Connection
    </button>
    <p className="mt-8 text-xs text-slate-600">
      Compliant with Drugs &amp; Cosmetics Act, 1940 • DISHA Health Data Privacy Standards
    </p>
  </div>
);

export default OfflineFallback;
