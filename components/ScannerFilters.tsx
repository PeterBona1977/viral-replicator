import React, { useState, useEffect } from 'react';
import { Globe, Layers, Clock, Search, Hash, Radio, Activity, ShieldCheck, BrainCircuit, RotateCcw, Bookmark, Save, Trash2, Check, Sparkles } from 'lucide-react';
import { Platform, SUPPORTED_COUNTRIES, ScannerFilters, TimeRange, SavedSearch } from '../types';

const SAVED_SEARCHES_KEY = 'viralrep_saved_searches';

interface ScannerFiltersPanelProps {
  filters: ScannerFilters;
  onChange: (filters: ScannerFilters) => void;
  disabled: boolean;
  onReset?: () => void;
  onRunSearch?: () => void;
}

export const ScannerFiltersPanel: React.FC<ScannerFiltersPanelProps> = ({ filters, onChange, disabled, onReset, onRunSearch }) => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    const saved = localStorage.getItem(SAVED_SEARCHES_KEY);
    return saved ? JSON.parse(saved) : [
      {
        id: 'default_pt',
        name: 'TikTok Viral Portugal (30d)',
        filters: { countries: ['PT'], platforms: [Platform.TikTok], resultCount: 8, timeRange: TimeRange.Month, keywords: 'trending viral' },
        createdAt: Date.now()
      },
      {
        id: 'default_us',
        name: 'YouTube Shorts US (24h)',
        filters: { countries: ['US'], platforms: [Platform.YouTube], resultCount: 8, timeRange: TimeRange.Today, keywords: 'shorts' },
        createdAt: Date.now()
      }
    ];
  });

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState('');

  useEffect(() => {
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(savedSearches));
  }, [savedSearches]);

  const primaryCountry = filters.countries[0];
  const countryName = SUPPORTED_COUNTRIES.find(c => c.code === primaryCountry)?.name || primaryCountry;

  const handleSaveSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const name = presetNameInput.trim() || `${countryName} ${filters.platforms.join('/')} (${filters.keywords || 'Viral'})`;
    const newSaved: SavedSearch = {
      id: `search_${Date.now()}`,
      name,
      filters: { ...filters },
      createdAt: Date.now()
    };
    setSavedSearches([newSaved, ...savedSearches]);
    setPresetNameInput('');
    setShowSaveModal(false);
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedSearches(savedSearches.filter(s => s.id !== id));
  };

  const applySavedSearch = (saved: SavedSearch) => {
    onChange(saved.filters);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 mb-8 space-y-8 shadow-2xl backdrop-blur-xl">
      
      {/* Saved Searches / Presets Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/70 p-5 rounded-3xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
            <Bookmark size={18} className="text-purple-400" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Pesquisas Guardadas</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Selecione uma configuração salva para carregar</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setPresetNameInput(`${countryName} ${filters.platforms.join('/')} - ${filters.keywords || 'Geral'}`);
              setShowSaveModal(true);
            }}
            disabled={disabled}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <Save size={14} /> Guardar Pesquisa Atual
          </button>
        </div>
      </div>

      {/* Chips of Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="flex flex-wrap gap-2.5">
          {savedSearches.map(saved => (
            <div
              key={saved.id}
              onClick={() => applySavedSearch(saved)}
              className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 rounded-2xl flex items-center gap-3 cursor-pointer transition-all group"
            >
              <Sparkles size={12} className="text-purple-400" />
              <span className="text-xs font-bold text-slate-200 font-sans">{saved.name}</span>
              <button
                onClick={(e) => handleDeleteSaved(saved.id, e)}
                className="text-slate-600 hover:text-red-400 p-1 opacity-60 group-hover:opacity-100 transition-opacity"
                title="Eliminar Pesquisa"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Intelligence Dashboard Segment */}
      <div className="flex flex-col lg:flex-row gap-10 pt-2">
        <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                <Search size={14} className="text-purple-500" /> Palavras-Chave / Nicho / Hashtags
            </div>
            <div className="relative group">
                <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-purple-500 transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Introduza palavras-chave, nichos ou hashtags (ex: 'futebol', 'receitas', 'tecnologia')" 
                    value={filters.keywords}
                    onChange={(e) => onChange({ ...filters, keywords: e.target.value })}
                    disabled={disabled}
                    className="w-full bg-black/40 border border-slate-800 rounded-3xl py-5 pl-14 pr-6 text-sm text-white focus:outline-none focus:border-purple-600 transition-all placeholder:text-slate-700 font-black shadow-inner"
                />
            </div>
        </div>

        <div className="w-full lg:w-80 space-y-4">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                <Clock size={14} className="text-orange-500" /> Intervalo de Tempo
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
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
            <Globe size={14} className="text-blue-500" /> Região / País Alvo
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

        {/* Platform Sources */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
              <Layers size={14} className="text-green-500" /> Redes Sociais
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

      {/* Modal for Naming Saved Search */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-4" onClick={() => setShowSaveModal(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Guardar Pesquisa</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Defina um nome para esta configuração de pesquisa</p>
            </div>

            <form onSubmit={handleSaveSearch} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nome da Pesquisa Guardada</label>
                <input 
                  autoFocus
                  type="text" 
                  value={presetNameInput}
                  onChange={(e) => setPresetNameInput(e.target.value)}
                  placeholder="Ex: TikTok Portugal - Virais de Futebol"
                  className="w-full bg-black border border-slate-800 rounded-2xl py-4 px-5 text-sm text-white font-bold focus:border-purple-500 outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowSaveModal(false)} className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black text-[10px] uppercase">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">Guardar Preset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
