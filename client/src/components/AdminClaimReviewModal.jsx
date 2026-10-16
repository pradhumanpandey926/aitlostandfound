import React, { useState } from 'react';
import { X, Award, FileCheck, CheckCircle2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminClaimReviewModal({
  isOpen,
  onClose,
  claims = [],
  items = [],
  onReviewClaim,
  onOpenGatePass
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('pending');
  const [reviewNote, setReviewNote] = useState('');
  const [handoffLoc, setHandoffLoc] = useState('Main Security Desk / Campus Main Gate');

  const filteredClaims = claims.filter(c => {
    if (activeTab === 'pending') return c.status.toLowerCase() === 'pending';
    if (activeTab === 'approved') return c.status.toLowerCase() === 'approved';
    if (activeTab === 'rejected') return c.status.toLowerCase() === 'rejected';
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
            <h2 className="text-lg font-bold text-white tracking-tight">
              Security Desk • Claim Audit &amp; Handoff Center
            </h2>
            <p className="text-xs text-gray-400">
              Army Institute of Technology • Anti-Fraud Verification Console
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
            { id: 'pending', label: 'Pending Verification', count: claims.filter(c => c.status === 'Pending').length },
            { id: 'approved', label: 'Approved & Released', count: claims.filter(c => c.status === 'Approved').length },
            { id: 'rejected', label: 'Rejected Claims', count: claims.filter(c => c.status === 'Rejected').length },
            { id: 'all', label: 'All Logs', count: claims.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white border-t border-x border-white/15'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Claims List Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {filteredClaims.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/10">
              <FileCheck className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No Claims Found in this Queue</p>
              <p className="text-xs text-gray-400 mt-1">All campus property claims have been audited.</p>
            </div>
          ) : (
            filteredClaims.map((claim) => {
              const matchedItem = items.find(i => i.id === claim.itemId);
              const isPending = claim.status.toLowerCase() === 'pending';
              const isApproved = claim.status.toLowerCase() === 'approved';

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
                      ) : claim.status.toLowerCase() === 'rejected' ? (
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
                      <span className="text-gray-400 block text-[10px]">CLAIMANT NAME:</span>
                      <strong className="text-white">{claim.claimantName}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">EMAIL / ROLL:</span>
                      <strong className="text-gray-200">{claim.claimantEmail} ({claim.claimantRoll})</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">PHONE:</span>
                      <strong className="text-white">{claim.claimantPhone}</strong>
                    </div>
                  </div>

                  {/* Side-by-Side Verification Cross-Check */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Claimant's Answers */}
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                      <span className="text-xs font-bold text-red-400 uppercase tracking-wider block mb-1">
                        Claimant's Submitted Marks:
                      </span>
                      <p className="text-xs sm:text-sm text-gray-200 p-2.5 rounded-lg bg-white/[0.04] border border-white/10">
                        "{claim.answers}"
                      </p>
                      {claim.additionalProof && (
                        <p className="text-xs text-gray-400 mt-2">
                          Proof context: {claim.additionalProof}
                        </p>
                      )}
                    </div>

                    {/* Original Finder's Private Hint */}
                    <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                        Confidential Inventory Hint:
                      </span>
                      <p className="text-xs sm:text-sm text-emerald-200 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 font-semibold">
                        "{matchedItem?.privateAnswerHint || 'No private hint logged. Cross-reference in person.'}"
                      </p>
                      <p className="text-[11px] text-gray-400 mt-2">
                        Question: "{matchedItem?.verificationQuestion}"
                      </p>
                    </div>

                  </div>

                  {/* Actions & Gate Pass */}
                  {isPending ? (
                    <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex-1 min-w-[240px]">
                        <input
                          type="text"
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          placeholder="Audit review note (optional)..."
                          className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReject(claim)}
                          className="btn-glass px-4 py-2 text-xs text-red-400 border-red-500/30 hover:bg-red-600/20"
                        >
                          ✗ Reject Claim
                        </button>
                        <button
                          onClick={() => handleApprove(claim)}
                          className="btn-crimson px-5 py-2 text-xs"
                        >
                          ✓ Approve &amp; Issue Gate Pass
                        </button>
                      </div>
                    </div>
                  ) : isApproved ? (
                    <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs text-emerald-300 font-bold block">
                          Gate Pass Code: {claim.handoffPass || 'GP-AIT-9041'}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {claim.handoffInstructions || 'Collect from Main Security Desk with College ID.'}
                        </span>
                      </div>
                      <button
                        onClick={() => onOpenGatePass(matchedItem || { ...claim, id: claim.itemId })}
                        className="btn-glass px-3.5 py-1.5 text-xs text-emerald-400 border-emerald-500/30 flex items-center gap-1.5"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Print Gate Pass</span>
                      </button>
                    </div>
                  ) : null}

                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between shrink-0 text-xs text-gray-400">
          <span>AIT Security Dispatch Desk • Proctorial Clearance</span>
          <button
            onClick={onClose}
            className="btn-glass px-4 py-1.5 text-xs rounded-xl"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
