import React, { useState } from 'react';
import { AuthUser, UserRole, AppRole } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  Building2, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  KeyRound, 
  Activity, 
  QrCode, 
  Check, 
  ChevronRight,
  Shield,
  HelpCircle
} from 'lucide-react';

interface AuthViewProps {
  onLoginSuccess: (user: AuthUser, defaultRole?: AppRole) => void;
  onNavigateMarketplace?: () => void;
  initialMode?: 'signin' | 'register';
  initialRole?: UserRole;
  isMandatoryAuth?: boolean;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLoginSuccess,
  onNavigateMarketplace,
  initialMode = 'signin',
  initialRole = 'patient',
  isMandatoryAuth = false
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  
  // Password Visibility
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Sign In State
  const [loginIdentifier, setLoginIdentifier] = useState<string>('anika.sharma@example.com');
  const [loginPassword, setLoginPassword] = useState<string>('••••••••••••');
  const [otpPhone, setOtpPhone] = useState<string>('9884120492');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Register State - Patient
  const [regName, setRegName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regAbhaId, setRegAbhaId] = useState<string>('');
  const [regAddress, setRegAddress] = useState<string>('Indiranagar, Bengaluru');
  const [regPincode, setRegPincode] = useState<string>('560038');

  // Register State - Pharmacy
  const [pharmacyName, setPharmacyName] = useState<string>('');
  const [pharmacistName, setPharmacistName] = useState<string>('');
  const [councilRegNo, setCouncilRegNo] = useState<string>('');
  const [cdscoLicense, setCdscoLicense] = useState<string>('');
  const [hubLocality, setHubLocality] = useState<string>('Koramangala 5th Block');
  const [posIntegration, setPosIntegration] = useState<string>('Marg ERP POS');

  // Compliance Checkbox
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [abhaValidated, setAbhaValidated] = useState<boolean>(false);

  // Quick Demo Personas
  const demoPersonas: {
    title: string;
    role: UserRole;
    name: string;
    detail: string;
    user: AuthUser;
    targetRole: AppRole;
  }[] = [
    {
      title: 'Patient / Consumer',
      role: 'patient',
      name: 'Anika Sharma',
      detail: 'Indiranagar BLR • ABHA Linked • Rx Wallet',
      targetRole: 'marketplace',
      user: {
        id: 'usr-pat-01',
        name: 'Anika Sharma',
        email: 'anika.sharma@example.com',
        phone: '+91 98841 20492',
        role: 'patient',
        abhaId: '91-4821-9920-1123@abdm',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
      }
    },
    {
      title: 'Licensed Pharmacist Hub',
      role: 'pharmacist',
      name: 'K. Ramesh, B.Pharm',
      detail: 'MedPlus Hub KA-1204 • CDSCO Form 20B Verified',
      targetRole: 'partner_portal',
      user: {
        id: 'usr-pharma-01',
        name: 'K. Ramesh, B.Pharm',
        email: 'ramesh.k@medplusindia.com',
        phone: '+91 94481 02931',
        role: 'pharmacist',
        pharmacyHubName: 'MedPlus Central Indiranagar (Hub KA-1204)',
        pharmacistRegNo: 'KSPC-48192-A',
        cdscoLicense: 'KA-BLR-20B-10928'
      }
    },
    {
      title: 'Super Admin Ops',
      role: 'admin',
      name: 'Dr. Vikram Roy',
      detail: 'Clearinghouse Officer • DISHA Audit Access',
      targetRole: 'super_admin',
      user: {
        id: 'usr-admin-01',
        name: 'Dr. Vikram Roy',
        email: 'admin.roy@mediwise.health',
        phone: '+91 98110 55432',
        role: 'admin'
      }
    },
    {
      title: 'OEM Pharma Manufacturer',
      role: 'oem',
      name: 'Rajiv Mehta',
      detail: 'Cipla Ltd. • Batch Serialization & Recall Lead',
      targetRole: 'oem_portal',
      user: {
        id: 'usr-oem-01',
        name: 'Rajiv Mehta',
        email: 'rajiv.mehta@cipla.com',
        phone: '+91 99201 44819',
        role: 'oem'
      }
    }
  ];

