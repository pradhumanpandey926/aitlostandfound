import React from 'react';
import { Search, LayoutGrid, Table, X } from 'lucide-react';
import { CATEGORIES } from '../constants/aitData';

export default function FilterControls({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  onResetFilters,
  totalResults = 0
}) {
  const hasActiveFilters = searchQuery || typeFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 mb-8 border border-white/10">
      
      {/* Top Search Input */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by item title, Casio calculator, ID card, keys, location, or ref code..."
          className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
        
        {/* Left: Type Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">
            Type:
          </span>
          {[
            { id: 'all', label: 'All Items' },
            { id: 'found', label: 'Found Only' },
            { id: 'lost', label: 'Lost Reports' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => onTypeFilterChange(t.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                typeFilter === t.id
                  ? t.id === 'found'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                    : t.id === 'lost'
                    ? 'bg-[#E50914] text-white shadow-lg shadow-red-900/40'
                    : 'bg-white text-black font-bold'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 border border-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Center: Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 hidden sm:inline">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="glass-dropdown text-xs text-gray-200 py-1.5 px-3 rounded-xl focus:outline-none focus:border-[#E50914] cursor-pointer"
            >
              <option value="all" className="bg-[#141419] text-white">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-[#141419] text-white">{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="glass-dropdown text-xs text-gray-200 py-1.5 px-3 rounded-xl focus:outline-none focus:border-[#E50914] cursor-pointer"
            >
              <option value="all" className="bg-[#141419] text-white">All Statuses</option>
              <option value="active" className="bg-[#141419] text-white">Active</option>
              <option value="under review" className="bg-[#141419] text-white">Under Review</option>
              <option value="claimed" className="bg-[#141419] text-white">Claimed</option>
              <option value="verified" className="bg-[#141419] text-white">Verified</option>
            </select>
          </div>

        </div>

        {/* Right: Results Count & View Toggle */}
        <div className="flex items-center gap-3">
          
          <span className="text-xs text-gray-400 font-medium">
            Showing: <strong className="text-white">{totalResults}</strong>
          </span>

          {/* View Toggles */}
          <div className="flex rounded-xl bg-white/[0.05] border border-white/10 p-0.5">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-[#E50914] text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="Poster Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-[#E50914] text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="Table View"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs text-[#E50914] hover:underline font-semibold"
            >
              Clear
            </button>
          )}

        </div>

      </div>

    </div>
  );
}
