import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Shield, ArrowRight, Eye, MapPin } from 'lucide-react';
import ItemVisual from './ItemVisual';

export default function FeaturedCarousel({ items = [], onOpenDetail, onOpenClaim, onOpenGatePass }) {
  // Use first 5-7 items for the 3D carousel
  const carouselItems = items.slice(0, 5);
  const [activeIndex, setActiveIndex] = useState(2); // default center (like The Last of Us in the reference)

  if (carouselItems.length === 0) return null;

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  const activeItem = carouselItems[activeIndex];

  return (
    <section className="relative mb-14 pt-4 pb-10 overflow-hidden">
      
      {/* Ambient Crimson Backlight Glow (Directly from reference behind center card) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] cinema-ambient-glow pointer-events-none z-0"></div>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-8 px-2 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse"></span>
            <span className="text-xs font-bold text-[#E50914] uppercase tracking-wider">
              SPOTLIGHT RECOVERIES
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            High Priority Campus Property
          </h2>
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all backdrop-blur-md"
            title="Previous item"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all backdrop-blur-md"
            title="Next item"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3D Perspective Arc Carousel (Reference pin_image.jpg Coverflow) */}
      <div className="relative h-[420px] sm:h-[460px] flex items-center justify-center carousel-3d-stage z-10 px-4">
        {carouselItems.map((item, idx) => {
          // Calculate offset relative to activeIndex
          let offset = idx - activeIndex;
          if (offset < -2) offset += carouselItems.length;
          if (offset > 2) offset -= carouselItems.length;

          const isCenter = offset === 0;
          const isLeft = offset === -1;
          const isFarLeft = offset === -2;
          const isRight = offset === 1;
          const isFarRight = offset === 2;
          const isHidden = Math.abs(offset) > 2;

          if (isHidden) return null;

          // Determine styles based on 3D position
          let translateX = '0%';
          let translateZ = '0px';
          let scale = 1;
          let rotateY = 0;
          let zIndex = 30;
          let opacity = 1;

          if (isCenter) {
            translateX = '0%';
            translateZ = '120px';
            scale = 1.12;
            rotateY = 0;
            zIndex = 50;
            opacity = 1;
          } else if (isLeft) {
            translateX = '-75%';
            translateZ = '-40px';
            scale = 0.88;
            rotateY = 12;
            zIndex = 30;
            opacity = 0.85;
          } else if (isRight) {
            translateX = '75%';
            translateZ = '-40px';
            scale = 0.88;
            rotateY = -12;
            zIndex = 30;
            opacity = 0.85;
          } else if (isFarLeft) {
            translateX = '-140%';
            translateZ = '-160px';
            scale = 0.72;
            rotateY = 22;
            zIndex = 10;
            opacity = 0.45;
          } else if (isFarRight) {
            translateX = '140%';
            translateZ = '-160px';
            scale = 0.72;
            rotateY = -22;
            zIndex = 10;
            opacity = 0.45;
          }

          const isFound = item.type === 'found';
          const isClaimed = item.status.toLowerCase() === 'claimed';

          return (
            <div
              key={item.id}
              onClick={() => setActiveIndex(idx)}
              style={{
                transform: `translateX(${translateX}) translateZ(${translateZ}) scale(${scale}) rotateY(${rotateY}deg)`,
                zIndex,
                opacity
              }}
              className="absolute w-[240px] sm:w-[280px] h-[340px] sm:h-[390px] rounded-3xl overflow-hidden border border-white/15 bg-[#141419] shadow-2xl transition-all duration-500 ease-out cursor-pointer group flex flex-col justify-between"
            >
              {/* Full-bleed Visual Artwork */}
              <div className="absolute inset-0 z-0">
                <ItemVisual
                  placeholder={item.imagePlaceholder}
                  imageData={item.imageData}
                  hasRedacted={item.hasRedactedImage}
                  title={item.title}
                  className="w-full h-full object-cover"
                />
                {/* Cinema Gradient Scrim to Dark Bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#08080A] via-[#08080A]/60 to-transparent"></div>
              </div>

              {/* Top Badges (Directly inspired by HBO blue circle / Netflix red 'N' in reference) */}
              <div className="relative z-10 p-3.5 flex items-center justify-between">
                
                {/* Platform Badge (Circular pill like HBO/Netflix) */}
                <div className={`platform-badge ${
                  isClaimed 
                    ? 'platform-badge-amber' 
                    : isFound 
                    ? 'platform-badge-blue' 
                    : 'platform-badge-red'
                }`}>
                  <span className="text-[10px] tracking-wider">
                    {isClaimed ? 'PASS' : isFound ? 'FOUND' : 'LOST'}
                  </span>
                </div>

              </div>

              {/* Bottom Metadata (Title & Season/Location subtitles from reference) */}
              <div className="relative z-10 p-4 sm:p-5 text-white">
                <div className="flex items-center gap-1.5 text-xs text-[#E50914] font-semibold mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{item.location}</span>
                </div>

                <h3 className="font-bold text-base sm:text-lg text-white leading-tight line-clamp-1 group-hover:text-[#FF4D52] transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                  <span>2026</span>
                  <span>•</span>
                  <span>{item.category}</span>
                </p>
              </div>

            </div>
          );
        })}
      </div>

      {/* Active Featured Item Action Toolbar */}
      {activeItem && (
        <div className="relative z-20 max-w-xl mx-auto mt-6 px-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onOpenDetail(activeItem)}
            className="w-full sm:w-auto btn-glass px-6 py-2.5 text-sm flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4 text-gray-300" />
            <span>View Full Dossier</span>
          </button>

          {activeItem.status.toLowerCase() === 'claimed' ? (
            <button
              onClick={() => onOpenGatePass(activeItem)}
              className="w-full sm:w-auto btn-glass px-6 py-2.5 text-sm flex items-center justify-center gap-2 text-emerald-400 border-emerald-500/30"
            >
              <span>View Gate Pass</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenClaim(activeItem)}
              className="w-full sm:w-auto btn-crimson px-7 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <span>{activeItem.type === 'found' ? 'Claim This Item' : 'I Found This'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

    </section>
  );
}
