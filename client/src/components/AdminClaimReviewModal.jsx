import React, { useState } from 'react';
import { X, Award, FileCheck, CheckCircle2, XCircle, ShieldAlert, Flag, Check, Trash2, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminClaimReviewModal({
  isOpen,
  onClose,
  claims = [],
  items = [],
  onReviewClaim,
  onOpenGatePass,
  onModerateItem
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('pending');
  const [reviewNote, setReviewNote] = useState('');
  const [handoffLoc, setHandoffLoc] = useState('Main Security Desk / Campus Main Gate');

  const flaggedItems = items.filter(i => (i.flagsCount && i.flagsCount > 0) || i.isSpamHidden);

  const filteredClaims = claims.filter(c => {
    if (activeTab === 'pending') return c.status?.toLowerCase() === 'pending';
    if (activeTab === 'approved') return c.status?.toLowerCase() === 'approved';
    if (activeTab === 'rejected') return c.status?.toLowerCase() === 'rejected';
    return true;
  });

  const handleApprove = (claim) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    onReviewClaim(claim.id, 'Approved', reviewNote || 'Verification answers confirmed against private inventory marks.', handoffLoc);
    setReviewNote('');
  };

  const handleReject = (claim) => {
    onReviewClaim(claim.id, 'Rejected', reviewNote || 'Identifying answer did not match finder hints.', handoffLoc);
    setReviewNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl overflow-y-auto">
      <div className="bg-[#121218] text-white border border-white/10 rounded-3xl w-full max-w-4xl my-6 relative max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-pulse"></span>
              <span>Security Desk • Anti-Fraud &amp; Moderation Console</span>
            </h2>
            <p className="text-xs text-gray-400">
              Army Institute of Technology • Official Campus Property Control Desk
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-white/10 px-5 pt-3 gap-2 overflow-x-auto">
          {[
            { id: 'pending', label: 'Pending Claims', count: claims.filter(c => c.status?.toLowerCase() === 'pending').length },
            { id: 'spam', label: '🚨 Spam & Fake Reports', count: flaggedItems.length, highlight: true },
            { id: 'approved', label: 'Approved & Released', count: claims.filter(c => c.status?.toLowerCase() === 'approved').length },
            { id: 'rejected', label: 'Rejected Claims', count: claims.filter(c => c.status?.toLowerCase() === 'rejected').length },
            { id: 'all', label: 'All Claim Logs', count: claims.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? tab.highlight 
                    ? 'bg-red-950/60 text-red-200 border-t border-x border-red-500/40' 
                    : 'bg-white/10 text-white border-t border-x border-white/15'
                  : tab.highlight && tab.count > 0
                  ? 'text-red-400 hover:text-red-300'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                tab.highlight && tab.count > 0 ? 'bg-red-600 text-white font-bold' : 'bg-white/10 text-gray-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Console Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* TAB 1: SPAM & FRAUD MODERATION */}
          {activeTab === 'spam' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span className="text-gray-300">
                    Community Moderation Queue: Items that received flags from verified campus members. 
                    Items with 3 flags are automatically quarantined from the public feed.
                  </span>
                </div>
              </div>

              {flaggedItems.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/10">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white">No Flagged Reports</p>
                  <p className="text-xs text-gray-400 mt-1">
                    The campus feed is clean. All active listings are within genuine policy limits.
                  </p>
                </div>
              ) : (
                flaggedItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-5 rounded-2xl border space-y-4 transition-all ${
                      item.isSpamHidden || item.flagsCount >= 3
                        ? 'bg-red-950/20 border-red-500/40'
                        : 'bg-white/[0.03] border-white/10'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-white/10 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#E50914] text-white">
                            {item.refCode}
                          </span>
                          <span className="font-bold text-base text-white">
                            {item.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#E50914]" />
                          <span>{item.location}</span>
                          <span>•</span>
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600/20 text-red-300 border border-red-500/40 flex items-center gap-1.5">
                          <Flag className="w-3 h-3" />
                          <span>{item.flagsCount || 0} / 3 Flags</span>
                        </span>
                        {item.isSpamHidden && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Quarantined (Hidden)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reporter Identity Binding */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">REPORTER NAME</span>
                        <strong className="text-white">{item.reporterName}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">OFFICIAL EMAIL</span>
                        <strong className="text-white font-mono">{item.reporterEmail}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">REG ID / ROLL NO</span>
                        <strong className="text-emerald-400 font-mono">{item.reporterRegId || 'N/A'}</strong>
                      </div>
                    </div>

                    {/* Narrative */}
                    <div className="text-xs text-gray-300 bg-black/40 p-3.5 rounded-xl border border-white/5">
                      <span className="text-gray-500 block text-[10px] uppercase font-semibold mb-1">DESCRIPTION:</span>
                      {item.description}
                    </div>

                    {/* Security Desk Actions */}
                    <div className="pt-2 flex items-center justify-end gap-3">
                      <button
                        onClick={() => onModerateItem(item.id, 'approve')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve &amp; Restore to Feed</span>
                      </button>

                      <button
                        onClick={() => onModerateItem(item.id, 'remove')}
                        className="px-4 py-2 rounded-xl bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Confirm Spam &amp; Permanently Remove</span>
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>
          ) : (
            /* CLAIMS TABS */
            filteredClaims.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/10">
                <FileCheck className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">No Claims Found in this Queue</p>
                <p className="text-xs text-gray-400 mt-1">All campus property claims have been audited.</p>
              </div>
            ) : (
              filteredClaims.map((claim) => {
                const matchedItem = items.find(i => i.id === claim.itemId);
                const isPending = claim.status?.toLowerCase() === 'pending';
                const isApproved = claim.status?.toLowerCase() === 'approved';

                return (
                  <div 
                    key={claim.id}
                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4"
                  >
                    {/* Top Item Summary */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-white/10 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#E50914] text-white">
                            {claim.itemRefCode}
                          </span>
                          <span className="font-bold text-base text-white">
                            {claim.itemTitle}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 mt-1 block">
                          Submitted: {new Date(claim.submittedAt).toLocaleString()}
                        </span>
                      </div>

                      <div>
                        {isApproved ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">
                            Approved • Pass Issued
                          </span>
                        ) : claim.status?.toLowerCase() === 'rejected' ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600/20 text-red-300 border border-red-500/30">
                            Claim Rejected
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-600/20 text-amber-300 border border-amber-500/30">
                            Awaiting Audit
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Claimant Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">CLAIMANT NAME</span>
                        <strong className="text-white">{claim.claimantName}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">OFFICIAL EMAIL</span>
                        <strong className="text-white font-mono">{claim.claimantEmail}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">ROLL / EMPLOYEE ID</span>
                        <strong className="text-emerald-400 font-mono">{claim.claimantRoll}</strong>
                      </div>
                    </div>

                    {/* Identification Questionnaire Comparison */}
                    <div className="space-y-3 p-4 rounded-xl bg-black/40 border border-white/5 text-xs">
                      <div>
                        <span className="text-[#E50914] font-bold block text-[10px] uppercase tracking-wider mb-1">
                          SECURITY QUESTION (SHOWN TO CLAIMANT):
                        </span>
                        <p className="text-gray-300 italic">
                          "{matchedItem?.verificationQuestion || 'Specify private marks or contents.'}"
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5">
                        <span className="text-emerald-400 font-bold block text-[10px] uppercase tracking-wider mb-1">
                          CLAIMANT'S SUBMITTED PROOF / ANSWER:
                        </span>
                        <p className="text-white font-medium bg-white/[0.04] p-2.5 rounded-lg border border-white/10">
                          {claim.answers}
                        </p>
                      </div>

                      {matchedItem?.privateAnswerHint && (
                        <div className="pt-2 border-t border-white/5">
                          <span className="text-amber-400 font-bold block text-[10px] uppercase tracking-wider mb-1">
                            CONFIDENTIAL FINDER'S HINT (SECURITY EYES ONLY):
                          </span>
                          <p className="text-amber-200/90 bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/20 font-mono text-[11px]">
                            {matchedItem.privateAnswerHint}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Admin Actions for Pending Claims */}
                    {isPending ? (
                      <div className="pt-2 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                              Verification Audit Notes:
                            </label>
                            <input
                              type="text"
                              value={reviewNote}
                              onChange={(e) => setReviewNote(e.target.value)}
                              placeholder="e.g. Serial matched hard cover inscription, verified in person."
                              className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#E50914]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                              Designated Handoff Location:
                            </label>
                            <input
                              type="text"
                              value={handoffLoc}
                              onChange={(e) => setHandoffLoc(e.target.value)}
                              placeholder="e.g. Main Security Desk / Campus Main Gate"
                              className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#E50914]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                          <button
                            onClick={() => handleReject(claim)}
                            className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject Claim</span>
                          </button>

                          <button
                            onClick={() => handleApprove(claim)}
                            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-900/40 transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve &amp; Issue Gate Pass</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 flex items-center justify-between text-xs text-gray-400 border-t border-white/10">
                        <span>Audit Decision: <strong className="text-white">{claim.status}</strong></span>
                        {isApproved && (
                          <button
                            onClick={() => {
                              onClose();
                              onOpenGatePass(matchedItem);
                            }}
                            className="btn-glass px-3.5 py-1.5 text-xs text-emerald-400 border-emerald-500/30 flex items-center gap-1"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>View Gate Pass ({claim.handoffPass})</span>
                          </button>
                        )}
                      </div>
                    )}

                  </div>
                );
              })
            )
          )}

        </div>

      </div>
    </div>
  );
}
