import React from 'react';
import { MapPin, Eye, ArrowRight, Award } from 'lucide-react';

export default function TableView({
  items = [],
  onOpenDetail,
  onOpenClaim,
  onOpenGatePass
}) {
  if (items.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden mb-12 shadow-2xl">
      
      {/* Header Bar */}
      <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
          AIT Technical Recovery Manifest
        </span>
        <span className="text-[11px] text-[#E50914] font-semibold">
          13 Monitored Campus Zones
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 text-[11px] text-gray-400 uppercase tracking-wider bg-white/[0.01]">
              <th className="py-3.5 px-4">Ref Code</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Title &amp; Category</th>
              <th className="py-3.5 px-4">Campus Location</th>
              <th className="py-3.5 px-4">Date / Time</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-gray-300">
            {items.map((item) => {
              const isFound = item.type === 'found';
              const isClaimed = item.status.toLowerCase() === 'claimed';
              const isUnderReview = item.status.toLowerCase() === 'under review';

              return (
                <tr 
                  key={item.id}
                  className="hover:bg-white/[0.04] transition-colors"
                >
                  <td className="py-4 px-4 font-mono font-semibold text-white">
                    {item.refCode}
                  </td>

                  <td className="py-4 px-4">
                    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                      isFound ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-600/20 text-red-400 border border-red-500/30'
                    }`}>
                      {item.type.toUpperCase()}
                    </span>
                  </td>

                  <td className="py-4 px-4 max-w-xs">
                    <div 
                      onClick={() => onOpenDetail(item)}
                      className="font-bold text-white hover:text-[#E50914] cursor-pointer truncate"
                      title={item.title}
                    >
                      {item.title}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {item.category} {item.hasRedactedImage && '• [Privacy Masked]'}
                    </div>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-medium text-white">
                      <MapPin className="w-3.5 h-3.5 text-[#E50914] shrink-0" />
                      <span>{item.location}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap text-gray-400 text-[11px]">
                    {item.date} {item.time}
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    {isClaimed ? (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-600/20 text-amber-300 border border-amber-500/30">
                        Claimed
                      </span>
                    ) : isUnderReview ? (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-purple-600/20 text-purple-300 border border-purple-500/30">
                        Under Audit
                      </span>
                    ) : (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">
                        Active
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onOpenDetail(item)}
                        className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 transition-all"
                      >
                        Details
                      </button>

                      {isClaimed ? (
                        <button
                          onClick={() => onOpenGatePass(item)}
                          className="px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1"
                        >
                          <Award className="w-3 h-3" />
                          <span>Pass</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenClaim(item)}
                          className="btn-crimson px-3 py-1 text-xs"
                        >
                          Claim
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
