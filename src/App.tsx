import React, { useState } from 'react';
import { AppRole, PharmacyOffer, AuthUser } from './types';
import { PHARMACY_OFFERS } from './data/mockData';
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
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<AppRole>('marketplace');
  const [selectedOffer, setSelectedOffer] = useState<PharmacyOffer | null>(PHARMACY_OFFERS[0]);
  const [packCount, setPackCount] = useState<number>(30);
  const [isNoorChatOpen, setIsNoorChatOpen] = useState<boolean>(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>({
    id: 'usr-pat-01',
    name: 'Anika Sharma',
    email: 'anika.sharma@example.com',
    phone: '+91 98841 20492',
    role: 'patient',
    abhaId: '91-4821-9920-1123@abdm',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  });
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'register'>('signin');
  const [authToast, setAuthToast] = useState<string | null>(null);

  const handleOpenAuth = (mode: 'signin' | 'register' = 'signin') => {
    setAuthInitialMode(mode);
    setCurrentRole('auth');
  };

  const handleLoginSuccess = (user: AuthUser, targetRole?: AppRole) => {
    setCurrentUser(user);
    setAuthToast(`Authenticated as ${user.name} (${user.role.toUpperCase()})`);
    setTimeout(() => setAuthToast(null), 4000);
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
    setAuthToast('Signed out successfully. Switched to guest mode.');
    setTimeout(() => setAuthToast(null), 3500);
    setCurrentRole('auth');
    setAuthInitialMode('signin');
  };

  const handleSelectPharmacy = (offer: PharmacyOffer, pack: number) => {
    setSelectedOffer(offer);
    setPackCount(pack);
    setCurrentRole('checkout');
  };

  const handleOrderPlaced = (orderId: string) => {
    setCurrentRole('tracking');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {authToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{authToast}</span>
        </div>
      )}

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
          />
        )}

        {currentRole === 'checkout' && (
          <CheckoutView
            selectedOffer={selectedOffer}
            packCount={packCount}
            onBackToMarketplace={() => setCurrentRole('marketplace')}
            onOrderPlaced={handleOrderPlaced}
          />
        )}

        {currentRole === 'tracking' && (
          <OrderTrackingView
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
  );
}
