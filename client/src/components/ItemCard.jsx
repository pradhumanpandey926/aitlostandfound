import React from 'react';
import { MapPin, ArrowRight, Award, Eye } from 'lucide-react';
import ItemVisual from './ItemVisual';

export default function ItemCard({
  item,
  onOpenDetail,
  onOpenClaim,
  onOpenGatePass
}) {
  const isFound = item.type === 'found';
  const isClaimed = item.status.toLowerCase() === 'claimed';
  const isUnderReview = item.status.toLowerCase() === 'under review';
  const isVerified = item.status.toLowerCase() === 'verified';

  return (
    <article className="cinema-card flex flex-col justify-between group">
      
      <div className="relative">
        
        {/* Poster Artwork with Dark Gradient Scrim */}
        <div className="relative h-56 overflow-hidden">
          <ItemVisual 
            placeholder={item.imagePlaceholder} 
            imageData={item.imageData}
            hasRedacted={item.hasRedactedImage}
            title={item.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141419] via-[#141419]/50 to-transparent"></div>
        </div>

        {/* Top Badges (Platform Circular Pill) */}
        <div className="absolute top-3 left-3 z-10">
          
          {/* Platform Circular Badge (HBO blue / Netflix red style) */}
          <div className={`platform-badge ${
            isClaimed 
              ? 'platform-badge-amber' 
              : isUnderReview 
              ? 'platform-badge-amber'
              : isFound 
              ? 'platform-badge-blue' 
              : 'platform-badge-red'
          }`}>
            <span className="text-[10px] font-bold">
              {isClaimed ? 'PASS' : isUnderReview ? 'AUDIT' : isFound ? 'FOUND' : 'LOST'}
            </span>
          </div>

        </div>

        {/* Card Content Body */}
        <div className="p-5 pt-1">
          
          {/* Location Landmark */}
          <div className="flex items-center gap-1.5 text-xs text-[#E50914] font-semibold mb-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onOpenDetail(item)}
            className="font-bold text-base sm:text-lg text-white group-hover:text-[#FF4D52] transition-colors cursor-pointer line-clamp-1"
            title={item.title}
          >
            {item.title}
          </h3>

          {/* Subtitle Details */}
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
            <span>2026</span>
            <span>•</span>
            <span>{item.category}</span>
            <span>•</span>
            <span className="text-gray-500 font-mono text-[11px]">{item.refCode}</span>
          </p>

          <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Anti-Fraud Prompt Pill */}
          {item.verificationQuestion && (
            <div className="mt-3.5 p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] text-gray-300">
              <span className="text-[#E50914] font-semibold block text-[10px] uppercase">
                Verification Required:
              </span>
              <span className="truncate block italic text-gray-400">
                "{item.verificationQuestion}"
              </span>
            </div>
          )}

        </div>

      </div>

      {/* Card Actions Toolbar */}
      <div className="p-4 pt-0 border-t border-white/10 mt-2 flex items-center justify-between gap-2">
        
        <button
          onClick={() => onOpenDetail(item)}
          className="text-xs font-medium text-gray-300 hover:text-white flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-white/5 transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>

        {isClaimed ? (
          <button
            onClick={() => onOpenGatePass(item)}
            className="btn-glass px-4 py-2 text-xs flex items-center gap-1.5 text-emerald-400 border-emerald-500/30"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Gate Pass</span>
          </button>
        ) : isUnderReview ? (
          <button
            onClick={() => onOpenDetail(item)}
            className="btn-glass px-4 py-2 text-xs text-amber-400 border-amber-500/30"
          >
            <span>Under Review</span>
          </button>
        ) : (
          <button
            onClick={() => onOpenClaim(item)}
            className="btn-crimson px-4 py-2 text-xs flex items-center gap-1.5"
          >
            <span>{isFound ? 'Claim Item' : 'Found This'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

      </div>

    </article>
  );
}
