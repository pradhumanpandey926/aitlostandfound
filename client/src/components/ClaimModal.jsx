import React, { useState } from 'react';
import { X, Lock, ArrowRight, AlertCircle, ShieldAlert } from 'lucide-react';

export default function ClaimModal({ isOpen, onClose, item, onSubmitClaim, currentUser }) {
  if (!isOpen || !item) return null;

  const [claimantName, setClaimantName] = useState(currentUser?.name || '');
  const [claimantEmail, setClaimantEmail] = useState(currentUser?.email || '');
  const [claimantRoll, setClaimantRoll] = useState(currentUser?.regId || currentUser?.roll || '');
  const [claimantPhone, setClaimantPhone] = useState('');
  const [answers, setAnswers] = useState('');
  const [additionalProof, setAdditionalProof] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answers.trim()) {
      alert('Please answer the verification questionnaire with identifying details.');
      return;
    }

    if (!claimantEmail.endsWith('@aitpune.edu.in')) {
      alert('Only verified college emails ending with @aitpune.edu.in can claim campus items.');
      return;
    }

    setIsSubmitting(true);
    onSubmitClaim({
      itemId: item.id,
      itemRefCode: item.refCode,
      itemTitle: item.title,
      claimantName,
      claimantEmail,
      claimantRoll,
      claimantPhone,
      answers,
      additionalProof
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl overflow-y-auto">
      <div className="bg-[#121218] text-white border border-white/10 rounded-3xl w-full max-w-2xl my-6 relative max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-600/20 text-[#E50914] flex items-center justify-center border border-red-500/30">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Anti-Fraud Claim Verification
              </h2>
              <p className="text-xs text-gray-400">
                Case Ref: {item.refCode} • {item.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {/* Item Summary Callout */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <span className="text-[11px] text-[#E50914] font-semibold block">
                Found at: {item.location} ({item.date})
              </span>
              <strong className="text-base text-white">
                {item.title}
              </strong>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">
              {item.refCode}
            </span>
          </div>

          {/* Questionnaire Box */}
          <div className="p-4 rounded-2xl bg-red-600/10 border border-red-500/20 space-y-1">
            <div className="flex items-center gap-2 text-[#E50914] text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Finder / Security Questionnaire:</span>
            </div>
            <p className="text-sm font-semibold text-white mt-1">
              "{item.verificationQuestion || 'Please specify private identifying marks or content not visible in photographs.'}"
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Note: Finder and Security Desk will cross-check your answer before authorizing custody release.
            </p>
          </div>

          {/* Answers Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Your Specific Answer / Identifying Marks *
            </label>
            <textarea
              required
              rows={3}
              value={answers}
              onChange={(e) => setAnswers(e.target.value)}
              placeholder="e.g. Inscribed with initials 'AK 24' inside lid, sticker is Batman on the front, wallet contains ₹700 in 500+100 notes..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]"
            />
          </div>

          {/* Claimant Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={claimantName}
                onChange={(e) => setClaimantName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-[#E50914]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                College Email (@aitpune.edu.in) *
              </label>
              <input
                type="email"
                required
                value={claimantEmail}
                onChange={(e) => setClaimantEmail(e.target.value)}
                placeholder="name_roll@aitpune.edu.in"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-[#E50914]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Roll Number / Staff ID *
              </label>
              <input
                type="text"
                required
                value={claimantRoll}
                onChange={(e) => setClaimantRoll(e.target.value)}
                placeholder="23102"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-[#E50914]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                WhatsApp / Phone Number *
              </label>
              <input
                type="tel"
                required
                value={claimantPhone}
                onChange={(e) => setClaimantPhone(e.target.value)}
                placeholder="+91 98230 00000"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-[#E50914]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Circumstances of Loss / Context
              </label>
              <input
                type="text"
                value={additionalProof}
                onChange={(e) => setAdditionalProof(e.target.value)}
                placeholder="e.g. I attended the 11am tutorial in Academic Block Room 204."
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-[#E50914]"
              />
            </div>
          </div>

          {/* Honor Code */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-gray-400">
            AIT Honor Code: Making a fraudulent claim on property not belonging to you is subject to immediate disciplinary action.
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-glass px-5 py-2.5 text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-crimson px-6 py-2.5 text-xs sm:text-sm rounded-xl font-bold flex items-center gap-1.5"
            >
              <span>{isSubmitting ? 'Transmitting...' : 'Submit Claim for Verification'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
