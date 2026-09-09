import React, { useEffect, useState } from 'react';
import { toastStore, ToastItem } from '../utils/toastStore';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return toastStore.subscribe(setToasts);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto rounded-xl p-3.5 shadow-xl border backdrop-blur-md flex items-start gap-3 transition-all transform animate-in fade-in slide-in-from-top-2 duration-200 ${
              isError
                ? 'bg-slate-900/95 border-rose-500/50 text-rose-100'
                : isSuccess
                ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-100'
                : isWarning
                ? 'bg-slate-900/95 border-amber-500/50 text-amber-100'
                : 'bg-slate-900/95 border-cyan-500/50 text-cyan-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {!isError && !isSuccess && !isWarning && <Info className="w-5 h-5 text-cyan-400" />}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              {toast.title && (
                <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5 text-white">
                  {toast.title}
                </h4>
              )}
              <p className="text-xs text-slate-200 leading-relaxed break-words">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => toastStore.dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="text-slate-400 hover:text-white p-1 rounded-md transition shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
