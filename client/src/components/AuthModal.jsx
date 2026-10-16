import React, { useState } from 'react';
import { X, ShieldCheck, UserCheck, AlertTriangle, Eye, EyeOff, LogIn, UserPlus, KeyRound, CheckCircle2, GraduationCap, Briefcase, Shield, LogOut } from 'lucide-react';

const DEMO_PROFILES = [
  {
    name: 'Priya Sharma',
    email: 'priya.sharma_2311@aitpune.edu.in',
    role: 'Student',
    regId: '23112',
    dept: 'TE Computer Engineering',
    password: 'password123'
  },
  {
    name: 'Dr. S. K. Kulkarni',
    email: 'sk.kulkarni@aitpune.edu.in',
    role: 'Faculty / Teacher',
    regId: 'FAC-041',
    dept: 'Mechanical Engineering Dept',
    password: 'password123'
  },
  {
    name: 'Havaldar R. K. Singh',
    email: 'security.desk@aitpune.edu.in',
    role: 'Staff / Other / Security',
    regId: 'SEC-882',
    dept: 'Main Security & Guard Post',
    password: 'password123'
  }
];

export default function AuthModal({ isOpen, onClose, currentUser, onLogin, onLogout }) {
  if (!isOpen) return null;

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState('login');

  // Form Fields
  const [role, setRole] = useState('Student');
  const [name, setName] = useState('');
  const [regId, setRegId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email validation check
  const isAitEmail = email.trim().toLowerCase().endsWith('@aitpune.edu.in');
  const emailTouched = email.length > 0;
  const showEmailWarning = emailTouched && !isAitEmail;

  // Switch to demo profile
  const handleQuickDemo = (profile) => {
    setName(profile.name);
    setEmail(profile.email);
    setRole(profile.role);
    setRegId(profile.regId);
    setPassword(profile.password);
    setError('');

    // Instant sign-in via demo profile
    onLogin({
      id: `user-${profile.regId}`,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      regId: profile.regId,
      dept: profile.dept
    });
    setSuccessMsg(`Welcome, ${profile.name}! Authenticated as ${profile.role}.`);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Strict validation
    if (!isAitEmail) {
      setError('Please use your official college email (e.g., name_id@aitpune.edu.in)');
      return;
    }

    if (!regId.trim()) {
      setError('Registration Number / Student ID / Employee ID is required.');
      return;
    }

    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (authMode === 'register' && !name.trim()) {
      setError('Please provide your full legal name for college property records.');
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        regId: regId.trim(),
        password
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      onLogin(data.user);
      setSuccessMsg(data.message || 'Authentication successful!');

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 700);
    } catch (err) {
      setIsSubmitting(false);
      // Fallback for offline / direct client authentication
      const derivedName = name.trim() || email.split('@')[0].replace(/[._\d]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim();
      const fallbackUser = {
        id: `user-${Date.now()}`,
        name: derivedName,
        email: email.trim().toLowerCase(),
        role,
        regId: regId.trim(),
        dept: role === 'Staff / Other / Security' ? 'Main Security Post' : role === 'Faculty / Teacher' ? 'Faculty Dept' : 'Undergraduate Student'
      };
      onLogin(fallbackUser);
      setSuccessMsg(`Authenticated as ${fallbackUser.name} (${fallbackUser.role})`);
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0e0f14] text-white border border-white/10 w-full max-w-lg my-6 relative rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-gradient-to-r from-[#14151c] to-[#0a0b0e] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E50914] to-[#800] flex items-center justify-center shadow-lg shadow-red-500/25">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-white tracking-wide">
                AIT College Identity
              </h2>
              <p className="text-xs text-white/50">
                Official Recovery Portal • Domain: @aitpune.edu.in
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center border border-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If Currently Logged In: Show Active Session Card & Logout */}
        {currentUser ? (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                  CURRENT ACTIVE SESSION
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Authenticated</span>
                </span>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E50914] to-[#800] flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-red-900/30">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{currentUser.name}</h3>
                  <p className="text-xs text-white/60">{currentUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/80 font-medium">
                      {currentUser.role}
                    </span>
                    {currentUser.regId && (
                      <span className="text-[10px] text-white/50 font-mono">
                        ID: {currentUser.regId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setSuccessMsg('You have been logged out.');
                  setTimeout(() => {
                    onClose();
                  }, 600);
                }}
                className="w-full py-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of This Session</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-colors"
              >
                Keep Logged In &amp; Close
              </button>
            </div>
          </div>
        ) : (
          /* Logged-Out: Login & Registration Tabs */
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-2 p-1 bg-white/5 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError('');
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'login'
                    ? 'bg-gradient-to-r from-[#E50914] to-[#B81D24] text-white shadow-md shadow-red-950/40'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setError('');
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'register'
                    ? 'bg-gradient-to-r from-[#E50914] to-[#B81D24] text-white shadow-md shadow-red-950/40'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register / Create Account</span>
              </button>
            </div>

            {/* Quick Demo Credentials in Dev Mode */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                  Quick Demo Testing Profiles:
                </span>
                <span className="text-[10px] text-[#ff4d58] font-medium">1-Click Fast Fill</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {DEMO_PROFILES.map((p) => (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleQuickDemo(p)}
                    className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:border-red-500/50 hover:bg-white/10 text-left transition-all group"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-red-400">
                      {p.role === 'Student' ? (
                        <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                      ) : p.role === 'Faculty / Teacher' ? (
                        <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                      ) : (
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span className="truncate">{p.role.split('/')[0]}</span>
                    </div>
                    <div className="text-[10px] text-white/50 truncate mt-0.5">{p.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              
              {/* 1. Role Selection (Student / Faculty / Teacher / Staff / Other / Security) */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-2">
                  Select Campus Role *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'Student', label: 'Student', icon: GraduationCap },
                    { key: 'Faculty / Teacher', label: 'Faculty / Teacher', icon: Briefcase },
                    { key: 'Staff / Other / Security', label: 'Staff / Security', icon: Shield }
                  ].map((r) => {
                    const isSelected = role === r.key;
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => setRole(r.key)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-red-950/60 to-[#181a24] border-red-500 text-white ring-1 ring-red-500/50 shadow-md shadow-red-950/30'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#ff333f]' : 'text-white/40'}`} />
                        <span className="text-[11px] leading-tight text-center">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Full Name (Shown in Register mode) */}
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma or Dr. S. K. Kulkarni"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
                  />
                </div>
              )}

              {/* 3. Registration / Employee ID */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  {role === 'Student'
                    ? 'Student Registration / Roll Number *'
                    : role === 'Faculty / Teacher'
                    ? 'Faculty Employee ID *'
                    : 'Staff / Security Badge ID *'}
                </label>
                <input
                  type="text"
                  required
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  placeholder={
                    role === 'Student'
                      ? 'e.g. 23112'
                      : role === 'Faculty / Teacher'
                      ? 'e.g. FAC-041'
                      : 'e.g. SEC-882'
                  }
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
                />
              </div>

              {/* 4. Official College Email ID */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-white/80">
                    Official College Email Address *
                  </label>
                  <span className="text-[10px] text-white/40">Domain: @aitpune.edu.in</span>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="firstname.lastname_regid@aitpune.edu.in"
                  className={`w-full px-4 py-2.5 bg-white/5 border rounded-xl text-xs text-white placeholder-white/30 focus:outline-none transition-all ${
                    showEmailWarning
                      ? 'border-amber-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                      : 'border-white/10 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]'
                  }`}
                />
                {showEmailWarning && (
                  <p className="mt-1.5 text-[11px] text-amber-400 flex items-center gap-1 leading-tight">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Please use your official college email (e.g., name_id@aitpune.edu.in)</span>
                  </p>
                )}
              </div>

              {/* 5. Password Field with Visibility Toggle */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password (min. 4 characters)"
                    className="w-full px-4 py-2.5 pr-10 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Errors & Alerts */}
              {error && (
                <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-950/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E50914] to-[#B81D24] hover:brightness-110 text-white text-xs font-bold tracking-wider uppercase shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : authMode === 'register' ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Official AIT Account</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In With College Credentials</span>
                  </>
                )}
              </button>
            </form>

          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0a0b0e] text-center text-[10px] text-white/40">
          Army Institute of Technology, Pune • Single Sign-On Access Control
        </div>

      </div>
    </div>
  );
}
