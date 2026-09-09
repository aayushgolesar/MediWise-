import React, { useState } from 'react';
import { AppRole, PharmacyOffer, AuthUser, Medicine } from './types';
import { Header } from './components/Header';
import { MarketplaceView } from './components/MarketplaceView';
import { CheckoutView } from './components/CheckoutView';
import { OrderTrackingView } from './components/OrderTrackingView';
import { PartnerPortalView } from './components/PartnerPortalView';
import { QuarantineConsoleView } from './components/QuarantineConsoleView';
import { ReassignmentEngineView } from './components/ReassignmentEngineView';
import { DisputeConsoleView } from './components/DisputeConsoleView';
import { SuperAdminView } from './components/SuperAdminView';
import { OemPortalView } from './components/OemPortalView';
import { NoorModerationView } from './components/NoorModerationView';
import { AuthView } from './components/AuthView';
import { AskNoorWidget } from './components/AskNoorWidget';
import { ToastContainer } from './components/ToastContainer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { showSuccessToast, showInfoToast } from './utils/toastStore';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<AppRole>('marketplace');
  const [selectedOffer, setSelectedOffer] = useState<PharmacyOffer | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [packCount, setPackCount] = useState<number>(30);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isNoorChatOpen, setIsNoorChatOpen] = useState<boolean>(false);

  // Authentication State: Defaults to null so Login page appears first
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'register'>('signin');

  const handleOpenAuth = (mode: 'signin' | 'register' = 'signin') => {
    setAuthInitialMode(mode);
    setCurrentRole('auth');
  };

  const handleLoginSuccess = (user: AuthUser, targetRole?: AppRole) => {
    setCurrentUser(user);
    showSuccessToast(`Accessing ${user.role.toUpperCase()} workspace...`, `Welcome, ${user.name}`);
    if (targetRole) {
      setCurrentRole(targetRole);
    } else {
      if (user.role === 'pharmacist') setCurrentRole('partner_portal');
      else if (user.role === 'admin') setCurrentRole('super_admin');
      else if (user.role === 'oem') setCurrentRole('oem_portal');
      else setCurrentRole('marketplace');
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    showInfoToast('Signed out successfully. Please sign in to access MediWise.', 'Session Ended');
    setCurrentRole('auth');
    setAuthInitialMode('signin');
  };

  const handleSelectPharmacy = (offer: PharmacyOffer, pack: number, medicine?: Medicine) => {
    setSelectedOffer(offer);
    setPackCount(pack);
    if (medicine) {
      setSelectedMedicine(medicine);
    }
    setCurrentRole('checkout');
  };

  const handleOrderPlaced = (orderId: string) => {
    setActiveOrderId(orderId);
    setCurrentRole('tracking');
  };

  // If user is not authenticated, show ONLY the Login / Registration screen first
  if (!currentUser) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative">
          {/* Global Toast Notifications */}
          <ToastContainer />

          {/* Dedicated Login Screen Header */}
          <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg text-white tracking-tight">MediWise</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      CDSCO Gateway
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Generic Medicine Price Parity &amp; Clearinghouse</p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Secure Access Gateway
                </span>
                <span className="text-slate-600">&bull;</span>
                <span>TLS 1.3 Strict</span>
              </div>
            </div>
          </header>

          {/* Standalone Login / Registration Container */}
          <main className="grow flex items-center justify-center py-10 px-4 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
            <div className="w-full max-w-7xl">
              <AuthView
                onLoginSuccess={handleLoginSuccess}
                initialMode={authInitialMode}
                initialRole="patient"
                isMandatoryAuth={true}
              />
            </div>
          </main>

          {/* Security / Compliance Footer */}
          <footer className="bg-slate-950 border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>&copy; {new Date().getFullYear()} MediWise Healthcare Technologies Inc. All rights reserved.</span>
              <span className="text-[11px] text-slate-500">
                Statutory verification enforced under Drugs &amp; Cosmetics Act, 1940 &bull; DISHA Health Privacy Standards
              </span>
            </div>
          </footer>
        </div>
      </ErrorBoundary>
    );
  }

  // Once authenticated, load the full site within ErrorBoundary & ToastContainer!
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative">
        {/* Global Toast Notifications */}
        <ToastContainer />

        {/* Header Navigation Bar */}
        <Header 
          currentRole={currentRole}
          onSelectRole={setCurrentRole}
          onOpenNoorChat={() => setIsNoorChatOpen(true)}
          currentUser={currentUser}
          onOpenAuth={handleOpenAuth}
          onSignOut={handleSignOut}
        />

        {/* Main Role-Based Content Area */}
        <main className="grow pb-16">
          <ErrorBoundary onReset={() => setCurrentRole('marketplace')}>
            {currentRole === 'auth' && (
              <AuthView
                onLoginSuccess={handleLoginSuccess}
                onNavigateMarketplace={() => setCurrentRole('marketplace')}
                initialMode={authInitialMode}
                initialRole={currentUser?.role || 'patient'}
              />
            )}

            {currentRole === 'marketplace' && (
              <MarketplaceView
                onSelectPharmacy={handleSelectPharmacy}
                onOpenNoorChat={() => setIsNoorChatOpen(true)}
                initialMedicineId={selectedMedicine?.id}
              />
            )}

            {currentRole === 'checkout' && (
              <CheckoutView
                selectedOffer={selectedOffer}
                packCount={packCount}
                selectedMedicine={selectedMedicine}
                onBackToMarketplace={() => setCurrentRole('marketplace')}
                onOrderPlaced={handleOrderPlaced}
              />
            )}

            {currentRole === 'tracking' && (
              <OrderTrackingView
                orderId={activeOrderId}
                onOpenDispute={() => setCurrentRole('dispute_console')}
                onOpenNoorChat={() => setIsNoorChatOpen(true)}
              />
            )}

            {currentRole === 'partner_portal' && (
              <PartnerPortalView
                onNavigateToTracking={() => setCurrentRole('tracking')}
              />
            )}

            {currentRole === 'quarantine_console' && (
              <QuarantineConsoleView />
            )}

            {currentRole === 'reassignment_engine' && (
              <ReassignmentEngineView />
            )}

            {currentRole === 'dispute_console' && (
              <DisputeConsoleView />
            )}

            {currentRole === 'super_admin' && (
              <SuperAdminView />
            )}

            {currentRole === 'oem_portal' && (
              <OemPortalView />
            )}

            {currentRole === 'noor_moderation' && (
              <NoorModerationView />
            )}
          </ErrorBoundary>
        </main>

        {/* Global Floating "Ask Noor" Launcher Button */}
        {!isNoorChatOpen && (
          <button
            id="floating-ask-noor-btn"
            onClick={() => setIsNoorChatOpen(true)}
            className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-2xl border border-slate-700 flex items-center gap-2 text-xs font-bold transition transform hover:scale-105 cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Ask Noor 24/7 Rx AI</span>
          </button>
        )}

        {/* Floating Ask Noor AI Chat Drawer / Widget */}
        <AskNoorWidget
          isOpen={isNoorChatOpen}
          onClose={() => setIsNoorChatOpen(false)}
        />

        {/* Footer */}
        <footer className="bg-slate-900 border-t border-slate-800 py-6 px-4 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">MediWise Multi-Tenant SaaS Platform v2.0</span>
              <span>&bull;</span>
              <span>Licensed Physical Micro-Hub Fulfillment</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Compliant with Drugs &amp; Cosmetics Act, 1940 &bull; CDSCO Form 20B/21B &bull; DISHA Health Data Privacy Standards
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