  const handleQuickLogin = (persona: typeof demoPersonas[0]) => {
    setLoading(true);
    setErrorMsg(null);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(persona.user, persona.targetRole);
    }, 400);
  };

  const handleSendOtp = () => {
    if (!otpPhone || otpPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setOtpCode('492188'); // simulated auto-fill hint
    }, 600);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (loginMethod === 'otp') {
      if (!otpSent) {
        handleSendOtp();
        return;
      }
      if (!otpCode || otpCode.length < 4) {
        setErrorMsg('Please enter the verification code sent to your phone.');
        return;
      }
    } else {
      if (!loginIdentifier.trim()) {
        setErrorMsg('Please enter your email or mobile number.');
        return;
      }
      if (!loginPassword.trim()) {
        setErrorMsg('Please enter your account password.');
        return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Construct user according to role
      const defaultUser: AuthUser = {
        id: `usr-${Date.now()}`,
        name: selectedRole === 'patient' 
          ? 'Anika Sharma' 
          : selectedRole === 'pharmacist' 
          ? 'K. Ramesh, B.Pharm' 
          : selectedRole === 'admin' 
          ? 'Dr. Vikram Roy' 
          : 'Cipla Enterprise Rep',
        email: loginIdentifier.includes('@') ? loginIdentifier : `${loginIdentifier}@mediwise.health`,
        phone: loginMethod === 'otp' ? `+91 ${otpPhone}` : '+91 98841 20492',
        role: selectedRole,
        abhaId: selectedRole === 'patient' ? '91-4821-9920-1123@abdm' : undefined,
        pharmacyHubName: selectedRole === 'pharmacist' ? 'MedPlus Central Indiranagar (Hub KA-1204)' : undefined,
        pharmacistRegNo: selectedRole === 'pharmacist' ? 'KSPC-48192-A' : undefined,
        cdscoLicense: selectedRole === 'pharmacist' ? 'KA-BLR-20B-10928' : undefined
      };

      const targetRole: AppRole = 
        selectedRole === 'patient' ? 'marketplace' :
        selectedRole === 'pharmacist' ? 'partner_portal' :
        selectedRole === 'admin' ? 'super_admin' : 'oem_portal';

      onLoginSuccess(defaultUser, targetRole);
    }, 500);
  };

  const handleValidateAbha = () => {
    if (!regAbhaId.trim()) {
      setErrorMsg('Please enter an ABHA Health ID or 14-digit number to validate.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAbhaValidated(true);
      setErrorMsg(null);
    }, 500);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!agreedToTerms) {
      setErrorMsg('You must acknowledge DISHA privacy and statutory compliance terms.');
      return;
    }

    if (selectedRole === 'patient') {
      if (!regName.trim()) {
        setErrorMsg('Please enter your full name as per Government photo ID.');
        return;
      }
      if (!regPhone.trim() || regPhone.length < 10) {
        setErrorMsg('Please enter a valid 10-digit mobile number.');
        return;
      }
      if (!regPassword || regPassword.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (regPassword !== regConfirmPassword) {
        setErrorMsg('Passwords do not match. Please verify.');
        return;
      }
    } else if (selectedRole === 'pharmacist') {
      if (!pharmacyName.trim() || !pharmacistName.trim() || !councilRegNo.trim() || !cdscoLicense.trim()) {
        setErrorMsg('All statutory fields (Pharmacy Name, In-Charge Pharmacist, Council Reg, CDSCO License) are required.');
        return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const newUser: AuthUser = {
        id: `usr-${Date.now()}`,
        name: selectedRole === 'patient' ? regName : pharmacistName || 'Hub Administrator',
        email: regEmail || `${regPhone}@mediwise.health`,
        phone: `+91 ${regPhone || '9884120492'}`,
        role: selectedRole,
        abhaId: regAbhaId ? regAbhaId : undefined,
        pharmacyHubName: selectedRole === 'pharmacist' ? pharmacyName : undefined,
        pharmacistRegNo: selectedRole === 'pharmacist' ? councilRegNo : undefined,
        cdscoLicense: selectedRole === 'pharmacist' ? cdscoLicense : undefined
      };

      const targetRole: AppRole = 
        selectedRole === 'patient' ? 'marketplace' :
        selectedRole === 'pharmacist' ? 'partner_portal' :
        selectedRole === 'admin' ? 'super_admin' : 'oem_portal';

      onLoginSuccess(newUser, targetRole);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Breadcrumb & Status Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              IDENTITY &amp; ACCESS MANAGEMENT (IAM)
            </span>
            <span className="text-xs text-slate-400">ABDM M3 &bull; CDSCO Form 20B/21B Verified</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1 font-sans">
            MediWise Portal Authentication
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Single Sign-On (SSO) gateway for Patients, Licensed Pharmacy Micro-Hubs, Compliance Administrators, and OEM Manufacturers.
          </p>
        </div>

        <button
          onClick={onNavigateMarketplace}
          className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
        >
          <span>Explore Public Marketplace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Auth Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Top Main Mode Tabs: Sign In vs Register */}
          <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              id="auth-tab-signin"
              onClick={() => { setAuthMode('signin'); setErrorMsg(null); }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>Sign In to Account</span>
            </button>
            <button
              id="auth-tab-register"
              onClick={() => { setAuthMode('register'); setErrorMsg(null); }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                authMode === 'register'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 text-teal-400" />
              <span>Register New Entity</span>
            </button>
          </div>

          {/* Role Identity Selector Chips */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Select Your Access Authority / Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('patient')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  selectedRole === 'patient'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">🩺</span>
                  {selectedRole === 'patient' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <div className="font-bold text-xs text-slate-900">Patient</div>
                <div className="text-[10px] text-slate-500">Rx &amp; Escrow</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('pharmacist')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  selectedRole === 'pharmacist'
                    ? 'border-cyan-600 bg-cyan-50/60 ring-2 ring-cyan-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">💊</span>
                  {selectedRole === 'pharmacist' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />}
                </div>
                <div className="font-bold text-xs text-slate-900">Pharmacist</div>
                <div className="text-[10px] text-slate-500">Physical Hub</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  selectedRole === 'admin'
                    ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">🛡️</span>
                  {selectedRole === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                </div>
                <div className="font-bold text-xs text-slate-900">Super Admin</div>
                <div className="text-[10px] text-slate-500">PostgreSQL Ops</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('oem')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  selectedRole === 'oem'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">🏭</span>
                  {selectedRole === 'oem' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <div className="font-bold text-xs text-slate-900">Pharma OEM</div>
                <div className="text-[10px] text-slate-500">Cipla Portal</div>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mode 1: SIGN IN */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              {/* Method Switch: Password vs OTP */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs">
                <span className="text-slate-500 font-medium">Authentication Type:</span>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('password'); setOtpSent(false); }}
                  className={`px-3 py-1 rounded-lg transition font-semibold cursor-pointer ${
                    loginMethod === 'password'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Password Login
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('otp'); }}
                  className={`px-3 py-1 rounded-lg transition font-semibold cursor-pointer flex items-center gap-1 ${
                    loginMethod === 'otp'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Mobile OTP (Fast Login)</span>
                </button>
              </div>

              {loginMethod === 'password' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {selectedRole === 'patient' ? 'Email or Mobile Number' : 'Registered Work Email'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder={selectedRole === 'patient' ? 'e.g. anika.sharma@example.com or 9884120492' : 'e.g. ramesh.k@medplusindia.com'}
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">Account Password</label>
                      <button
                        type="button"
                        onClick={() => alert("Password reset link sent to your verified registered email/mobile under DISHA compliance.")}
                        className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your confidential password"
                        className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* OTP Phone & Verification Mode */
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      10-Digit Mobile Number (India +91)
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700">
                        🇮🇳 +91
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        value={otpPhone}
                        onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9884120492"
                        className="grow px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-mono tracking-wider focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      {!otpSent && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={loading}
                          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold whitespace-nowrap transition cursor-pointer"
                        >
                          Send OTP
                        </button>
                      )}
                    </div>
                  </div>

                  {otpSent && (
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between text-xs text-emerald-900">
                        <span className="font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>OTP Sent to +91 {otpPhone}</span>
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">Expires in 04:58</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Enter 6-Digit Secure OTP
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="492188"
                            className="grow px-3 py-2.5 border border-slate-300 rounded-xl text-center text-base font-mono font-bold tracking-widest bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setOtpCode('492188')}
                            className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-700 transition cursor-pointer"
                          >
                            Demo Auto-Fill
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Remember Me & Privacy */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Remember authentication on this device</span>
                </label>
              </div>

              {/* Sign In Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Verifying Authority &amp; License...</span>
                  </span>
                ) : (
                  <>
                    <span>Authenticate &amp; Launch Console</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Mode 2: REGISTER */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* If Patient Registration */}
              {selectedRole === 'patient' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Legal Name (as per Aadhaar/ABHA)
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Anika Sharma"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        10-Digit Mobile (for Delivery OTP)
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9884120492"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address (for Rx Audit Slips &amp; Tax Invoices)
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="anika.sharma@example.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* ABHA Health ID field with validation */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ABHA Health ID (Ayushman Bharat Digital Mission)</span>
                      </label>
                      <span className="text-[10px] text-slate-400">Optional / Recommended</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={regAbhaId}
                        onChange={(e) => { setRegAbhaId(e.target.value); setAbhaValidated(false); }}
                        placeholder="e.g. 91-4821-9920-1123@abdm or 14-digit ABHA"
                        className="grow px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleValidateAbha}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                          abhaValidated 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {abhaValidated ? 'Verified ✓' : 'Verify ABDM'}
                      </button>
                    </div>
                    {abhaValidated && (
                      <p className="text-[11px] text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ABHA linked to Karnataka Digital Health Registry. Seamless digital Rx sync enabled.</span>
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Default Delivery Address Locality
                      </label>
                      <input
                        type="text"
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        placeholder="e.g. Indiranagar, Bengaluru"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={regPincode}
                        onChange={(e) => setRegPincode(e.target.value.replace(/\D/g, ''))}
                        placeholder="560038"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Create Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Re-type password"
                          className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* If Pharmacist Hub Registration */}
              {selectedRole === 'pharmacist' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pharmacy Commercial Name
                      </label>
                      <input
                        type="text"
                        required
                        value={pharmacyName}
                        onChange={(e) => setPharmacyName(e.target.value)}
                        placeholder="e.g. Trustwell Chemists &amp; Druggists"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pharmacist In-Charge Name
                      </label>
                      <input
                        type="text"
                        required
                        value={pharmacistName}
                        onChange={(e) => setPharmacistName(e.target.value)}
                        placeholder="e.g. Ananth Narayan, B.Pharm"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        State Pharmacy Council Registration No.
                      </label>
                      <input
                        type="text"
                        required
                        value={councilRegNo}
                        onChange={(e) => setCouncilRegNo(e.target.value)}
                        placeholder="e.g. KSPC-90412-A"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        CDSCO Retail Drug License (Form 20B/21B)
                      </label>
                      <input
                        type="text"
                        required
                        value={cdscoLicense}
                        onChange={(e) => setCdscoLicense(e.target.value)}
                        placeholder="e.g. KA-B2-2026-8941"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Hub Physical Locality</label>
                      <input
                        type="text"
                        value={hubLocality}
                        onChange={(e) => setHubLocality(e.target.value)}
                        placeholder="e.g. Indiranagar 100ft Road"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">POS Inventory Sync Driver</label>
                      <select
                        value={posIntegration}
                        onChange={(e) => setPosIntegration(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-white"
                      >
                        <option value="Marg ERP POS">Marg ERP 9+ (Kafka Driver)</option>
                        <option value="C-Square Pharma">C-Square Pharma Suite</option>
                        <option value="MediSys Custom API">MediSys REST Webhook</option>
                        <option value="Manual Dispatch Portal">MediWise Web Barcode Standalone</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Admin or OEM Registration Notice */}
              {(selectedRole === 'admin' || selectedRole === 'oem') && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span>Enterprise Whitelisted Registration Protocol</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Super Admin and Pharma OEM accounts require institutional verification under DISHA Section 14 guidelines. Use your corporate enterprise email (@mediwise.health or @cipla.com).
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Authorized Enterprise Email</label>
                    <input
                      type="email"
                      required
                      placeholder={selectedRole === 'admin' ? 'officer@mediwise.health' : 'enterprise.qa@cipla.com'}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Statutory Compliance Checkbox */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-slate-600 leading-snug">
                    I agree to the <strong className="text-slate-900">MediWise Terms of Service</strong>, statutory adherence to the <strong className="text-slate-900">Drugs &amp; Cosmetics Act, 1940</strong> (Schedule H/H1 Rx restrictions), and consent to encrypted health record processing under <strong className="text-slate-900">DISHA Standards</strong>.
                  </span>
                </label>
              </div>

              {/* Register Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Submitting Statutory Dossier...</span>
                  </span>
                ) : (
                  <>
                    <span>Complete Registration &amp; Issue Credentials</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Bottom Switch between modes */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            {authMode === 'signin' ? (
              <span>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setErrorMsg(null); }}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </span>
            ) : (
              <span>
                Already have registered credentials?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('signin'); setErrorMsg(null); }}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Sign In instead
                </button>
              </span>
            )}

            {!isMandatoryAuth && onNavigateMarketplace && (
              <button
                onClick={onNavigateMarketplace}
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer text-[11px]"
              >
                Skip &bull; View as Guest
              </button>
            )}
          </div>
        </div>

        {/* Right Column: One-Click Quick Login Personas & Compliance Ribbon */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Demo Login Preset Cards */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>One-Click Demo Personas</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Instant sign-in for evaluation across platform roles:
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Fast Pass
              </span>
            </div>

            <div className="space-y-2.5">
              {demoPersonas.map((persona, idx) => (
                <div
                  key={idx}
                  onClick={() => handleQuickLogin(persona)}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition">
                      {persona.role === 'patient' && '🩺'}
                      {persona.role === 'pharmacist' && '💊'}
                      {persona.role === 'admin' && '🛡️'}
                      {persona.role === 'oem' && '🏭'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{persona.name}</span>
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {persona.title}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{persona.detail}</div>
                    </div>
                  </div>

                  <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-slate-400 transition">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Statutory Credentials Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>Statutory Compliance Architecture</span>
            </div>

            <div className="space-y-3 text-slate-300">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-800">
                  <Check className="w-3 h-3" />
                </div>
                <div>
                  <strong className="text-white block">Drugs &amp; Cosmetics Act, 1940</strong>
                  <span className="text-[11px] text-slate-400">Schedule H &amp; H1 medications strictly tied to licensed pharmacist verification.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-800">
                  <Check className="w-3 h-3" />
                </div>
                <div>
                  <strong className="text-white block">DISHA Healthcare Data Privacy</strong>
                  <span className="text-[11px] text-slate-400">Zero unencrypted health records. Role-based row-level Postgres encryption.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-800">
                  <Check className="w-3 h-3" />
                </div>
                <div>
                  <strong className="text-white block">Cryptographic Hologram Custody</strong>
                  <span className="text-[11px] text-slate-400">Escrow funds remain frozen until patient verifies physical tamper seal with 4-digit OTP.</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
              <span>Security Hash: SHA-256 Verified</span>
              <span>TLS 1.3 Strict HTTPS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
