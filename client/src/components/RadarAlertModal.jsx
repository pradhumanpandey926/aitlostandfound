import React, { useState } from 'react';
import { X, Radio, Plus, Trash2, BellRing } from 'lucide-react';

export default function RadarAlertModal({
  isOpen,
  onClose,
  alerts = [],
  onAddAlert,
  onDeleteAlert,
  currentUser
}) {
  if (!isOpen) return null;

  const [keyword, setKeyword] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    onAddAlert(keyword.trim(), currentUser?.email);
    setKeyword('');
  };

  const QUICK_SUGGESTIONS = [
    'Casio FX-991', 'Wildhorn', 'Hostel Keys', 'boAt Airdopes', 'College ID', 'Badminton Racket', 'SBI Card'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0e0f14] text-white border border-white/10 w-full max-w-xl my-6 relative rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-gradient-to-r from-[#14151c] to-[#0a0b0e] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E50914] to-[#800] flex items-center justify-center shadow-lg shadow-red-500/25">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-white tracking-wide">
                Keyword Radar // "Notify Me"
              </h2>
              <p className="text-xs text-white/50">
                Active automated scan across 13 AIT Campus zones
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

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/70 leading-relaxed">
            Enter brand names, model numbers, or identifying keywords. The radar engine triggers an instant in-app dispatch notice whenever matching property is logged anywhere on campus.
          </div>

          {/* Add Keyword Form */}
          <form onSubmit={handleAdd} className="space-y-2">
            <label className="block text-xs font-semibold text-white/80">
              Enter Watchword or Phrase:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. Casio fx-991, Wildhorn Wallet, Godrej Keys..."
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E50914] to-[#B81D24] hover:brightness-110 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-red-500/20 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Arm Radar</span>
              </button>
            </div>
          </form>

          {/* Quick Suggestions */}
          <div>
            <span className="block text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-2">
              Frequent Campus Watchwords:
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setKeyword(sug)}
                  className="px-3 py-1 rounded-full bg-white/5 hover:bg-[#E50914]/20 border border-white/10 hover:border-[#E50914]/50 text-xs text-white/70 hover:text-white transition-colors"
                >
                  +{sug}
                </button>
              ))}
            </div>
          </div>

          {/* Active Radar Watchlist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white/80">
                Active Watchlist ({alerts.length})
              </span>
              <span className="text-[10px] text-red-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                Monitoring Live
              </span>
            </div>

            {alerts.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-white/5 border border-white/10 text-xs text-white/40">
                No active radar keywords. Arm your first keyword above.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {alerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs transition-colors hover:border-white/20"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#E50914] shadow-sm shadow-red-500"></span>
                      <strong className="text-white font-medium">"{alt.keyword}"</strong>
                      <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteAlert(alt.id)}
                      className="text-white/40 hover:text-red-400 transition-colors p-1"
                      title="Delete Watchword"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0a0b0e] flex items-center justify-between shrink-0 text-xs">
          <span className="text-white/40">
            AIT Radar Dispatch Service
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
}
