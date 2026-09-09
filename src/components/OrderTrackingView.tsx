import React, { useState, useEffect } from 'react';
import { getOrder } from '../api/orders.js';
import { getTaxInvoice, type TaxInvoice } from '../api/payments.js';
import type { OrderDetail } from '../types';
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
  ChevronRight,
  Printer,
  X
} from 'lucide-react';

interface OrderTrackingViewProps {
  orderId: string | null;
  onOpenDispute: () => void;
  onOpenNoorChat: () => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({ 
  orderId,
  onOpenDispute,
  onOpenNoorChat
}) => {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [riderDistance, setRiderDistance] = useState<number>(1.1);
  const [etaMinutes, setEtaMinutes] = useState<number>(14);
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
  const [taxInvoice, setTaxInvoice] = useState<TaxInvoice | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState<boolean>(false);

  useEffect(() => {
    if (!orderId) return;
    void getOrder(orderId).then(setOrder);
  }, [orderId]);

  // Simulate subtle rider progress
  useEffect(() => {
    const timer = setInterval(() => {
      setRiderDistance(prev => (prev > 0.3 ? Number((prev - 0.05).toFixed(2)) : 0.25));
      setEtaMinutes(prev => (prev > 3 ? prev - 1 : 3));
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenInvoice = async () => {
    if (!orderId) return;
    setLoadingInvoice(true);
    setShowInvoiceModal(true);
    try {
      const inv = await getTaxInvoice(orderId);
      setTaxInvoice(inv);
    } catch (err) {
      console.error('Failed to load invoice:', err);
    } finally {
      setLoadingInvoice(false);
    }
  };

  if (!order) return <div className="max-w-7xl mx-auto px-4 py-8 text-sm text-slate-500">Loading order details…</div>;

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
            <h1 className="text-2xl font-black tracking-tight text-white">
              Order #{order.orderId}
            </h1>
            <p className="text-xs text-slate-400">
              Prescription verified by {order.pharmacy.pharmacistName} ({order.pharmacy.pharmacistReg}) &bull; CDSCO Form 20B/21B Compliant
            </p>
          </div>

          {/* Hologram / OTP Delivery Authorization Box */}
          <div className="bg-emerald-950/70 border border-emerald-500/40 rounded-xl p-4 flex items-center gap-5">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                Delivery Confirmation OTP
              </div>
              <div className="text-3xl font-black text-white tracking-widest font-mono mt-0.5">
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
                <text x="310" y="245" fill="#fb7185" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                  Indiranagar 12th Main
                </text>
              </svg>
            </div>
          </div>

          {/* Courier Chain of Custody & Tamper Check */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                  SK
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{order.courier.name}</div>
                  <div className="text-xs text-slate-500">Dedicated EV Pharma Courier &bull; {order.courier.rating} ★</div>
                </div>
              </div>
              <a 
                href={`tel:${order.courier.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Courier</span>
              </a>
            </div>

            {/* Cold Chain & Hologram Seal Verification Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-emerald-900">Cold Chain Active (4°C - 8°C)</div>
                  <div className="text-[10px] text-emerald-700">Digital thermal sensor verified at packaging</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <QrCode className="w-5 h-5 text-slate-700 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Hologram Seal Hash</div>
                  <div className="text-[10px] font-mono text-slate-500 truncate max-w-[170px]">
                    {order.medicine.sealHash}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 6-Stage Timeline & Escrow Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          {/* Timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
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
                  <div className="font-bold text-slate-900">Order Placed &amp; Escrow Locked</div>
                  <div className="text-slate-500 text-[11px] leading-snug">
                    ₹{order.financials.totalPaid.toFixed(2)} locked in clearinghouse escrow. Inventory reserved at {order.pharmacy.name}.
                  </div>
                </div>
              </div>

              {/* Event 2 */}
              <div className="relative flex items-start gap-3 pl-1">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Pharmacist Tele-Audit Verified</div>
                  <div className="text-slate-500 text-[11px] leading-snug">
                    {order.pharmacy.pharmacistName} ({order.pharmacy.pharmacistReg}) verified doctor prescription and approved dispense.
                  </div>
                </div>
              </div>

              {/* Event 3 */}
              <div className="relative flex items-start gap-3 pl-1">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                  <QrCode className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Serial Batch Scanned &amp; Tamper Sealed</div>
                  <div className="text-slate-500 text-[11px] leading-snug">
                    Batch <strong className="text-slate-700">{order.medicine.batchNumber || 'MP-8849-B'}</strong> packaged with Hologram Seal.
                  </div>
                </div>
              </div>

              {/* Event 4 */}
              <div className="relative flex items-start gap-3 pl-1">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Dispatched with Courier {order.courier.name}</div>
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
                  <div className="font-bold text-emerald-800">In-Transit &bull; Approaching Destination</div>
                  <div className="text-emerald-600 text-[11px] leading-snug">
                    ETA {etaMinutes} mins. Rider is currently {riderDistance} km away.
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
                id="view-gst-invoice-btn"
                onClick={handleOpenInvoice}
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
                  Pack of {order.medicine.packSize} &bull; Batch: {order.medicine.batchNumber || 'MP-8849-B'}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900 font-mono">₹{order.financials.totalPaid.toFixed(2)}</div>
                <div className="text-[10px] text-emerald-700 font-semibold">
                  {order.financials.escrowStatus}
                </div>
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

      {/* Digital GST Tax Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h4 className="text-base font-bold text-slate-900">Statutory Tax Invoice (GST Compliant)</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {loadingInvoice ? (
              <div className="py-12 text-center text-sm text-slate-500">Generating tax invoice…</div>
            ) : taxInvoice ? (
              <div className="border border-slate-300 rounded-xl p-6 bg-slate-50/50 space-y-5 text-xs text-slate-800 font-sans">
                {/* Invoice Header */}
                <div className="flex justify-between items-start border-b border-slate-300 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">MediWise Clearinghouse Portal</h2>
                    <p className="text-slate-600 text-[11px]">Generic Medicine Price Parity Network</p>
                    <p className="text-slate-500 text-[11px]">GSTIN: {taxInvoice.sellerGstin}</p>
                    <p className="text-slate-500 text-[11px]">CDSCO License: {taxInvoice.sellerLicense}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-emerald-800">{taxInvoice.invoiceNumber}</span>
                    <p className="text-slate-500 text-[11px]">Date: {new Date(taxInvoice.invoiceDate).toLocaleDateString('en-IN')}</p>
                    <p className="text-slate-500 text-[11px]">Order #{taxInvoice.orderId}</p>
                  </div>
                </div>

                {/* Seller and Buyer Details */}
                <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <span className="font-bold block text-slate-900 uppercase text-[10px] tracking-wider">Dispensing Hub (Seller)</span>
                    <p className="font-semibold text-slate-800">{taxInvoice.sellerHub}</p>
                    <p className="text-slate-500 text-[11px]">Indiranagar Micro-Hub, Bengaluru</p>
                  </div>
                  <div>
                    <span className="font-bold block text-slate-900 uppercase text-[10px] tracking-wider">Billed To (Buyer)</span>
                    <p className="font-semibold text-slate-800">{taxInvoice.buyerName}</p>
                    <p className="text-slate-500 text-[11px]">{taxInvoice.buyerAddress}</p>
                  </div>
                </div>

                {/* Line Items Table */}
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 text-[10px] font-bold uppercase text-slate-500">
                      <th className="py-2">Description</th>
                      <th className="py-2">HSN / SAC</th>
                      <th className="py-2 text-right">Taxable Value</th>
                      <th className="py-2 text-right">GST Rate</th>
                      <th className="py-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2 font-medium">{order.medicine.brandGenericName} (Pack of {order.medicine.packSize})</td>
                      <td className="py-2 font-mono text-[11px]">HSN 3004</td>
                      <td className="py-2 text-right font-mono">₹{taxInvoice.itemTotal.toFixed(2)}</td>
                      <td className="py-2 text-right">Exempt / OTC</td>
                      <td className="py-2 text-right font-mono font-semibold">₹{taxInvoice.itemTotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">Tamper-Proof Packaging &amp; Seal</td>
                      <td className="py-2 font-mono text-[11px]">SAC 998553</td>
                      <td className="py-2 text-right font-mono">₹12.00</td>
                      <td className="py-2 text-right">0%</td>
                      <td className="py-2 text-right font-mono">₹12.00</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">Hyperlocal EV Courier Delivery</td>
                      <td className="py-2 font-mono text-[11px]">SAC 996812</td>
                      <td className="py-2 text-right font-mono">₹15.00</td>
                      <td className="py-2 text-right">0%</td>
                      <td className="py-2 text-right font-mono">₹15.00</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">Platform Clearinghouse Convenience</td>
                      <td className="py-2 font-mono text-[11px]">SAC 998553</td>
                      <td className="py-2 text-right font-mono">₹{taxInvoice.platformFee.toFixed(2)}</td>
                      <td className="py-2 text-right">18% (9+9)</td>
                      <td className="py-2 text-right font-mono">₹{taxInvoice.platformFee.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-500 pl-4 text-[11px]">Central GST (CGST @ 9%)</td>
                      <td className="py-1 font-mono text-[11px]">—</td>
                      <td className="py-1 text-right font-mono">—</td>
                      <td className="py-1 text-right">9%</td>
                      <td className="py-1 text-right font-mono">₹{taxInvoice.cgstAmount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-500 pl-4 text-[11px]">State GST (SGST @ 9%)</td>
                      <td className="py-1 font-mono text-[11px]">—</td>
                      <td className="py-1 text-right font-mono">—</td>
                      <td className="py-1 text-right">9%</td>
                      <td className="py-1 text-right font-mono">₹{taxInvoice.sgstAmount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-800 text-sm font-bold text-slate-900">
                      <td colSpan={4} className="py-3">Grand Total (Inclusive of Taxes)</td>
                      <td className="py-3 text-right font-mono text-emerald-700">₹{taxInvoice.grandTotal.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>

                {/* Footer notes */}
                <div className="pt-3 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
                  <div>
                    This is a computer-generated tax invoice issued pursuant to Section 31 of CGST Act, 2017.
                    <br />Escrow Status: <strong>{order.financials.escrowStatus}</strong>
                  </div>
                  <div className="font-mono text-slate-400">
                    DISHA-VERIFIED-SEAL
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-slate-500">Unable to load invoice record.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
