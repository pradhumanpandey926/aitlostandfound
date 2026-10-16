import React from 'react';
import { X, Printer, Shield, CheckCircle2, QrCode } from 'lucide-react';

export default function GatePassModal({ isOpen, onClose, item }) {
  if (!isOpen || !item) return null;

  const passCode = item.handoffPass || 'GP-AIT-8842';
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).toUpperCase();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0e0f14] text-white border border-white/10 w-full max-w-xl my-6 relative rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Controls Bar (hidden during print) */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-[#14151c] to-[#0a0b0e] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E50914] to-[#800] flex items-center justify-center shadow-lg shadow-red-500/20">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                OFFICIAL RECOVERY GATE PASS
              </span>
              <p className="text-[10px] text-white/50 tracking-wider">AIT SECURITY DISPATCH DESK</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-white/10 hover:bg-white/20 text-white text-xs py-1.5 px-3 rounded-full flex items-center gap-1.5 border border-white/10 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Pass</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center border border-white/10 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Pass Area */}
        <div className="p-6 sm:p-8 bg-[#14161f] border border-white/10 rounded-2xl m-4 sm:m-6 relative overflow-hidden shadow-inner">
          {/* Subtle Ambient Red Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#E50914]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center pb-5 border-b border-white/10 relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E50914] to-[#B81D24] mx-auto mb-3 flex items-center justify-center text-white shadow-lg shadow-red-500/25">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="font-extrabold text-lg sm:text-xl text-white tracking-wide uppercase">
              ARMY INSTITUTE OF TECHNOLOGY, PUNE
            </h1>
            <p className="text-[10px] text-white/50 tracking-widest uppercase mt-0.5">
              SECURITY DISPATCH WING • DIGHI HILLS, ALANDI ROAD, PUNE 411015
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-[#E50914]/20 border border-[#E50914]/40 text-[#ff4d58] text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>PROPERTY RELEASE CLEARANCE</span>
            </div>
          </div>

          {/* Identifiers */}
          <div className="grid grid-cols-2 gap-4 py-4 border-b border-white/10 text-xs">
            <div>
              <span className="text-white/40 block text-[10px] uppercase tracking-wider">GATE PASS VOUCHER</span>
              <strong className="text-base text-[#ff333f] font-mono font-bold tracking-wider">{passCode}</strong>
            </div>
            <div className="text-right">
              <span className="text-white/40 block text-[10px] uppercase tracking-wider">DATE OF ISSUANCE</span>
              <strong className="text-sm text-white font-medium">{currentDate}</strong>
            </div>
          </div>

          {/* Item & Case Details */}
          <div className="py-4 space-y-3 text-xs border-b border-white/10">
            <div>
              <span className="text-white/40 block text-[10px] uppercase tracking-wider">AUTHORIZED EQUIPMENT &amp; REF</span>
              <div className="font-bold text-sm text-white mt-0.5">
                [{item.refCode}] {item.title}
              </div>
              <div className="text-[11px] text-white/60 mt-0.5">
                Category: {item.category} • Found at: {item.location}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-white/40 block text-[10px] uppercase tracking-wider">RELEASED TO CLAIMANT</span>
                <strong className="text-white text-xs block mt-0.5">{item.claimedBy || 'VERIFIED STUDENT CLAIMANT'}</strong>
              </div>
              <div className="text-right">
                <span className="text-white/40 block text-[10px] uppercase tracking-wider">COLLECTION DESK</span>
                <strong className="text-white text-xs block mt-0.5">MAIN SECURITY GATE POST</strong>
              </div>
            </div>
          </div>

          {/* Barcode & Security Stamp */}
          <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Monospaced Barcode Simulation */}
            <div className="text-center sm:text-left">
              <div className="font-mono text-xl sm:text-2xl tracking-[0.25em] text-white/80 select-none font-bold">
                ||||| | || |||| | ||| ||||
              </div>
              <div className="font-mono text-[9px] text-white/40 tracking-wider mt-1 uppercase">
                AUTH-HASH: 8492-AIT-PUNE-VERIFIED
              </div>
            </div>

            {/* Official Security Seal Badge */}
            <div className="rounded-xl border border-red-500/30 bg-red-950/30 text-white p-3 text-center w-36 shadow-lg shadow-red-950/20">
              <div className="text-[8px] tracking-widest uppercase text-red-300 font-bold">
                AIT SECURITY
              </div>
              <div className="font-bold text-xs uppercase my-0.5 text-white">
                VERIFIED &amp; RELEASED
              </div>
              <div className="text-[7px] text-white/50 tracking-wider uppercase">
                OFFICIAL SEAL
              </div>
            </div>
          </div>

          {/* Notice */}
          <div className="mt-5 pt-3 border-t border-white/10 text-[9px] text-white/40 text-center tracking-wider">
            Valid only with physical presentation of College Identity Card. Present at Main Gate Security Desk for asset collection.
          </div>
        </div>

        {/* Modal Footer Dismiss */}
        <div className="p-4 border-t border-white/10 bg-[#0a0b0e] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
          >
            Close Voucher
          </button>
        </div>

      </div>
    </div>
  );
}
