import React, { useState, useEffect } from 'react';
import { INITIAL_ORDER } from '../data/mockData';
import { 
  Truck, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  CheckCircle2, 
  Clock, 
  FileText, 
  AlertTriangle, 
  Download, 
  Sparkles,
  QrCode,
  UserCheck,
  ChevronRight
} from 'lucide-react';

interface OrderTrackingViewProps {
  onOpenDispute: () => void;
  onOpenNoorChat: () => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({ 
  onOpenDispute,
  onOpenNoorChat
}) => {
  const [order, setOrder] = useState(INITIAL_ORDER);
  const [riderDistance, setRiderDistance] = useState<number>(1.1);
  const [etaMinutes, setEtaMinutes] = useState<number>(14);

  // Simulate subtle rider progress
  useEffect(() => {
    const timer = setInterval(() => {
      setRiderDistance(prev => (prev > 0.3 ? Number((prev - 0.05).toFixed(2)) : 0.25));
      setEtaMinutes(prev => (prev > 3 ? prev - 1 : 3));
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Order Status Banner with OTP */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                ACTIVE OUT FOR DELIVERY
              </span>
              <span className="text-xs text-slate-400">Placed at {order.placedTime}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white font-sans">
              Order #{order.orderId}
            </h1>
            <p className="text-xs text-slate-400">
              Guaranteed Delivery Window: <strong className="text-emerald-400">{order.deliveryEta}</strong> ({etaMinutes} mins remaining)
            </p>
          </div>

          {/* Secure Delivery OTP Box */}
          <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-xl p-4 flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Secure Delivery OTP
              </div>
              <div className="text-3xl font-black font-mono text-white tracking-widest">
                {order.deliveryOtp}
              </div>
            </div>
            <div className="text-[11px] text-emerald-200/80 max-w-[180px] leading-tight border-l border-emerald-500/30 pl-3">
              Reveal to rider <strong>ONLY</strong> after inspecting the tamper-evident seal.
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live GPS Route Map & Courier Info */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dynamic Interactive SVG Map */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-hidden relative shadow-lg">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 font-semibold">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Live Route &bull; Indiranagar 100ft Rd to 12th Main</span>
              </span>
              <span className="text-emerald-400 font-mono font-bold">Rider {riderDistance} km away</span>
            </div>

            {/* Custom stylized map canvas */}
            <div className="h-64 sm:h-80 w-full rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden flex items-center justify-center">
              {/* Map grid lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>

              {/* Landmark roads */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 300" preserveAspectRatio="none">
                {/* Roads */}
                <path d="M 50 60 L 450 60" stroke="#334155" strokeWidth="6" />
                <path d="M 120 20 L 120 280" stroke="#334155" strokeWidth="8" />
                <path d="M 380 30 L 380 270" stroke="#334155" strokeWidth="6" />
                <path d="M 50 220 L 450 220" stroke="#334155" strokeWidth="7" />

                {/* Delivery Trajectory Path */}
                <path 
                  d="M 120 60 Q 240 60 240 140 T 380 220" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="4" 
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />

                {/* Pharmacy Hub Marker */}
                <circle cx="120" cy="60" r="10" fill="#0284c7" />
                <circle cx="120" cy="60" r="4" fill="#ffffff" />
                <text x="135" y="65" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                  MedPlus KA-1204
                </text>

                {/* Animated Courier Marker */}
                <circle cx="280" cy="155" r="14" fill="#10b981" fillOpacity="0.3" className="animate-ping" />
                <circle cx="280" cy="155" r="9" fill="#10b981" />
                <circle cx="280" cy="155" r="4" fill="#ffffff" />
                <text x="295" y="160" fill="#34d399" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                  Suresh (EV #8819)
                </text>

                {/* Destination Home Marker */}
                <circle cx="380" cy="220" r="10" fill="#f43f5e" />
                <circle cx="380" cy="220" r="4" fill="#ffffff" />
                <text x="310" y="245" fill="#fda4af" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                  Anika Sharma (Home)
                </text>
              </svg>

              {/* Status overlay tag */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-xs border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Insulated Cold-Chain Sensor: <strong>21.4°C (Normal)</strong></span>
              </div>
            </div>
          </div>

          {/* Courier Contact Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-base">
                SK
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{order.courier.name}</h4>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    ★ {order.courier.rating}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Verified Delivery Partner &bull; {order.courier.vehicleNumber}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${order.courier.phone}`}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                title="Call Courier"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={onOpenNoorChat}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Help with Order</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Clinical Chain of Custody & Items */}
        <div className="lg:col-span-5 space-y-6">
          {/* Clinical Chain of Custody Timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Clinical Chain of Custody</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">DISHA Audit #KA-881</span>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 text-xs">
              {/* Event 1 */}
              <div className="relative flex items-start gap-3 pl-1">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">02:14 PM &bull; Order Placed &amp; Escrow Locked</div>
                  <div className="text-slate-500 text-[11px] leading-snug">
                    ₹133.50 locked in clearinghouse escrow. Inventory reserved at MedPlus Indiranagar.
                  </div>
                </div>
              </div>

              {/* Event 2 */}
              <div className="relative flex items-start gap-3 pl-1">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">02:19 PM &bull; Pharmacist Tele-Audit Verified</div>
                  <div className="text-slate-500 text-[11px] leading-snug">
                    Dr. K. Ramesh (Reg #KA-7729) verified Dr. Rajesh Iyer Rx and approved 30 tabs dispense.
                  </div>
                </div>
              </div>

              {/* Event 3 */}
              <div className="relative flex items-start gap-3 pl-1">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                  <QrCode className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">02:26 PM &bull; Serial Batch Scanned &amp; Tamper Sealed</div>
                  <div className="text-slate-500 text-[11px] leading-snug">
                    Batch <strong className="text-slate-700">MP-8849-B</strong> packaged with Hologram Seal <strong className="font-mono text-[10px] text-slate-700">#HOLO-8849-21</strong>.
                  </div>
                </div>
              </div>

              {/* Event 4 */}
              <div className="relative flex items-start gap-3 pl-1">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">02:40 PM &bull; Dispatched with Courier Suresh Kumar</div>
                  <div className="text-slate-500 text-[11px] leading-snug">
                    EV courier handoff completed with cold-chain transit bag check.
                  </div>
                </div>
              </div>

              {/* Event 5 - Current */}
              <div className="relative flex items-start gap-3 pl-1">
                <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-emerald-600 text-emerald-700 flex items-center justify-center shrink-0 z-10">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                </div>
                <div>
                  <div className="font-bold text-emerald-800">In-Transit &bull; Approaching Indiranagar 12th Main</div>
                  <div className="text-emerald-600 text-[11px] leading-snug">
                    ETA {etaMinutes} mins. Rider is currently 1.1 km away.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items & Invoice Recap */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Ordered Formulation</span>
              <button 
                onClick={() => alert("Downloading GST Tax Invoice #INV-2026-89421.pdf...")}
                className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>GST Tax Invoice</span>
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">{order.medicine.brandGenericName}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Pack of {order.medicine.packSize} &bull; Batch: {order.medicine.batchNumber}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900 font-mono">₹{order.financials.totalPaid.toFixed(2)}</div>
                <div className="text-[10px] text-emerald-700 font-semibold">Paid via Escrow</div>
              </div>
            </div>

            {/* Dispute Trigger Link */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Notice seal breakage or wrong medicine?</span>
              <button
                id="raise-dispute-btn"
                onClick={onOpenDispute}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Raise Dispute</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
