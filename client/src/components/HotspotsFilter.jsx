import React from 'react';
import { MapPin } from 'lucide-react';
import { AIT_LOCATIONS } from '../constants/aitData';

export default function HotspotsFilter({ selectedLocation, onSelectLocation, items = [] }) {
  const getCount = (loc) => items.filter(i => i.location === loc).length;

  return (
    <div className="mb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#E50914]" />
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            Campus Hotspots &amp; Landmarks (AIT Pune)
          </span>
        </div>
        {selectedLocation !== 'all' && (
          <button
            onClick={() => onSelectLocation('all')}
            className="text-xs text-[#E50914] hover:underline font-medium"
          >
            Show All Locations
          </button>
        )}
      </div>

      {/* Horizontal Scrolling Pill Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        
        {/* All Zones */}
        <button
          onClick={() => onSelectLocation('all')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            selectedLocation === 'all'
              ? 'bg-[#E50914] text-white shadow-lg shadow-red-900/40'
              : 'bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 border border-white/10'
          }`}
        >
          All Zones ({items.length})
        </button>

        {AIT_LOCATIONS.map((loc) => {
          const count = getCount(loc);
          const isSelected = selectedLocation === loc;

          return (
            <button
              key={loc}
              onClick={() => onSelectLocation(loc)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#E50914] text-white shadow-lg shadow-red-900/40'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 border border-white/10'
              }`}
            >
              <span>{loc}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-white text-[#E50914]' : 'bg-white/20 text-white'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}

      </div>

    </div>
  );
}
