import React from 'react';
import { X, MapPin, Calendar, Clock, ArrowRight, Award, Shield } from 'lucide-react';
import ItemVisual from './ItemVisual';

export default function ItemDetailModal({
  isOpen,
  onClose,
  item,
  onOpenClaim,
  onOpenGatePass,
  currentUser
}) {
  if (!isOpen || !item) return null;

  const isFound = item.type === 'found';
  const isClaimed = item.status.toLowerCase() === 'claimed';
  const isUnderReview = item.status.toLowerCase() === 'under review';
  const isAdmin = currentUser?.role === 'Staff / Other / Security' || currentUser?.role === 'Security Desk / Admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0e0f14] text-white border border-white/10 w-full max-w-3xl my-6 relative max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-[#14151c] to-[#0a0b0e] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold bg-white/10 border border-white/10 px-2.5 py-1 rounded-full text-white/90">
              {item.refCode}
            </span>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-white tracking-wide">
                Campus Asset Dossier
              </h2>
              <p className="text-xs text-white/50">
                AIT Official Security Register
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

        {/* Content Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6">
          
          {/* Top Visual Graphic with Reference Badges */}
          <div className="relative rounded-2xl overflow-hidden">
            <ItemVisual
              placeholder={item.imagePlaceholder}
              imageData={item.imageData}
              hasRedacted={item.hasRedactedImage}
              title={item.title}
              className="h-64 sm:h-72 w-full object-cover"
            />
            {/* Dark gradient scrim at the bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f14] via-transparent to-black/40 pointer-events-none" />

            {/* Circular Platform Badge top-left */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black tracking-wider shadow-lg ${
                isFound
                  ? 'bg-blue-600 text-white shadow-blue-500/30'
                  : 'bg-[#E50914] text-white shadow-red-500/40'
              }`}>
                {isFound ? 'FND' : 'LST'}
              </span>
              <span className="bg-black/60 backdrop-blur-md text-white/90 text-xs font-semibold px-3 py-1 rounded-full border border-white/10">
                {isFound ? 'Found Property' : 'Lost Notice'}
              </span>
            </div>
          </div>

          {/* Title & Status */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-white/50 uppercase tracking-wider font-medium">
                  {item.category}
                </span>
                <span className="text-white/20">•</span>
                <span className="text-xs text-white/50">
                  {item.location}
                </span>
              </div>
              <h1 className="font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                {item.title}
              </h1>
            </div>

            <div>
              {isClaimed ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5" />
                  <span>Claimed // Restored</span>
                </span>
              ) : isUnderReview ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <span>Under Active Audit</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E50914]/20 border border-[#E50914]/40 text-[#ff4d58] text-xs font-bold uppercase tracking-wider">
                  <span>Active on Register</span>
                </span>
              )}
            </div>
          </div>

          {/* Location & Time Manifest */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs">
            <div>
              <span className="text-white/40 block text-[10px] uppercase tracking-wider font-semibold">CAMPUS LANDMARK</span>
              <strong className="text-white flex items-center gap-1.5 text-sm mt-1 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-[#E50914]" />
                <span>{item.location}</span>
              </strong>
            </div>

            <div>
              <span className="text-white/40 block text-[10px] uppercase tracking-wider font-semibold">DATE LOGGED</span>
              <strong className="text-white flex items-center gap-1.5 text-sm mt-1 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-white/60" />
                <span>{item.date}</span>
              </strong>
            </div>

            <div>
              <span className="text-white/40 block text-[10px] uppercase tracking-wider font-semibold">INCIDENT TIME</span>
              <strong className="text-white flex items-center gap-1.5 text-sm mt-1 font-semibold">
                <Clock className="w-3.5 h-3.5 text-white/60" />
                <span>{item.time || '12:00'}</span>
              </strong>
            </div>
          </div>

          {/* Detailed Narrative */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-2">
              Incident Narrative
            </span>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-white/80 leading-relaxed">
              {item.description}
            </div>
          </div>

          {/* Anti-Fraud Questionnaire Section */}
          <div className="rounded-2xl border border-white/10 p-5 bg-gradient-to-br from-red-950/20 via-[#10121a] to-white/5 space-y-2">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Anti-Fraud Verification Question</span>
            </span>
            <p className="text-sm sm:text-base text-white font-medium pl-5">
              "{item.verificationQuestion}"
            </p>

            {/* Admin or Finder Only: Private inventory hint */}
            {isAdmin && item.privateAnswerHint && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Confidential Verification Hint (Security Desk Eyes Only):
                </span>
                <span className="text-xs text-white/90 bg-white/10 px-3 py-1.5 rounded-xl inline-block">
                  "{item.privateAnswerHint}"
                </span>
              </div>
            )}
          </div>

          {/* Reporter & Custody chain */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div className="text-white/70">
              <span>Logged by: </span>
              <strong className="text-white">{item.reporterName}</strong>
              <span className="text-white/40"> ({item.reporterRole} • {item.reporterEmail})</span>
            </div>
            <span className="text-[10px] text-white/60 bg-white/10 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
              Campus Affiliated
            </span>
          </div>

          {/* Claim / Release Info if Claimed */}
          {isClaimed && (
            <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 text-white space-y-1.5 text-xs">
              <div className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>Officially Restored • Gate Pass Issued</span>
              </div>
              <p className="text-white/70">
                Released To: <strong className="text-white">{item.claimedBy}</strong>
              </p>
              <p className="text-white/70">
                Gate Pass Code: <strong className="text-[#ff4d58] font-mono">{item.handoffPass || 'GP-AIT-883'}</strong>
              </p>
              <p className="text-[11px] text-white/50">
                Instructions: {item.handoffInstructions || 'Collect from Main Security Gate Post with college ID.'}
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0a0b0e] flex items-center justify-between shrink-0 text-xs">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
          >
            Dismiss Dossier
          </button>

          {isClaimed ? (
            <button
              onClick={() => {
                onClose();
                onOpenGatePass(item);
              }}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-110 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Award className="w-4 h-4" />
              <span>View Recovery Gate Pass</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onOpenClaim(item);
              }}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#E50914] to-[#B81D24] hover:brightness-110 text-white font-bold tracking-wide flex items-center gap-2 shadow-lg shadow-red-500/25 transition-all"
            >
              <span>{isFound ? 'Claim this Property' : 'I Found This Property'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
