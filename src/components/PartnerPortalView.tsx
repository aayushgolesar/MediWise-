import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  QrCode, 
  Printer, 
  Truck, 
  AlertCircle,
  Scan,
  Sparkles,
  ChevronRight,
  Eye,
  Check
} from 'lucide-react';

interface PartnerPortalViewProps {
  onNavigateToTracking: () => void;
}

export const PartnerPortalView: React.FC<PartnerPortalViewProps> = ({ onNavigateToTracking }) => {
  const [slaCountdownSec, setSlaCountdownSec] = useState<number>(412); // ~6 mins left of 15m
  const [activeTab, setActiveTab] = useState<'pending' | 'in_audit' | 'dispatched' | 'quarantined'>('pending');
  const [barcodeInput, setBarcodeInput] = useState<string>('MP-8849-B-09941');
  const [barcodeScanned, setBarcodeScanned] = useState<boolean>(true);
  const [checklist, setChecklist] = useState({
    scheduleH1: true,
    patientId: true,
    prescriberActive: true,
    dosageLimit: true,
    tamperSealAffixed: true
  });
  const [dispenseCompleted, setDispenseCompleted] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlaCountdownSec(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCompleteDispense = () => {
    setDispenseCompleted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Hub Identification Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-sans text-white">
                MedPlus Central Indiranagar (Hub #KA-1204)
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                ACTIVE DISPENSARY HUB
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Supervising Pharmacist: <strong className="text-slate-200">Dr. K. Ramesh (B.Pharm, KSPC-Reg-#KA-7729)</strong> &bull; License: Form 20B/21B
            </p>
          </div>
        </div>

        {/* Urgent SLA Timer Pill */}
        <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 self-start md:self-center">
          <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Next Reassignment In</div>
            <div className="text-base font-black font-mono text-amber-400">{formatTimer(slaCountdownSec)}</div>
          </div>
        </div>
      </div>

      {/* Clinical Worklist Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Urgent Intake Dispense</span>
          <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
        </button>

        <button
          onClick={() => setActiveTab('in_audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'in_audit'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>In Pharmacist Audit</span>
          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">3</span>
        </button>

        <button
          onClick={() => setActiveTab('dispatched')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'dispatched'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Dispatched Today</span>
          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">18</span>
        </button>

        <button
          onClick={() => setActiveTab('quarantined')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'quarantined'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Quarantined SKUs</span>
          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] flex items-center justify-center font-bold">2</span>
        </button>
      </div>

      {dispenseCompleted ? (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 font-sans">
            Dispense Completed &amp; Handed Over to Courier!
          </h2>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
            Order #MW-89421-BLR has been registered in the Schedule H1 Registry, sealed with Hologram Hash #0x88FA...421A, and handed to rider Suresh Kumar.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => alert("Printing Statutory Schedule H1 Dispense Slip #KA-1204-89421...")}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-2 hover:bg-slate-800 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Statutory Slip</span>
            </button>
            <button
              onClick={onNavigateToTracking}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-2 hover:bg-emerald-700 transition cursor-pointer"
            >
              <span>View Consumer Tracking</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Split-Screen Rx Tele-Verification & Physical Dispense Station */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Digital Prescription Viewer */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Digital Prescription Script (Rx)
                </h3>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Schedule H1 Controlled
              </span>
            </div>

            {/* Visual Rx Canvas */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 font-serif text-slate-800">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <div className="font-bold text-slate-900 font-sans text-sm">DR. RAJESH IYER, M.D.</div>
                  <div className="text-[11px] text-slate-500 font-sans">Cardiology &bull; Reg: KMC-48192</div>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-sans">
                  <div>Manipal Heart Institute</div>
                  <div>28-Aug-2026</div>
                </div>
              </div>

              <div className="text-xs font-sans">
                <strong>Patient:</strong> Anika Sharma (48y / F) &bull; ABHA: 91-4819-2041-9921
              </div>

              <div className="py-3 bg-white p-3 rounded-lg border border-emerald-300 ring-1 ring-emerald-500/20 space-y-1">
                <div className="text-lg font-bold text-emerald-900 font-serif">℞</div>
                <div className="font-bold text-sm text-slate-900 font-sans">
                  Tab. Atorvastatin Calcium 20 mg
                </div>
                <div className="text-xs text-slate-600 font-sans">
                  Dosage: 1 tablet daily at bedtime &bull; Dispense limit: 30 Tablets
                </div>
              </div>

              <div className="flex justify-between items-end pt-2 text-[11px] font-sans">
                <div className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  NMC Registry Validated
                </div>
                <div className="text-right italic font-serif text-blue-900">
                  Dr. Rajesh Iyer [Digital Signature Valid]
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Statutory Dispense Checklist & Barcode Scan */}
          <div className="lg:col-span-6 space-y-6">
            {/* Statutory Dispense Checklist */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Statutory Dispense Checklist</span>
              </h3>

              <div className="space-y-2.5 text-xs text-slate-700">
                <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.scheduleH1}
                    onChange={(e) => setChecklist({ ...checklist, scheduleH1: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Schedule H1 Register Serial Entry generated (DISHA Logged)</span>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.patientId}
                    onChange={(e) => setChecklist({ ...checklist, patientId: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Patient Identity Match: Anika Sharma (ABHA Linked)</span>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.prescriberActive}
                    onChange={(e) => setChecklist({ ...checklist, prescriberActive: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Prescriber Registration: Dr. Rajesh Iyer (KMC-48192) verified active</span>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.dosageLimit}
                    onChange={(e) => setChecklist({ ...checklist, dosageLimit: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Dispense Quantity Check: 30 Tablets (Within prescribed 30-day max limit)</span>
                </label>
              </div>
            </div>

            {/* Physical Stock & Serial Barcode Scan */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Scan className="w-4 h-4 text-emerald-600" />
                <span>Physical Stock &amp; Serial Barcode Scan</span>
              </h3>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Scan blister strip barcode..."
                    className="grow px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    onClick={() => setBarcodeScanned(true)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer shrink-0"
                  >
                    Verify Scan
                  </button>
                </div>

                {barcodeScanned && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                    <div>
                      <div className="font-bold">Batch Match Confirmed: MP-8849-B</div>
                      <div className="text-[11px] text-emerald-700">Expiry: 11/2027 &bull; Cipla Generic Approved</div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                )}
              </div>

              {/* Security Packaging Station */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Cryptographic Hologram Seal:</span>
                  <span className="font-mono font-bold text-slate-900">#HOLO-8849-21</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Assigned Courier:</span>
                  <span className="font-semibold text-slate-900">Suresh Kumar (EV #KA-03-EM-8819)</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                id="complete-dispense-btn"
                onClick={handleCompleteDispense}
                className="w-full py-3.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-cyan-600/30"
              >
                <Printer className="w-4 h-4" />
                <span>Complete Dispense &amp; Print Statutory Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
