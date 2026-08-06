import React, { useState, useEffect } from 'react';
import { X, Terminal, Target, Zap, BookOpen, ChevronRight, Activity, Globe, Sparkles, FileText, ClipboardCheck, ArrowUpRight, Search, ListChecks, Play, ShieldCheck, Code, Clock, Cpu } from 'lucide-react';
import { SearchAudit } from '../types';

interface DiscoveryAuditPopupProps {
  audit: SearchAudit | null;
  onClose: () => void;
}

export const DiscoveryAuditPopup: React.FC<DiscoveryAuditPopupProps> = ({ audit, onClose }) => {
  const [activeTab, setActiveTab] = useState<'log' | 'guide' | 'strategy' | 'query'>('log');
  const [timestamp, setTimestamp] = useState<string>('');

  useEffect(() => {
    setTimestamp(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
  }, [audit]);
  
  if (!audit) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-500" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-5xl overflow-hidden shadow-2xl relative flex flex-col h-[90vh] md:h-[80vh]" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-cyan-600/10 rounded-3xl flex items-center justify-center border border-cyan-500/20 shadow-inner">
                    <Cpu className="text-cyan-400" size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Apify Scraper Audit</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Engine: Apify TikTok Scraper (Actor Coregent)</p>
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all border border-white/5"><X size={24} /></button>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Navigation */}
            <div className="w-24 md:w-72 border-r border-slate-800 bg-slate-950/20 flex flex-col p-6 gap-4 shrink-0">
                <button 
                  onClick={() => setActiveTab('log')}
                  className={`flex items-center gap-4 p-5 rounded-2xl transition-all ${activeTab === 'log' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}
                >
                    <Terminal size={24} />
                    <span className="hidden md:block font-black text-xs uppercase tracking-widest">Research Log</span>
                </button>
                <button 
                  onClick={() => setActiveTab('guide')}
                  className={`flex items-center gap-4 p-5 rounded-2xl transition-all ${activeTab === 'guide' ? 'bg-green-600/20 text-green-400 border border-green-500/30 shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}
                >
                    <ListChecks size={24} />
                    <span className="hidden md:block font-black text-xs uppercase tracking-widest">Replication Map</span>
                </button>
                <button 
                  onClick={() => setActiveTab('strategy')}
                  className={`flex items-center gap-4 p-5 rounded-2xl transition-all ${activeTab === 'strategy' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}
                >
                    <Target size={24} />
                    <span className="hidden md:block font-black text-xs uppercase tracking-widest">Viral Strategy</span>
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-12 no-scrollbar bg-slate-900/20">
                {activeTab === 'log' && (
                    <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2"><Search size={14} /> Apify Execution Trace</h4>
                            <div className="bg-black/80 p-10 rounded-[3rem] border border-white/5 font-mono text-[12px] leading-relaxed space-y-5 shadow-2xl">
                                {audit.operationLog.map((log, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <span className="text-slate-800 font-bold group-hover:text-cyan-400 transition-colors">[{new Date().getHours()}:{i+12}:{i+15}]</span>
                                        <span className="text-cyan-400 font-bold">APIFY:</span>
                                        <span className="text-slate-400 group-hover:text-slate-200 transition-colors">{log}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-10 bg-slate-900 border border-slate-800 rounded-[2.5rem] relative overflow-hidden group">
                            <Cpu className="absolute -bottom-8 -right-8 text-white/5 w-48 h-48 group-hover:scale-110 transition-transform duration-1000" />
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Globe size={14} /> Geographic & Social Graph Signal</h4>
                            <p className="text-lg text-slate-300 italic font-medium leading-relaxed">{audit.regionInsight}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'guide' && (
                    <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
                        <div className="flex justify-between items-end">
                             <div>
                                <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Replication Playbook</h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Replication blueprint derived from trend data</p>
                             </div>
                        </div>

                        <div className="grid gap-8">
                             <div className="group bg-slate-950 p-10 rounded-[3rem] border border-slate-800 hover:border-cyan-500/30 transition-all relative">
                                <div className="absolute top-10 left-0 w-1.5 h-12 bg-cyan-500 rounded-r-full" />
                                <h4 className="text-[12px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-4">The Hook</h4>
                                <p className="text-md text-slate-300 leading-relaxed font-medium">{audit.replicationPlaybook.hookAdvice}</p>
                             </div>

                             <div className="group bg-slate-950 p-10 rounded-[3rem] border border-slate-800 hover:border-purple-500/30 transition-all relative">
                                <div className="absolute top-10 left-0 w-1.5 h-12 bg-purple-500 rounded-r-full" />
                                <h4 className="text-[12px] font-black text-purple-400 uppercase tracking-[0.2em] mb-4">Sonic Strategy</h4>
                                <p className="text-md text-slate-300 leading-relaxed font-medium">{audit.replicationPlaybook.audioStrategy}</p>
                             </div>
                        </div>

                        <div className="pt-6">
                            <button 
                                onClick={onClose}
                                className="w-full py-6 bg-white text-black rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl hover:bg-slate-200 transition-all"
                            >
                                <Play size={24} fill="currentColor" /> Close & Review Results
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'strategy' && (
                    <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
                        <div className="bg-cyan-600/10 border border-cyan-500/20 p-12 rounded-[4rem] relative overflow-hidden">
                            <Sparkles className="absolute top-8 right-8 text-cyan-500 opacity-20" size={80} />
                            <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-8">Apify Extraction Summary</h4>
                            <p className="text-3xl font-black text-white leading-[1.15] tracking-tight">{audit.strategicSummary}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
