import React, { useState } from 'react';
import { AppRole, AuthUser } from '../types';
import { 
  ShieldCheck, 
  Store, 
  FileText, 
  Truck, 
  Building2, 
  AlertTriangle, 
  Clock, 
  Scale, 
  Server, 
  Factory, 
  Bot,
  Activity,
  Sparkles,
  User,
  KeyRound,
  LogOut,
  ChevronDown,
  UserPlus
} from 'lucide-react';

interface HeaderProps {
  currentRole: AppRole;
  onSelectRole: (role: AppRole) => void;
  onOpenNoorChat: () => void;
  currentUser: AuthUser | null;
  onOpenAuth: (mode?: 'signin' | 'register') => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentRole, 
  onSelectRole, 
  onOpenNoorChat,
  currentUser,
  onOpenAuth,
  onSignOut
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'pharmacist':
        return 'bg-cyan-950 text-cyan-300 border-cyan-500/40';
      case 'admin':
        return 'bg-purple-950 text-purple-300 border-purple-500/40';
      case 'oem':
        return 'bg-blue-950 text-blue-300 border-blue-500/40';
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xl">
      {/* Top Banner: Clinical Compliance & Telemetry ribbon */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 px-4 py-1 text-xs text-slate-300 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-emerald-400 font-semibold tracking-wide">CDSCO COMPLIANT ENGINE</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">Schedule H1 Strict Rx Verification Active</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">Multi-Tenant PostgreSQL Isolation: <strong className="text-emerald-300">142 Hubs Online</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 hidden md:inline">Offer Freshness: <strong className="text-cyan-400">96.8%</strong> (Heartbeat &lt; 3m)</span>
          <button 
            id="header-open-noor-btn"
            onClick={onOpenNoorChat}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>24/7 Rx AI Noor</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Logo & Brand Identity */}
        <div className="flex items-center justify-between">
          <div 
            onClick={() => onSelectRole('marketplace')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white font-sans">Medi<span className="text-emerald-400">Wise</span></span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-emerald-500/30">
                  SaaS V2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Generic Medicine Price Parity & Clearinghouse</p>
            </div>
          </div>

          {/* Quick User Actions / Auth on Mobile & Small screens */}
          <div className="lg:hidden flex items-center gap-2">
            {currentUser ? (
              <button
                onClick={() => onOpenAuth('signin')}
                className="text-xs bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-slate-200 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold max-w-[90px] truncate">{currentUser.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth('signin')}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-lg text-slate-950 font-bold flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3" />
                <span>Login</span>
              </button>
            )}
            <button 
              onClick={() => onSelectRole('tracking')}
              className="text-xs bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-emerald-400 flex items-center gap-1"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>#MW-89421</span>
            </button>
          </div>
        </div>

        {/* Console / Role Navigation Tabs + User Account Desk */}
        <div className="flex items-center gap-2 justify-between lg:justify-end">
          <nav className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-thin">
            <button
              id="nav-tab-marketplace"
              onClick={() => onSelectRole('marketplace')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                currentRole === 'marketplace'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Marketplace</span>
            </button>

            <button
              id="nav-tab-checkout"
              onClick={() => onSelectRole('checkout')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                currentRole === 'checkout'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Rx Checkout</span>
            </button>

            <button
              id="nav-tab-tracking"
              onClick={() => onSelectRole('tracking')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                currentRole === 'tracking'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Live Order</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>

            <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block"></div>

            <button
              id="nav-tab-partner"
              onClick={() => onSelectRole('partner_portal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                currentRole === 'partner_portal'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hub KA-1204</span>
            </button>

            <button
              id="nav-tab-quarantine"
              onClick={() => onSelectRole('quarantine_console')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                currentRole === 'quarantine_console'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Quarantine</span>
            </button>

            <button
              id="nav-tab-reassignment"
              onClick={() => onSelectRole('reassignment_engine')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                currentRole === 'reassignment_engine'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>SLA Engine</span>
            </button>

            <button
              id="nav-tab-dispute"
              onClick={() => onSelectRole('dispute_console')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                currentRole === 'dispute_console'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-rose-400" />
              <span>Disputes</span>
            </button>

            <button
              id="nav-tab-superadmin"
              onClick={() => onSelectRole('super_admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                currentRole === 'super_admin'
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-purple-400" />
              <span>Super Admin</span>
            </button>

            <button
              id="nav-tab-oem"
              onClick={() => onSelectRole('oem_portal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                currentRole === 'oem_portal'
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Factory className="w-3.5 h-3.5 text-blue-400" />
              <span>Cipla OEM</span>
            </button>

            <button
              id="nav-tab-noor-mod"
              onClick={() => onSelectRole('noor_moderation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                currentRole === 'noor_moderation'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-teal-400" />
              <span>Noor Mod</span>
            </button>

            {/* Dedicated Login & Register Screen Tab */}
            <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block"></div>

            <button
              id="nav-tab-auth"
              onClick={() => onOpenAuth('signin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                currentRole === 'auth'
                  ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-700/60'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span>Login / Register</span>
            </button>
          </nav>

          {/* User Account / Profile Widget (Desktop) */}
          <div className="relative hidden lg:block ml-2">
            {currentUser ? (
              <div className="relative">
                <button
                  id="user-profile-menu-button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-bold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100 flex items-center gap-1">
                      <span className="max-w-[120px] truncate">{currentUser.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      {currentUser.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 space-y-2 z-50 text-xs animate-fadeIn"
                    onMouseLeave={() => setShowUserDropdown(false)}
                  >
                    <div className="pb-2 border-b border-slate-800">
                      <div className="font-bold text-white text-xs">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                      <div className="text-[10px] text-emerald-400 mt-0.5">{currentUser.phone}</div>
                      {currentUser.abhaId && (
                        <div className="mt-1 text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                          ABHA: {currentUser.abhaId}
                        </div>
                      )}
                      {currentUser.pharmacyHubName && (
                        <div className="mt-1 text-[10px] text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                          {currentUser.pharmacyHubName}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenAuth('signin');
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2 transition cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Switch Account / Persona</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenAuth('register');
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2 transition cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-teal-400" />
                      <span>Register Another Entity</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onSignOut();
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-rose-950/50 text-rose-300 flex items-center gap-2 transition cursor-pointer border-t border-slate-800/80"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Sign Out (Switch to Guest)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 border border-slate-700"
                >
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

