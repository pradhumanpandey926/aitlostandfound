import React from 'react';
import { Plus, Search, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function StatsBanner({
  stats = { total: 10, found: 7, lost: 3, claimed: 2, underReview: 1 },
  onOpenReport,
  onQuickFilterType
}) {
  return (
    <section className="mb-10 relative">
      
      {/* Cinematic Banner Container */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-[#181822] via-[#121218] to-[#0A0A0E] border border-white/10 shadow-2xl overflow-hidden">
        
        {/* Subtle Ambient Red Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-8 space-y-4">
            
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E50914]"></span>
              <span className="text-xs font-semibold text-[#E50914] tracking-wider uppercase">
                Army Institute of Technology, Pune
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Recovery in Real Time. <br className="hidden sm:inline" />
              Secured by Campus Chain-of-Custody.
            </h1>

            <p className="text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed">
              From Casio calculators left in the Library to wallets in the Mess, the portal catalogs campus property with anti-fraud verification and digital Security Desk Gate Passes.
            </p>

            {/* Metrics Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              
              <div 
                onClick={() => onQuickFilterType('all')}
                className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 p-3.5 rounded-2xl cursor-pointer transition-all"
              >
                <span className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                  Total Logged
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {stats.total}
                </span>
              </div>

              <div 
                onClick={() => onQuickFilterType('found')}
                className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 p-3.5 rounded-2xl cursor-pointer transition-all"
              >
                <span className="block text-[11px] text-emerald-400 font-medium uppercase tracking-wider">
                  Found Gear
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                  {stats.found}
                </span>
              </div>

              <div 
                onClick={() => onQuickFilterType('lost')}
                className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 p-3.5 rounded-2xl cursor-pointer transition-all"
              >
                <span className="block text-[11px] text-red-400 font-medium uppercase tracking-wider">
                  Lost Reports
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-red-400">
                  {stats.lost}
                </span>
              </div>

              <div className="bg-white/[0.04] border border-white/10 p-3.5 rounded-2xl">
                <span className="block text-[11px] text-amber-400 font-medium uppercase tracking-wider">
                  Under Audit
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                  {stats.underReview}
                </span>
              </div>

            </div>

          </div>

          {/* Right Action Callout Card */}
          <div className="lg:col-span-4 p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-4">
            
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Quick Recovery Actions
              </span>
              <h3 className="text-lg font-bold text-white">
                Turn In or Report Gear
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Found items are masked for student privacy before publishing. Lost reports arm instant keyword radar alerts across campus.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => onOpenReport('found')}
                className="w-full btn-crimson py-3 px-4 text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Log Found Equipment</span>
              </button>

              <button
                onClick={() => onOpenReport('lost')}
                className="w-full btn-glass py-3 px-4 text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4 text-red-400" />
                <span>File Lost Notice</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
