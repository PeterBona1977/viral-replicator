
import { X, Play, Zap, Instagram, Video, BarChart3, TrendingUp, Users, ShieldCheck, Target, Music, Share2, MessageSquare, Globe2, Hash, ExternalLink, Calendar, AlertCircle, Link2, Ghost, ShieldQuestion, Globe, ChevronRight, ShieldAlert, Eye, Terminal, Activity, HelpCircle, Sparkles, Smartphone, Monitor, Shield, Film, Wand2, Copy } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { ViralVideo, Platform } from '../types';

interface VideoModalProps {
  video: ViralVideo | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [embedError, setEmbedError] = useState(false);
  const [activeGate, setActiveGate] = useState<'official' | 'mirror'>('official');
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [viewMode, setViewMode] = useState<'original' | 'generated'>('original');
  const [copied, setCopied] = useState(false);
  
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (video) { 
      // Reset all states for the new video
      setIframeLoaded(false); 
      setEmbedError(false);
      setLoadTimedOut(false);
      setActiveGate('official');
      setViewMode(video.generatedVideoUrl ? 'generated' : 'original');
      setCopied(false);
      
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      
      timeoutRef.current = window.setTimeout(() => {
        // We use a functional update or ref-check to see if still not loaded
        setLoadTimedOut(prev => {
          // If the modal is still open and iframe hasn't reported loaded
          return true; 
        });
      }, 5500);
    }
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [video]); // ONLY depend on the video changing

  // Separated timeout handler to avoid the dependency loop
  useEffect(() => {
      if (iframeLoaded) {
          setLoadTimedOut(false);
          if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      }
  }, [iframeLoaded]);

  if (!video) return null;

  const getEmbedUrl = (video: ViralVideo, type: 'official' | 'mirror'): string | null => {
    const url = video.originalUrl;
    
    if (type === 'mirror') {
      return `https://www.croxyproxy.com/_zh/proxify?url=${encodeURIComponent(url)}`;
    }

    if (video.platform === Platform.YouTube) {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
      return match ? `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&modestbranding=1&rel=0` : null;
    }
    
    if (video.platform === Platform.TikTok) {
      const match = url.match(/\/video\/(\d{15,25})/) || url.match(/(\d{18,20})/);
      return match ? `https://www.tiktok.com/embed/v2/${match[1]}` : null;
    }

    if (video.platform === Platform.Instagram) {
        const match = url.match(/(?:\/p\/|\/reels\/|\/reel\/)([\w-]+)/);
        return match ? `https://www.instagram.com/reel/${match[1]}/embed/` : null;
    }

    return null;
  };

  const openCleanPopout = () => {
    window.open(video.originalUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(video.originalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentUrl = getEmbedUrl(video, activeGate);
  const isVertical = video.platform !== Platform.YouTube || video.originalUrl.includes('shorts');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className={`bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-6xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row h-[90vh] md:h-[85vh] ${isVertical ? 'md:max-w-5xl' : 'max-w-7xl'}`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-50 pointer-events-none">
            <div className="flex gap-2 pointer-events-auto">
                {video.generatedVideoUrl && (
                  <div className="flex bg-black/40 backdrop-blur-md rounded-full border border-white/10 p-1">
                      <button 
                        onClick={() => setViewMode('original')}
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'original' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}
                      >
                         <Shield size={12} /> Source
                      </button>
                      <button 
                        onClick={() => setViewMode('generated')}
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'generated' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                      >
                         <Wand2 size={12} /> Veo AI
                      </button>
                  </div>
                )}
               {!video.generatedVideoUrl && (
                 <div className="px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                   <Shield size={12} className="text-purple-400" />
                   Bypass Protocol: {activeGate.toUpperCase()}
                 </div>
               )}
            </div>
            <button onClick={onClose} className="p-3 bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-full text-white transition-all hover:scale-110 border border-white/10 pointer-events-auto"><X size={20} /></button>
        </div>

        {/* Media Viewport */}
        <div className={`flex-1 bg-black relative flex items-center justify-center overflow-hidden min-h-[350px] ${isVertical ? 'md:w-[45%]' : 'md:w-3/5'}`}>
            
            {/* Generated AI Video Player */}
            {viewMode === 'generated' && video.generatedVideoUrl ? (
                <div className="w-full h-full flex items-center justify-center bg-black relative">
                   <video 
                     src={video.generatedVideoUrl} 
                     controls 
                     autoPlay 
                     loop 
                     className="w-full h-full object-contain"
                   />
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 animate-pulse">
                      <Sparkles size={48} className="text-purple-500" />
                   </div>
                </div>
            ) : (
                /* Original Embed Player */
                <>
                    {!iframeLoaded && !loadTimedOut && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 gap-4 z-10">
                            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                            <div className="text-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Opening Gateway...</span>
                                <p className="text-[8px] text-slate-600 uppercase mt-1 animate-pulse">Establishing Referrer-Hidden Link</p>
                            </div>
                        </div>
                    )}

                    {(loadTimedOut && !iframeLoaded) || embedError ? (
                        <div className="p-10 text-center flex flex-col items-center w-full h-full justify-center bg-slate-950/80 animate-in zoom-in-95 duration-500">
                            <ShieldAlert size={48} className="text-red-500 mb-6 animate-pulse" />
                            <h4 className="text-white font-black text-xl mb-2 uppercase tracking-tighter">Connection Refused</h4>
                            <p className="text-slate-500 text-[10px] mb-8 uppercase tracking-[0.1em] max-w-sm leading-relaxed">
                                The platform detected an unauthorized embed attempt. High-security platforms often block direct framing to prevent scraping.
                            </p>
                            
                            <div className="flex flex-col gap-3 w-full max-w-xs">
                                <button 
                                    onClick={openCleanPopout}
                                    className="bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-3 shadow-xl"
                                >
                                    Launch New Tab <ExternalLink size={16} />
                                </button>
                                <button 
                                    onClick={() => { setLoadTimedOut(false); setActiveGate('mirror'); }}
                                    className="bg-slate-800/80 hover:bg-slate-800 text-slate-300 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/5"
                                >
                                    Force Proxy Mirror <Globe size={14} className="ml-2 inline" />
                                </button>
                            </div>
                        </div>
                    ) : currentUrl ? (
                        <div className="w-full h-full relative">
                        <iframe 
                            src={currentUrl} 
                            className={`w-full h-full border-0 transition-opacity duration-700 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
                            onLoad={() => setIframeLoaded(true)}
                            onError={() => setEmbedError(true)}
                            allow="autoplay; encrypted-media; fullscreen"
                            allowFullScreen
                            referrerPolicy="no-referrer"
                            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
                        />
                        
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
                            <button 
                            onClick={openCleanPopout}
                            className="bg-black/60 hover:bg-black backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest text-white transition-all flex items-center gap-2"
                            >
                            <ExternalLink size={12} /> Open Directly
                            </button>
                            <button 
                            onClick={() => setActiveGate(activeGate === 'official' ? 'mirror' : 'official')}
                            className="bg-purple-600 hover:bg-purple-500 shadow-xl px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all flex items-center gap-2"
                            >
                            <Globe size={12} /> {activeGate === 'official' ? 'Try Mirror' : 'Try Direct'}
                            </button>
                        </div>
                        </div>
                    ) : null}
                </>
            )}
        </div>

        {/* Audit Panel */}
        <div className="w-full md:w-[320px] lg:w-[400px] bg-slate-900/40 p-8 border-l border-slate-800 flex flex-col h-full overflow-y-auto no-scrollbar backdrop-blur-md">
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                     <div className={`w-2 h-2 rounded-full ${viewMode === 'generated' ? 'bg-purple-500' : 'bg-green-500'} animate-pulse`} />
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                        {viewMode === 'generated' ? 'AI Generated Media' : 'Live Trend Verification'}
                     </span>
                </div>
                <h3 className="text-white font-black text-2xl leading-[1.1] mb-3 tracking-tighter">{video.title}</h3>
                <div className="flex items-center gap-3">
                   <p className="text-purple-400 text-[10px] font-black uppercase tracking-widest">@{video.researchInsights?.creatorHandle || 'origin'}</p>
                   <div className="h-4 w-px bg-slate-800" />
                   <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                      <TrendingUp size={10} className="text-green-500" />
                      <span className="text-[9px] font-black text-green-500">{video.viralScore}%</span>
                   </div>
                </div>
            </div>

            <div className="space-y-8 flex-1">
                {viewMode === 'original' ? (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Views</p>
                                <p className="text-white font-black text-lg">{video.views}</p>
                            </div>
                            <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Region</p>
                                <p className="text-white font-black text-lg">{video.country}</p>
                            </div>
                        </div>

                        <div className="bg-slate-950/50 rounded-2xl p-6 border border-white/5">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2"><Sparkles size={12} className="text-purple-400" /> Viral Logic</h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic">
                                {video.description}
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-right">
                        <div className="bg-purple-500/10 p-6 rounded-2xl border border-purple-500/20">
                            <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Wand2 size={12} /> Veo Prompt Used
                            </h4>
                            <p className="text-[11px] text-white italic leading-relaxed">
                                {video.generationPrompt || "Cinematic 9:16 vertical video..."}
                            </p>
                        </div>
                        <div className="bg-slate-950 p-6 rounded-2xl border border-white/5">
                             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Technical Specs</h4>
                             <div className="space-y-2">
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-slate-400">Model</span>
                                    <span className="text-white font-bold">Veo 3.1 Fast</span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-slate-400">Resolution</span>
                                    <span className="text-white font-bold">720p (Vertical)</span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-slate-400">FPS</span>
                                    <span className="text-white font-bold">24 Cinematic</span>
                                </div>
                             </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-800">
                <div className="mb-4 bg-black/40 p-3 rounded-xl border border-white/5">
                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Source URL</p>
                     <div className="flex gap-2">
                        <input readOnly value={video.originalUrl} className="w-full bg-transparent text-[10px] text-purple-300 font-mono outline-none truncate" />
                        <button onClick={handleCopyUrl} className="text-slate-400 hover:text-white transition-colors">
                            {copied ? <ShieldCheck size={12} /> : <Copy size={12} />}
                        </button>
                     </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="w-full py-4 bg-slate-800/30 text-slate-500 font-black hover:text-white transition-all text-[11px] uppercase tracking-[0.3em] rounded-2xl border border-white/5"
                >
                    Dismiss Studio
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
