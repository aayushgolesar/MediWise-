import React, { useState, useMemo } from 'react';
import { MEDICINES_CATALOG } from '../data/mockData';
import { PharmacyOffer, Medicine } from '../types';
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  FileBadge, 
  TrendingDown, 
  Sparkles, 
  ChevronRight, 
  RefreshCw, 
  QrCode, 
  Search, 
  X, 
  Filter, 
  Pill, 
  Check, 
  SlidersHorizontal,
  ArrowRight,
  Package,
  Layers,
  HelpCircle,
  AlertTriangle,
  Building2
} from 'lucide-react';

interface MarketplaceViewProps {
  onSelectPharmacy: (offer: PharmacyOffer, packCount: number, medicine?: Medicine) => void;
  onOpenNoorChat: () => void;
  initialMedicineId?: string;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({ 
  onSelectPharmacy,
  onOpenNoorChat,
  initialMedicineId
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedSchedule, setSelectedSchedule] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'savings_desc'>('recommended');

  // Currently Selected Medicine for detailed view & offers
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>(
    initialMedicineId || MEDICINES_CATALOG[0].id
  );
  const [selectedPack, setSelectedPack] = useState<number>(30);
  const [selectedOfferId, setSelectedOfferId] = useState<string>('offer-medplus-indiranagar');
  const [heartbeatTime, setHeartbeatTime] = useState<string>('12 seconds ago');
  const [procurementRequested, setProcurementRequested] = useState<boolean>(false);

  // Active Medicine Object
  const currentMedicine = useMemo(() => {
    return MEDICINES_CATALOG.find(m => m.id === selectedMedicineId) || MEDICINES_CATALOG[0];
  }, [selectedMedicineId]);

  // Pack details
  const selectedPackOption = useMemo(() => {
    return currentMedicine.packOptions.find(p => p.count === selectedPack) || currentMedicine.packOptions[0];
  }, [currentMedicine, selectedPack]);

  const packMultiplier = (selectedPackOption?.count || 30) / 10;

  // Filter & Search Engine
  const filteredMedicines = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return MEDICINES_CATALOG.filter(med => {
      // Text Match
      const matchesText = !q || (
        med.brandName.toLowerCase().includes(q) ||
        med.genericName.toLowerCase().includes(q) ||
        med.strength.toLowerCase().includes(q) ||
        med.bioequivalentTo.toLowerCase().includes(q) ||
        med.category.toLowerCase().includes(q) ||
        med.therapeuticCategory.toLowerCase().includes(q) ||
        med.indications.some(ind => ind.toLowerCase().includes(q))
      );

      // Category Match
      const matchesCategory = selectedCategory === 'All' || med.category === selectedCategory;

      // Stock Match
      const matchesStock = !inStockOnly || med.inStock;

      // Schedule Match
      const matchesSchedule = selectedSchedule === 'All' || 
        (selectedSchedule === 'OTC' && med.schedule.includes('OTC')) ||
        (selectedSchedule === 'Rx' && !med.schedule.includes('OTC'));

      return matchesText && matchesCategory && matchesStock && matchesSchedule;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') {
        return a.startingPrice - b.startingPrice;
      }
      if (sortBy === 'savings_desc') {
        return b.discountPercent - a.discountPercent;
      }
      return 0; // recommended natural order
    });
  }, [searchQuery, selectedCategory, inStockOnly, selectedSchedule, sortBy]);

  // Quick Search Chips
  const popularSearches = [
    'Atorvastatin',
    'Metformin',
    'Telmisartan',
    'Pantoprazole',
    'Paracetamol',
    'Amoxicillin',
    'Rosuvastatin',
    'Montelukast',
    'Cetirizine',
    'Vitamin D3'
  ];

  const categories = [
    'All',
    'Cardiovascular',
    'Diabetes',
    'Antibiotics',
    'Gastrointestinal',
    'Pain & Fever',
    'Respiratory',
    'Vitamins & Supplements'
  ];

  const handleSelectMedicine = (med: Medicine) => {
    setSelectedMedicineId(med.id);
    setSelectedPack(med.packOptions[0]?.count || 10);
    if (med.pharmacyOffers.length > 0) {
      setSelectedOfferId(med.pharmacyOffers[0].id);
    }
  };

  const handleRefreshFeed = () => {
    setHeartbeatTime('Just now (Ingestion Revalidated)');
  };

  const isSearchActive = searchQuery.trim().length > 0;
  const isPresent = filteredMedicines.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Telemetry & Anti-Stale Governance Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl text-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">Catalog Governance &amp; Anti-Stale Stock Protection</h3>
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

      {/* MEDICINE SEARCH & DISCOVERY STATION */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-sans flex items-center gap-2">
                <span>Medicine Search &amp; Price Comparison</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  CDSCO Verified Formulations
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Type the brand name, active salt, generic formulation, or health condition to check real-time availability across local pharmacy micro-hubs.
              </p>
            </div>

            {/* In-Stock Filter Toggle */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </div>

          {/* Interactive Search Input Box */}
          <div className="mt-4 relative">
            <div className="relative flex items-center">
              <input
                id="medicine-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicine by Brand (e.g. Lipitor, Dolo, Glucophage) or Generic Salt (e.g. Atorvastatin, Metformin, Pantoprazole)..."
                className="w-full pl-11 pr-24 py-3.5 bg-slate-50 border border-slate-300 hover:border-slate-400 focus:border-emerald-500 focus:bg-white rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition shadow-inner"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
              
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-12 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <div className="absolute right-3 hidden sm:flex items-center">
                <span className="text-[11px] font-mono text-slate-400 bg-slate-200/70 px-2 py-0.5 rounded">
                  ESC to clear
                </span>
              </div>
            </div>

            {/* Instant Search Status & Present / Not Present Indicator */}
            {isSearchActive && (
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">
                    Query: <strong className="text-slate-900">"{searchQuery}"</strong>
                  </span>
                  <span>&bull;</span>
                  {isPresent ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>PRESENT &bull; {filteredMedicines.length} Formulation{filteredMedicines.length > 1 ? 's' : ''} Found</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>NOT PRESENT IN CURRENT LOCAL INVENTORY</span>
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400">
                  Showing {filteredMedicines.length} of {MEDICINES_CATALOG.length} catalog items
                </div>
              </div>
            )}
          </div>

          {/* Quick-Search Chips */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-bold uppercase text-slate-400 whitespace-nowrap mr-1">
              Popular:
            </span>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className={`px-2.5 py-1 rounded-lg border text-xs whitespace-nowrap transition cursor-pointer ${
                  searchQuery.toLowerCase() === term.toLowerCase()
                    ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                    : 'bg-slate-100/70 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                {term}
              </button>
            ))}
          </div>

          {/* Filter Bar: Category, Schedule & Sort */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-slate-400 font-medium whitespace-nowrap">Category:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSchedule}
                onChange={(e) => setSelectedSchedule(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="All">All Rx Schedules</option>
                <option value="Rx">Rx Required (Schedule H/H1)</option>
                <option value="OTC">Over The Counter (OTC)</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="recommended">Sort: Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="savings_desc">Highest Discount %</option>
              </select>
            </div>
          </div>
        </div>

        {/* NOT PRESENT (EMPTY SEARCH RESULT) VIEW */}
        {!isPresent && isSearchActive && (
          <div className="p-6 sm:p-8 rounded-2xl bg-amber-50/60 border border-amber-200 text-slate-800 space-y-4 animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900">
                    "{searchQuery}" is currently not present in local pharmacy hubs
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                    Zero Physical Stock Nearby
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                  We checked 142 licensed micro-hubs in Bengaluru. This specific brand name or formulation could not be found with active real-time POS stock.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-amber-200/80 space-y-3">
              <div className="text-xs font-bold text-slate-900">
                Recommended Actions &amp; Alternatives:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 block">1. Check Active Salt</span>
                  <p className="text-[11px] text-slate-500">
                    Try searching for the generic chemical name or composition rather than the proprietary trade name.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 block">2. Ask Noor 24/7 AI</span>
                  <p className="text-[11px] text-slate-500">
                    Consult our clinical AI to check for therapeutic equivalent alternatives approved by CDSCO.
                  </p>
                  <button
                    onClick={onOpenNoorChat}
                    className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Ask Noor Now</span>
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 block">3. Request Hub Ingestion</span>
                  <p className="text-[11px] text-slate-500">
                    Trigger an automated procurement dispatch request to licensed OEM distributors.
                  </p>
                  <button
                    onClick={() => setProcurementRequested(true)}
                    className="text-[11px] font-bold text-cyan-700 hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                  >
                    <Building2 className="w-3 h-3" />
                    <span>{procurementRequested ? 'Request Sent ✓' : 'Notify Local Hubs'}</span>
                  </button>
                </div>
              </div>

              {procurementRequested && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Procurement alert broadcasted to 3 nearby hubs. You will receive an SMS when stock is updated.</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setSearchQuery('')}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
              >
                Reset Search &amp; View All In-Stock Medicines
              </button>
            </div>
          </div>
        )}

        {/* MEDICINE CATALOG CARDS GRID (When Present) */}
        {isPresent && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span className="font-bold uppercase tracking-wider text-slate-600">
                Available Medicines in Catalog ({filteredMedicines.length})
              </span>
              <span>Click a card to inspect live local pharmacy offers</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredMedicines.map((med) => {
                const isSelected = med.id === selectedMedicineId;

                return (
                  <div
                    key={med.id}
                    id={`medicine-card-${med.id}`}
                    onClick={() => handleSelectMedicine(med)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Header Chips */}
                    <div>
                      <div className="flex items-center justify-between gap-1.5 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {med.category}
                        </span>
                        
                        {med.inStock ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            <span>{med.stockCount} in stock</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                            <span>Out of Stock</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                        {med.brandName}
                      </h3>

                      <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        Generic: <strong className="text-slate-700">{med.genericName}</strong> ({med.strength})
                      </p>

                      <div className="mt-2 text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60 inline-flex items-center gap-1">
                        <FileBadge className="w-3 h-3" />
                        <span>Bioequivalent to {med.bioequivalentTo}</span>
                      </div>
                    </div>

                    {/* Bottom Pricing & Action */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400">Starting from</div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-black text-slate-900 font-mono">
                            ₹{med.startingPrice.toFixed(2)}
                          </span>
                          <span className="text-[11px] text-slate-400 line-through font-mono">
                            ₹{med.mrpReference.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700">
                            {med.discountPercent}% OFF
                          </span>
                        </div>
                      </div>

                      <div className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                      }`}>
                        <span>{isSelected ? 'Viewing' : 'Select'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SELECTED MEDICINE SPECIFICATION & BENCHMARK HERO */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                currentMedicine.schedule.includes('OTC')
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {currentMedicine.schedule}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                <FileBadge className="w-3.5 h-3.5" />
                100% Bioequivalent to {currentMedicine.bioequivalentTo}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                CDSCO Form 28 / GMP Certified
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                {currentMedicine.inStock ? `${currentMedicine.stockCount} Units across ${currentMedicine.hubCount} Hubs` : 'Zero Stock in Hubs'}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                {currentMedicine.brandName}
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Generic Composition: <strong className="text-slate-800 font-semibold">{currentMedicine.genericName}</strong> ({currentMedicine.strength}) &bull; {currentMedicine.dosageForm}
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              {currentMedicine.description}
            </p>

            {/* Indications Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Therapeutic Indications:</span>
              {currentMedicine.indications.map((ind, idx) => (
                <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                  {ind}
                </span>
              ))}
            </div>

            {/* Pack Size Selector */}
            <div className="pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Select Dispense Quantity (Pack Size)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {currentMedicine.packOptions.map((opt) => (
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
          <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>National Price Comparison</span>
              <span className="text-emerald-700 font-bold">Verified Direct</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm py-1 border-b border-slate-200">
                <span className="text-slate-500">Standard Branded MRP</span>
                <span className="line-through text-slate-400 font-mono">
                  ₹{(currentMedicine.mrpReference * packMultiplier).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm py-1 border-b border-slate-200">
                <span className="text-slate-800 font-semibold">MediWise Local Generic</span>
                <span className="text-lg font-bold text-emerald-600 font-mono">
                  ₹{(currentMedicine.startingPrice * packMultiplier).toFixed(2)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-100/60 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  You save ₹{((currentMedicine.mrpReference - currentMedicine.startingPrice) * packMultiplier).toFixed(2)} ({Math.round(selectedPackOption.unitDiscount * 100)}% discount)
                </span>
              </div>
            </div>

            <div className="pt-1">
              <button 
                id="ask-noor-question-btn"
                onClick={onOpenNoorChat}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ask Noor AI about {currentMedicine.genericName}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VERIFIED LOCAL PHARMACY OFFERS COMPARISON */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight font-sans flex items-center gap-2">
              <span>Verified Local Pharmacy Stock for {currentMedicine.brandName}</span>
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
            <span>All micro-hubs hold valid Form 20B/21B retail drug licenses</span>
          </div>
        </div>

        {/* If no active offers for this medicine */}
        {currentMedicine.pharmacyOffers.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">
              No Physical Hub Stock Currently Available for this Formulation
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              This medication is currently on statutory backorder or subject to special cold-chain requisition.
            </p>
            <button
              onClick={() => setProcurementRequested(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
            >
              {procurementRequested ? 'Procurement Notification Logged ✓' : 'Notify Me When Restocked'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {currentMedicine.pharmacyOffers.map((offer) => {
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
                            Best Price &amp; Fastest SLA
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
                        Per pack unit: ₹{(offer.discountedPrice / 10).toFixed(2)} &bull; Total Savings: <strong className="text-emerald-700">₹{calculatedSavings}</strong>
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
                        onSelectPharmacy(offer, selectedPack, currentMedicine);
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
        )}
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
              Under the Drugs &amp; Cosmetics Act, 1940 &amp; Pharmacy Practice Regulations:
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
