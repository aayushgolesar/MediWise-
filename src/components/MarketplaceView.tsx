import React, { useState } from 'react';
import { MEDICINE_DETAILS, PHARMACY_OFFERS } from '../data/mockData';
import { PharmacyOffer } from '../types';
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  FileBadge, 
  TrendingDown, 
  Truck, 
  Sparkles,
  Info,
  ChevronRight,
  RefreshCw,
  QrCode
} from 'lucide-react';

interface MarketplaceViewProps {
  onSelectPharmacy: (offer: PharmacyOffer, packCount: number) => void;
  onOpenNoorChat: () => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({ 
  onSelectPharmacy,
  onOpenNoorChat 
}) => {
  const [selectedPack, setSelectedPack] = useState<number>(30);
  const [selectedOfferId, setSelectedOfferId] = useState<string>('offer-medplus-indiranagar');
  const [heartbeatTime, setHeartbeatTime] = useState<string>('12 seconds ago');

  const selectedPackOption = MEDICINE_DETAILS.packOptions.find(p => p.count === selectedPack) || MEDICINE_DETAILS.packOptions[1];
  const packMultiplier = selectedPack / 10;

  const handleRefreshFeed = () => {
    setHeartbeatTime('Just now (Ingestion Revalidated)');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Clinical Disclaimer & Anti-Stale Ingestion Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl text-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">Catalog Governance & Anti-Stale Stock Protection</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  LIVE CDSCO FEED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                All listed generic formulations and pharmacy inventory are cross-verified against State Drug Control databases. Real-time POS integration auto-suppresses offers inactive for &gt;30 mins.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Inventory Sync Heartbeat</div>
              <div className="text-xs font-mono font-semibold text-emerald-400">{heartbeatTime}</div>
            </div>
            <button 
              id="refresh-ingestion-btn"
              onClick={handleRefreshFeed}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              title="Revalidate stock and price freshness"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Medicine Hero & Details */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                {MEDICINE_DETAILS.schedule}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                <FileBadge className="w-3.5 h-3.5" />
                100% Bioequivalent to Lipitor / Atorva
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                CDSCO Form 28 / GMP Certified
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                {MEDICINE_DETAILS.brandName}
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Generic Composition: <strong className="text-slate-800 font-semibold">{MEDICINE_DETAILS.genericName}</strong> ({MEDICINE_DETAILS.strength}) &bull; {MEDICINE_DETAILS.dosageForm}
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              Prescribed for lowering LDL cholesterol, apolipoprotein B, and triglycerides while increasing HDL in primary hypercholesterolemia and combined dyslipidemia. Decreases relative cardiovascular event risk.
            </p>

            {/* Pack Size Selector */}
            <div className="pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Select Dispense Quantity (Pack Size)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {MEDICINE_DETAILS.packOptions.map((opt) => (
                  <button
                    key={opt.count}
                    id={`pack-select-${opt.count}`}
                    onClick={() => setSelectedPack(opt.count)}
                    className={`p-3 rounded-xl border text-left transition relative cursor-pointer ${
                      selectedPack === opt.count
                        ? 'border-emerald-600 bg-emerald-50/70 text-slate-900 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {opt.isRecommended && (
                      <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-emerald-600 text-white shadow-xs">
                        Most Prescribed
                      </span>
                    )}
                    <div className="font-bold text-sm">{opt.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Save {Math.round(opt.unitDiscount * 100)}% vs Brand MRP
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Price Benchmarking Widget */}
          <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>National Price Comparison</span>
              <span className="text-emerald-700 font-bold">Verified Direct</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm py-1 border-b border-slate-200">
                <span className="text-slate-500">Standard Branded MRP</span>
                <span className="line-through text-slate-400 font-mono">
                  ₹{(MEDICINE_DETAILS.mrpReference * packMultiplier).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm py-1 border-b border-slate-200">
                <span className="text-slate-800 font-semibold">MediWise Local Generic</span>
                <span className="text-lg font-bold text-emerald-600 font-mono">
                  ₹{(112.50 * packMultiplier).toFixed(2)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-100/60 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>You save ₹{((MEDICINE_DETAILS.mrpReference - 112.50) * packMultiplier).toFixed(2)} ({Math.round(selectedPackOption.unitDiscount * 100)}% discount)</span>
              </div>
            </div>

            <div className="pt-1">
              <button 
                id="ask-noor-question-btn"
                onClick={onOpenNoorChat}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ask Noor AI about generic bioequivalence</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Pharmacy Offers Comparison */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight font-sans flex items-center gap-2">
              <span>Verified Local Pharmacy Stock</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-300">
                Indiranagar, Bengaluru
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare direct live offers from licensed physical retail pharmacies within your micro-fulfillment radius.
            </p>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>All 3 hubs hold valid Form 20B/21B retail drug licenses</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PHARMACY_OFFERS.map((offer) => {
            const calculatedPrice = (offer.discountedPrice * packMultiplier).toFixed(2);
            const calculatedMrp = (offer.mrp * packMultiplier).toFixed(2);
            const calculatedSavings = ((offer.mrp - offer.discountedPrice) * packMultiplier).toFixed(2);
            const isSelected = selectedOfferId === offer.id;

            return (
              <div
                key={offer.id}
                id={`pharmacy-card-${offer.id}`}
                className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden bg-white shadow-xs ${
                  isSelected 
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg' 
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Pharmacy Header */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {offer.isRecommended && (
                        <span className="inline-block mb-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                          Best Price & Fastest SLA
                        </span>
                      )}
                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {offer.pharmacyName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {offer.distanceKm} km
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          {offer.slaMinutes} mins SLA
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-800">★ {offer.rating}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Hub #{offer.hubId.replace('HUB-', '')}</div>
                    </div>
                  </div>
                </div>

                {/* Stock & Batch Specifications */}
                <div className="p-5 space-y-4 grow">
                  {/* Price Block */}
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                        ₹{calculatedPrice}
                      </span>
                      <span className="text-xs text-slate-400 line-through font-mono">
                        ₹{calculatedMrp}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {offer.discountPercent}% OFF
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Per tablet: ₹{(offer.discountedPrice / 10).toFixed(2)} &bull; Total Savings: <strong className="text-emerald-700">₹{calculatedSavings}</strong>
                    </p>
                  </div>

                  {/* Verification Badges */}
                  <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        In-Store Physical Stock
                      </span>
                      <span className="font-semibold text-slate-900">{offer.stockUnits} units verified</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-teal-600" />
                        Active Batch #
                      </span>
                      <span className="font-mono text-slate-800">{offer.batchNumber}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                        Hologram Tamper-Seal
                      </span>
                      <span className="text-emerald-700 font-medium">Verified Active</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <FileBadge className="w-3.5 h-3.5 text-slate-500" />
                        CDSCO Retail License
                      </span>
                      <span className="font-mono text-[11px] text-slate-700">{offer.licenseNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                  <button
                    id={`select-offer-btn-${offer.id}`}
                    onClick={() => {
                      setSelectedOfferId(offer.id);
                      onSelectPharmacy(offer, selectedPack);
                    }}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>Proceed with {offer.pharmacyName.split(' ')[0]}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mandatory Rx Compliance Protocol Box */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Mandatory Schedule H1 Tele-Verification Protocol
            </h4>
            <p className="text-xs text-slate-400">
              Under the Drugs & Cosmetics Act, 1940 & Pharmacy Practice Regulations:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <div className="font-bold text-slate-100 mb-1">1. Digital Rx Tele-Audit</div>
            <p className="text-slate-400 leading-relaxed">
              Every upload is verified by a state-registered pharmacist against prescriber registration databases before pick.
            </p>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <div className="font-bold text-slate-100 mb-1">2. Tamper-Evident Packaging</div>
            <p className="text-slate-400 leading-relaxed">
              Dispensed packs are sealed with a unique cryptographic hologram barcode recorded in the dispensary register.
            </p>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <div className="font-bold text-slate-100 mb-1">3. Escrow Payment Guarantee</div>
            <p className="text-slate-400 leading-relaxed">
              Customer funds remain locked in escrow until the tamper-evident seal is verified at doorstep via one-time delivery OTP.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
