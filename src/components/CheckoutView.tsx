import React, { useState } from 'react';
import { PharmacyOffer, PatientProfile, PrescriptionAudit, Medicine } from '../types';
import { PATIENTS, INITIAL_PRESCRIPTION, PHARMACY_OFFERS, MEDICINES_CATALOG } from '../data/mockData';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  User, 
  MapPin, 
  CreditCard, 
  Lock, 
  Eye, 
  Sparkles, 
  X, 
  AlertCircle,
  FileCheck,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

interface CheckoutViewProps {
  selectedOffer: PharmacyOffer | null;
  packCount: number;
  selectedMedicine?: Medicine;
  onBackToMarketplace: () => void;
  onOrderPlaced: (orderId: string) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  selectedOffer,
  packCount,
  selectedMedicine,
  onBackToMarketplace,
  onOrderPlaced
}) => {
  const activeOffer = selectedOffer || PHARMACY_OFFERS[0];
  const activeMedicine = selectedMedicine || MEDICINES_CATALOG[0];
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-1');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [showRxModal, setShowRxModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const packMultiplier = packCount / 10;
  const itemTotal = activeOffer.discountedPrice * packMultiplier;
  const tamperFee = 12.00;
  const deliveryFee = 15.00;
  const platformFee = 5.00;
  const grandTotal = itemTotal + tamperFee + deliveryFee + platformFee;
  const brandSavings = (activeOffer.mrp - activeOffer.discountedPrice) * packMultiplier;

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onOrderPlaced('MW-89421-BLR');
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top breadcrumb & step navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={onBackToMarketplace}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">1</span>
            <span>Pharmacy Selection</span>
          </span>
          <span className="text-slate-300">&rarr;</span>
          <span className="flex items-center gap-1.5 text-slate-900 font-bold">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
            <span>Rx &amp; Patient Audit</span>
          </span>
          <span className="text-slate-300">&rarr;</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">3</span>
            <span>Escrow Lock</span>
          </span>
        </div>
      </div>

      {/* Real-time Inventory & Price Revalidated Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-emerald-900 text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Inventory &amp; Price Revalidated:</strong> {activeOffer.stockUnits} units reserved at {activeOffer.pharmacyName} for 15 minutes.
          </span>
        </div>
        <span className="hidden sm:inline-block font-mono text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
          POS Lock #LOK-9942
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Rx Audit, Patient Selection, Delivery, Payment */}
        <div className="lg:col-span-8 space-y-6">
          {/* Doctor Prescription Audit Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 inline-block mb-1">
                  Schedule H1 Statutory Requirement
                </span>
                <h3 className="text-base font-bold text-slate-900">Doctor Prescription (Rx) Audit</h3>
              </div>
              <button
                id="view-rx-modal-btn"
                onClick={() => setShowRxModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Rx Document PDF</span>
              </button>
            </div>

            {/* Prescription Details Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                    PDF
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{INITIAL_PRESCRIPTION.fileName}</div>
                    <div className="text-xs text-slate-500">Uploaded on {INITIAL_PRESCRIPTION.uploadDate}</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  OCR Verified
                </span>
              </div>

              {/* OCR Extracted Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-200">
                <div>
                  <span className="text-slate-500 block">Prescribing Practitioner</span>
                  <span className="font-semibold text-slate-900">{INITIAL_PRESCRIPTION.doctorName}</span>
                  <span className="block text-[11px] font-mono text-slate-500">Reg: {INITIAL_PRESCRIPTION.doctorRegNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Medical Facility</span>
                  <span className="font-semibold text-slate-900">{INITIAL_PRESCRIPTION.hospitalClinic}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Prescribed Medicine &amp; Strength</span>
                  <span className="font-semibold text-slate-900">{INITIAL_PRESCRIPTION.dosage}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Frequency &amp; Max Dispense Limit</span>
                  <span className="font-semibold text-slate-900">Once Daily (HS) &bull; Max {INITIAL_PRESCRIPTION.dispenseLimitQty} tabs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Profile Selection */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Patient Profile &amp; ABHA Link</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PATIENTS.map((patient) => (
                <div
                  key={patient.id}
                  id={`patient-card-${patient.id}`}
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    selectedPatientId === patient.id
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{patient.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {patient.relation}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {patient.age} yrs &bull; {patient.gender} &bull; {patient.phone}
                  </div>
                  <div className="text-[11px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded mt-2 inline-block">
                    ABHA: {patient.abhaId}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Delivery Address (Within 45-min SLA Radius)</span>
              </h3>
              <span className="text-xs font-semibold text-emerald-700">Verified Pin 560038</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <div className="font-bold text-slate-900">Anika Sharma</div>
              <div>Flat 402, Greenfield Heights, 12th Main Road, Indiranagar</div>
              <div>Bengaluru, Karnataka - 560038</div>
              <div className="text-slate-500 mt-1">Contact: +91 98450 91283</div>
            </div>
          </div>

          {/* Payment Method & Escrow Protection */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Payment &amp; Escrow Security</span>
              </h3>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <Lock className="w-3 h-3 text-emerald-600" />
                100% Escrow Protected
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Payment is held securely in escrow and only released to {activeOffer.pharmacyName} after you inspect the tamper-proof hologram seal and provide the 4-digit Delivery OTP to the courier.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <button
                id="pay-method-upi"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'border-emerald-600 bg-emerald-50/70 font-bold text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="text-xs font-bold">UPI / QR</div>
                <div className="text-[10px] text-slate-500 mt-0.5">GPay, PhonePe, Paytm</div>
              </button>

              <button
                id="pay-method-card"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-emerald-600 bg-emerald-50/70 font-bold text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="text-xs font-bold">Credit / Debit</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Visa, Mastercard, RuPay</div>
              </button>

              <button
                id="pay-method-cod"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'border-emerald-600 bg-emerald-50/70 font-bold text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="text-xs font-bold">Pay at Doorstep</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Cash / UPI on inspect</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Order Cost Audit & Place Order Button */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5 sticky top-28">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Order Cost Audit
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                SLA: {activeOffer.slaMinutes}m
              </span>
            </div>

            {/* Selected Pharmacy Hub Box */}
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 space-y-1.5 text-xs">
              <div className="font-bold text-white">{activeOffer.pharmacyName}</div>
              <div className="text-slate-400 text-[11px]">{activeOffer.locality}</div>
              <div className="text-[10px] font-mono text-emerald-400">
                CDSCO License: {activeOffer.licenseNumber}
              </div>
            </div>

            {/* Item & Pricing Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>{activeMedicine.brandName} ({packCount} Units)</span>
                <span className="font-mono">₹{itemTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1">
                  <span>Tamper-Evident Packaging &amp; Seal</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </span>
                <span className="font-mono">₹{tamperFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Hyperlocal EV Delivery (1.4 km)</span>
                <span className="font-mono">₹{deliveryFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Platform Clearinghouse Fee</span>
                <span className="font-mono">₹{platformFee.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <div>
                  <div className="text-sm font-bold text-white">Total Amount</div>
                  <div className="text-[10px] text-emerald-400">Secured in Escrow</div>
                </div>
                <div className="text-xl font-black text-emerald-400 font-mono">
                  ₹{grandTotal.toFixed(2)}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold flex items-center justify-between">
                <span>Total Generic Savings</span>
                <span className="font-mono text-sm font-bold">₹{brandSavings.toFixed(2)}</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              id="authorize-escrow-order-btn"
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Validating Escrow &amp; POS Lock...</span>
              ) : (
                <>
                  <span>Authorize Escrow &amp; Place Order</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              By authorizing, you agree to statutory Schedule H1 tele-verification and batch registration.
            </p>
          </div>
        </div>
      </div>

      {/* Doctor Rx PDF Viewer Modal */}
      {showRxModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="text-base font-bold text-slate-900">Dr. Rajesh Iyer &bull; Clinical Prescription Script</h4>
              </div>
              <button
                onClick={() => setShowRxModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Authentic Doctor Letterhead Layout */}
            <div className="border border-slate-300 rounded-xl p-6 bg-slate-50/50 space-y-4 font-serif text-slate-800 shadow-inner">
              <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-black text-slate-900 font-sans">DR. RAJESH IYER, M.D. (Cardiology)</h2>
                  <p className="text-xs text-slate-600">Senior Consultant Interventional Cardiologist</p>
                  <p className="text-xs text-slate-500">Reg No: KMC-48192 &bull; MCI-2009/08/1124</p>
                </div>
                <div className="text-right text-xs text-slate-600 font-sans">
                  <div className="font-bold text-slate-800">Manipal Heart Institute</div>
                  <div>Indiranagar 100ft Rd, Bengaluru</div>
                  <div>Phone: 080-49210000</div>
                </div>
              </div>

              <div className="flex justify-between text-xs py-1 border-b border-slate-200 font-sans">
                <div><strong>Patient:</strong> Anika Sharma (48y / F)</div>
                <div><strong>Date:</strong> 28-Aug-2026</div>
                <div><strong>BP:</strong> 132/84 mmHg</div>
              </div>

              <div className="py-4 space-y-3">
                <div className="text-xl font-bold text-emerald-900 font-serif">℞</div>
                <div className="pl-6 space-y-2">
                  <div className="font-bold text-sm text-slate-900 font-sans">
                    1. Tab. Atorvastatin Calcium 20 mg
                  </div>
                  <div className="text-xs text-slate-700 italic">
                    Sig: 1 tab once daily at bedtime (Hora Somni - HS) with water.
                  </div>
                  <div className="text-xs text-slate-600">
                    Duration: 30 days &bull; Refill: Max 1 month dispense under Schedule H1 protocol.
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-300 flex justify-between items-end">
                <div className="text-[10px] text-slate-500 font-sans">
                  Digitally signed under Information Technology Act, 2000.
                  <br />Verified on MediWise DISHA Audit Chain.
                </div>
                <div className="text-right">
                  <div className="font-serif italic text-sm text-blue-900 underline decoration-wavy">Dr. Rajesh Iyer</div>
                  <div className="text-[10px] text-slate-600 font-sans font-bold">KMC-48192 [Digital Seal]</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowRxModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
              >
                Close Prescription Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
