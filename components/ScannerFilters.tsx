
import React from 'react';
import { Globe, Layers, Clock, Search, Hash, Radio, Activity, ShieldCheck, BrainCircuit, RotateCcw } from 'lucide-react';
import { Platform, SUPPORTED_COUNTRIES, ScannerFilters, TimeRange } from '../types';

interface ScannerFiltersPanelProps {
  filters: ScannerFilters;
  onChange: (filters: ScannerFilters) => void;
  disabled: boolean;
  onReset?: () => void;
}

export const ScannerFiltersPanel: React.FC<ScannerFiltersPanelProps> = ({ filters, onChange, disabled, onReset }) => {
  const primaryCountry = filters.countries[0];
  const countryName = SUPPORTED_COUNTRIES.find(c => c.code === primaryCountry)?.name || primaryCountry;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 mb-8 space-y-10 shadow-2xl backdrop-blur-xl">
      
      {/* Intelligence Dashboard Segment */}
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 space-y-6">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                <Search size={14} className="text-purple-500" /> Viral Search Vector
            </div>
            <div className="relative group">
                <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-purple-500 transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Enter keywords, niches, or hashtags (e.g. 'ASMR cooking', 'AI art')" 
                    value={filters.keywords}
                    onChange={(e) => onChange({ ...filters, keywords: e.target.value })}
                    disabled={disabled}
                    className="w-full bg-black/40 border border-slate-800 rounded-3xl py-6 pl-14 pr-6 text-sm text-white focus:outline-none focus:border-purple-600 transition-all placeholder:text-slate-800 font-black shadow-inner"
                />
            </div>
        </div>

        <div className="w-full lg:w-72 space-y-6">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                <Clock size={14} className="text-orange-500" /> Time Window
            </div>
            <div className="grid grid-cols-2 gap-2">
                {Object.values(TimeRange).map((range) => (
                    <button
                        key={range}
                        onClick={() => onChange({ ...filters, timeRange: range })}
                        disabled={disabled}
                        className={`px-4 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                            filters.timeRange === range
                            ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-900/20'
                            : 'bg-black/20 text-slate-600 border-slate-800 hover:border-slate-700'
                        }`}
                    >
                        {range}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4 border-t border-slate-800/50">
        {/* Geo Focus */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
            <Globe size={14} className="text-blue-500" /> Geographic Target
          </div>
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_COUNTRIES.slice(0, 8).map((country) => {
              const isSelected = filters.countries.includes(country.code);
              return (
                <button
                  key={country.code}
                  onClick={() => !disabled && onChange({ ...filters, countries: [country.code] })}
                  disabled={disabled}
                  className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg'
                      : 'bg-black/20 text-slate-600 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {country.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Neural Sources */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
              <Layers size={14} className="text-green-500" /> Platform Sources
          </div>
          <div className="flex gap-3">
              {[Platform.TikTok, Platform.Instagram, Platform.YouTube].map((plat) => {
              const isSelected = filters.platforms.includes(plat);
              return (
                  <button
                      key={plat}
                      onClick={() => {
                        const next = filters.platforms.includes(plat) 
                          ? filters.platforms.filter(p => p !== plat) 
                          : [...filters.platforms, plat];
                        if (next.length > 0) onChange({ ...filters, platforms: next });
                      }}
                      disabled={disabled}
                      className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl border transition-all text-[10px] font-black uppercase tracking-widest ${
                          isSelected 
                          ? 'bg-black/40 border-green-500 text-white shadow-xl shadow-green-950/20' 
                          : 'bg-black/20 border-slate-800 text-slate-700 opacity-60'
                      }`}
                  >
                      <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-green-500 animate-pulse' : 'bg-slate-800'}`}></div>
                      {plat}
                  </button>
              );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
