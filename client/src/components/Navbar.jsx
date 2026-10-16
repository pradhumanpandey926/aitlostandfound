import React from 'react';
import { Shield, Bell, Plus, Radio, UserCheck, KeyRound, Film, LogIn, LogOut } from 'lucide-react';

export default function Navbar({
  currentUser,
  onOpenReport,
  onOpenAuth,
  onLogout,
  onOpenRadar,
  onOpenNotifications,
  unreadCount = 0,
  activeAlertCount = 0,
  onOpenAdminClaims
}) {
  const isAdmin = currentUser?.role === 'Staff / Other / Security' || currentUser?.role === 'Security Desk / Admin';

  return (
    <header className="sticky top-0 z-40 bg-[#08080A]/85 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-4">
          
          {/* Logo & Brand (Cinema Red Ribbon Style) */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E50914] to-[#8B0000] flex items-center justify-center text-white shadow-lg shadow-red-900/40">
              <Shield className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-1">
                  AIT <span className="text-[#E50914]">LOST &amp; FOUND</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] bg-red-600/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-semibold">
                  AIT PUNE
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium tracking-wide">
                Campus Recovery Portal • Official Stream
              </p>
            </div>
          </div>

          {/* Center Dispatch Status Pill */}
          <div className="hidden lg:flex items-center gap-2 bg-white/[0.04] border border-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse"></span>
            <span className="text-xs font-medium text-gray-300">
              Campus Radar Active • 13 Monitored Zones
            </span>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Radar Keyword Trigger */}
            <button
              onClick={onOpenRadar}
              className="btn-glass px-3 py-1.5 text-xs rounded-full flex items-center gap-1.5"
              title="Keyword Watch Alert (Notify Me)"
            >
              <Radio className="w-3.5 h-3.5 text-[#E50914]" />
              <span className="hidden sm:inline">Radar</span>
              {activeAlertCount > 0 && (
                <span className="bg-[#E50914] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                  {activeAlertCount}
                </span>
              )}
            </button>

            {/* Notifications Button */}
            <button
              onClick={onOpenNotifications}
              className="btn-glass p-2 rounded-full relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-gray-200" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E50914] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#08080A]">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Claims Review Button for Admin */}
            {isAdmin && (
              <button
                onClick={onOpenAdminClaims}
                className="btn-glass px-3.5 py-1.5 text-xs rounded-full text-amber-300 border-amber-500/30 flex items-center gap-1.5"
              >
                <span>Audit Claims</span>
              </button>
            )}

            {/* Dynamic Auth Section: Guest (Login / Register) vs Authenticated User */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAuth}
                  className="btn-glass px-3 py-1.5 text-xs rounded-full flex items-center gap-2 hover:border-white/30"
                  title={`Account Settings (${currentUser.email})`}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#E50914] to-[#800] flex items-center justify-center text-white font-bold text-[11px] shadow-sm">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden md:block leading-tight">
                    <span className="block text-xs font-semibold text-gray-200 truncate max-w-[110px]">
                      {currentUser.name}
                    </span>
                    <span className="block text-[9px] text-[#ff4d58] font-semibold uppercase tracking-wider">
                      {currentUser.role?.split('/')[0]}
                    </span>
                  </div>
                </button>

                <button
                  onClick={onLogout}
                  className="btn-glass p-2 sm:px-3 sm:py-1.5 rounded-full text-xs text-white/70 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 flex items-center gap-1.5 transition-colors"
                  title="Sign out of current account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-semibold">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="btn-crimson px-3.5 sm:px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-red-500/20"
              >
                <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Login / Register</span>
              </button>
            )}

            {/* Report Item Primary CTA */}
            <button
              onClick={onOpenReport}
              className="btn-crimson px-4 sm:px-5 py-2 text-xs sm:text-sm rounded-xl flex items-center gap-1.5 ml-1"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Report Item</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
