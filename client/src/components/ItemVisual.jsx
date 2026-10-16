import React from 'react';

export default function ItemVisual({ placeholder, imageData, hasRedacted, title, className = "h-48" }) {
  if (imageData) {
    return (
      <div className={`relative w-full ${className} bg-[#0c0c10] flex items-center justify-center overflow-hidden`}>
        <img src={imageData} alt={title} className="w-full h-full object-cover" />
        {hasRedacted && (
          <div className="absolute top-2.5 right-2.5 bg-[#E50914] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-md shadow-lg z-10">
            Privacy Masked
          </div>
        )}
      </div>
    );
  }

  // Cinematic Artwork Rendering for Campus Items
  const renderGraphic = () => {
    switch (placeholder) {
      case 'id-card':
        return (
          <div className="w-full h-full bg-gradient-to-br from-[#1C1C24] via-[#121218] to-[#0A0A0E] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Red Glow */}
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-red-600/20 rounded-full blur-2xl pointer-events-none"></div>
            
            {/* ID Card Plate */}
            <div className="w-48 bg-[#181822]/90 border border-white/15 rounded-xl p-3 shadow-2xl relative z-10 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="text-[9px] font-bold tracking-wider text-[#FF4D52]">ARMY INST. OF TECHNOLOGY</span>
                <span className="text-[8px] bg-red-600/30 text-red-300 border border-red-500/40 px-1.5 py-0.2 rounded font-bold">STUDENT</span>
              </div>
              <div className="flex gap-2.5 items-center my-2">
                <div className="w-12 h-14 bg-white/5 border border-white/15 rounded-lg flex flex-col items-center justify-center text-[8px] text-gray-400">
                  <span>PHOTO</span>
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 bg-[#E50914]/40 border border-red-500/50 rounded w-3/4 flex items-center px-1">
                    <span className="text-[6px] text-white font-mono font-bold tracking-wider">REDACTED</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded w-1/2"></div>
                  <div className="text-[8px] text-gray-400">TE MECH • 2023-27</div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-white/10 text-[8px] text-gray-500 font-mono">
                <span>||| | || |||| |</span>
                <span className="text-[#E50914] font-bold">PUNE</span>
              </div>
            </div>

            <div className="absolute bottom-2 left-3 bg-red-600/20 border border-red-500/30 text-red-300 text-[9px] px-2 py-0.5 rounded-full font-bold">
              Privacy Masked
            </div>
          </div>
        );

      case 'calculator':
        return (
          <div className="w-full h-full bg-gradient-to-br from-[#1C1C24] via-[#101016] to-[#0A0A0E] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="w-32 h-40 bg-[#14141C] border border-white/15 rounded-2xl p-2.5 shadow-2xl flex flex-col justify-between text-white">
              <div className="flex justify-between items-center text-[8px] text-gray-400">
                <span className="font-bold text-white">CASIO</span>
                <span className="text-[#FF4D52] font-semibold">fx-991CW</span>
              </div>
              {/* LCD Display */}
              <div className="bg-[#08080A] text-emerald-400 font-mono p-1.5 border border-white/10 rounded-lg text-[9px] leading-tight">
                <div className="text-gray-400">∫(3x² + 2x)dx</div>
                <div className="text-right font-bold text-white mt-0.5">= 24.500</div>
              </div>
              {/* Keypad Grid */}
              <div className="grid grid-cols-4 gap-1 pt-1">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-3 rounded border text-[6px] flex items-center justify-center font-mono ${
                      i === 15 
                        ? 'bg-[#E50914] text-white border-red-500 font-bold' 
                        : i < 4 
                        ? 'bg-white/10 text-white border-white/10' 
                        : 'bg-white/5 text-gray-300 border-white/5'
                    }`}
                  >
                    {i === 15 ? '=' : i === 0 ? 'OPT' : i === 1 ? 'CALC' : `${i}`}
                  </div>
                ))}
              </div>
            </div>

            <span className="absolute bottom-2 right-2 text-[9px] text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full font-mono">
              Desk #24
            </span>
          </div>
        );

      case 'wallet':
        return (
          <div className="w-full h-full bg-gradient-to-br from-[#1C1C24] via-[#121218] to-[#0A0A0E] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="w-44 h-28 bg-gradient-to-br from-[#5A3828] to-[#362016] border border-amber-900/40 rounded-xl p-3 shadow-2xl relative flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[9px] text-amber-200 font-bold tracking-widest">WILDHORN</span>
                <div className="bg-[#E50914] text-white text-[7px] font-bold px-1.5 py-0.5 rounded">
                  SBI ATM
                </div>
              </div>
              <div className="flex justify-between items-end border-t border-amber-800/30 pt-1 text-[8px] text-amber-300/80">
                <span>Genuine Leather</span>
                <span className="font-bold">₹700 Cash</span>
              </div>
            </div>
          </div>
        );

      case 'sports':
        return (
          <div className="w-full h-full bg-gradient-to-br from-[#1C1C24] via-[#101016] to-[#0A0A0E] flex items-center justify-center p-3 relative overflow-hidden">
            <div className="w-36 h-36 relative flex items-center justify-center">
              <div className="w-28 h-32 rounded-full border-4 border-emerald-500/80 flex items-center justify-center relative bg-emerald-950/20 shadow-inner">
                <div className="w-full h-full border border-white/20 rounded-full flex items-center justify-center">
                  <span className="text-[10px] text-emerald-400 font-bold rotate-12">YONEX</span>
                </div>
              </div>
              <div className="absolute -bottom-3 w-4 h-14 bg-gradient-to-b from-[#E50914] to-black rounded-b-md"></div>
            </div>
            <span className="absolute bottom-2 left-2 text-[9px] bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              Sports Dept
            </span>
          </div>
        );

      case 'notes':
        return (
          <div className="w-full h-full bg-gradient-to-br from-[#1C1C24] via-[#121218] to-[#0A0A0E] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="w-36 h-40 bg-[#161620] border border-white/15 rounded-xl p-3 shadow-2xl flex flex-col justify-between text-white relative">
              <div>
                <div className="text-[9px] font-bold text-[#FF4D52] border-b border-white/10 pb-1">
                  ENGG MATHS - III
                </div>
                <div className="text-[8px] text-gray-400 mt-2 space-y-1 font-mono">
                  <div>L{'{'}f(t){'}'} = ∫ e^(-st) f(t) dt</div>
                  <div>Unit 2: Fourier Transforms</div>
                  <div>Room AB-204</div>
                </div>
              </div>
              <div className="text-[7px] text-gray-500 border-t border-white/10 pt-1">
                SE Comp &amp; Mech
              </div>
            </div>
          </div>
        );

      case 'earbuds':
        return (
          <div className="w-full h-full bg-gradient-to-br from-[#1C1C24] via-[#121218] to-[#0A0A0E] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="w-28 h-28 bg-[#181824] rounded-2xl border border-white/15 shadow-2xl flex flex-col items-center justify-center relative p-3">
              <div className="w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center text-xs mb-1">
                🦇
              </div>
              <span className="text-[8px] font-bold text-gray-300">boAt 141</span>
              <div className="flex gap-1 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
              </div>
            </div>
          </div>
        );

      case 'keys':
        return (
          <div className="w-full h-full bg-gradient-to-br from-[#1C1C24] via-[#121218] to-[#0A0A0E] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="w-32 h-32 relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-amber-500/70 flex items-center justify-center relative shadow-lg">
                <div className="w-3.5 h-14 bg-gradient-to-b from-amber-400 to-amber-600 rounded-b rotate-12 absolute -bottom-4 left-3"></div>
                <div className="w-3.5 h-12 bg-gradient-to-b from-amber-500 to-amber-700 rounded-b -rotate-12 absolute -bottom-3 right-3"></div>
              </div>
            </div>
            <span className="absolute bottom-2 right-2 text-[9px] bg-amber-600/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
              Godrej #4
            </span>
          </div>
        );

      case 'blazer':
        return (
          <div className="w-full h-full bg-gradient-to-br from-[#1C1C24] via-[#121218] to-[#0A0A0E] flex items-center justify-center p-3 relative overflow-hidden">
            <div className="w-36 h-36 bg-gradient-to-b from-[#182138] to-[#0E1524] border border-white/15 rounded-t-2xl p-2.5 shadow-2xl flex flex-col items-center justify-between text-white relative">
              <div className="w-12 h-14 border-b-2 border-x-2 border-amber-400 rounded-b flex flex-col items-center justify-center text-[7px] font-bold">
                SIZE 40
              </div>
              <div className="absolute top-8 left-3 text-sm">🛡️</div>
              <div className="flex gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
              </div>
            </div>
            <span className="absolute bottom-1 right-2 text-[9px] text-[#FF4D52] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full font-bold">
              AIT Crest
            </span>
          </div>
        );

      case 'watch':
        return (
          <div className="w-full h-full bg-gradient-to-br from-[#1C1C24] via-[#121218] to-[#0A0A0E] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="w-24 h-36 bg-[#161622] border border-white/15 rounded-2xl p-2 flex flex-col justify-between text-white shadow-2xl">
              <div className="w-8 h-2 bg-white/10 rounded-full mx-auto"></div>
              <div className="bg-[#0A0A0E] border border-white/10 rounded-xl p-1.5 text-center">
                <span className="text-[7px] text-[#FF4D52] font-bold">FASTRACK</span>
                <div className="text-sm font-bold text-white my-0.5">15:10</div>
                <div className="text-[6px] text-gray-500">FRI 12 OCT</div>
              </div>
              <div className="w-8 h-2 bg-white/10 rounded-full mx-auto"></div>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full bg-gradient-to-br from-[#1C1C24] to-[#0A0A0E] flex flex-col items-center justify-center p-4 text-white">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl mb-2">
              📦
            </div>
            <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
              Campus Gear
            </span>
          </div>
        );
    }
  };

  return (
    <div className={`relative w-full ${className} overflow-hidden`}>
      {renderGraphic()}
    </div>
  );
}
