import React, { useState } from 'react';
import { Play, TrendingUp, Instagram, Youtube, Video, Loader2, Globe, Clock, Facebook, ShieldCheck, ExternalLink, Heart, Calendar, Zap, Share2, Activity, X, Maximize2, Copy } from 'lucide-react';
import { Platform, VideoStatus, ViralVideo } from '../types';

interface ViralCardProps {
  video: ViralVideo;
  onRecreate: (video: ViralVideo) => void;
  onPlay: (video: ViralVideo) => void;
}

const PlatformIcon = ({ platform }: { platform: Platform }) => {
  switch (platform) {
    case Platform.Instagram: return <Instagram size={16} className="text-pink-500" />;
    case Platform.YouTube: return <Youtube size={16} className="text-red-500" />;
    case Platform.TikTok: return <Video size={16} className="text-cyan-400" />;
    case Platform.Facebook: return <Facebook size={16} className="text-blue-500" />;
    default: return <Video size={16} />;
  }
};

export const ViralCard: React.FC<ViralCardProps> = ({ video, onRecreate, onPlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const isGenerating = video.status === VideoStatus.Generating;

  const getEmbedUrl = (video: ViralVideo): string | null => {
    if (video.generatedVideoUrl) return video.generatedVideoUrl;

    const url = video.originalUrl;
    if (!url) return null;

    if (video.platform === Platform.YouTube) {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
        return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=0&controls=1&showinfo=0&rel=0` : null;
    }
    
    if (video.platform === Platform.TikTok) {
        // Try to extract video ID for embed
        const match = url.match(/\/video\/(\d+)/) || url.match(/(\d{19,})/);
        return match ? `https://www.tiktok.com/embed/v2/${match[1]}` : null;
    }

    if (video.platform === Platform.Instagram) {
        const match = url.match(/(?:\/p\/|\/reels\/|\/reel\/)([\w-]+)/);
        return match ? `https://www.instagram.com/reel/${match[1]}/embed/` : null;
    }

    return null;
  };

  const embedUrl = getEmbedUrl(video);

  const handlePlay = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (embedUrl) {
          setIsPlaying(true);
      } else {
          onPlay(video);
      }
  };

  const handleCopyUrl = (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(video.originalUrl);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 group shadow-lg flex flex-col relative h-[500px]">
      <div className="relative h-[320px] bg-slate-800 overflow-hidden group/image shrink-0">
        
        {isPlaying && embedUrl ? (
            <div className="absolute inset-0 bg-black z-20 group/player">
                {video.generatedVideoUrl ? (
                    <video src={embedUrl} className="w-full h-full object-cover" controls autoPlay />
                ) : (
                    <iframe 
                        src={embedUrl} 
                        className="w-full h-full border-0" 
                        allow="autoplay; encrypted-media; picture-in-picture" 
                        allowFullScreen
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    />
                )}
                
                {/* Player Controls Overlay */}
                <div className="absolute top-2 right-2 flex gap-2 z-30">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsPlaying(false); onPlay(video); }}
                        className="p-1.5 bg-black/60 text-white rounded-full hover:bg-blue-600 transition-colors backdrop-blur-md"
                        title="Expand"
                    >
                        <Maximize2 size={14} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsPlaying(false); }}
                        className="p-1.5 bg-black/60 text-white rounded-full hover:bg-red-600 transition-colors backdrop-blur-md"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Fallback/Source Links Overlay - Shows on hover or if embed is problematic */}
                <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-2 z-30 opacity-0 group-hover/player:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="pointer-events-auto flex gap-2">
                        <a 
                            href={video.originalUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-purple-600/90 hover:bg-purple-600 backdrop-blur-md px-3 py-1.5 rounded-full border border-purple-400/30 text-[9px] font-black uppercase tracking-widest text-white transition-all flex items-center gap-1.5 shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink size={10} /> Open {video.platform}
                        </a>
                        <button
                            onClick={handleCopyUrl}
                            className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-lg backdrop-blur-md ${copyFeedback ? 'bg-green-600/90 border-green-400/30 text-white' : 'bg-black/60 hover:bg-slate-800 border-white/10 text-white'}`}
                        >
                            {copyFeedback ? <ShieldCheck size={10} /> : <Copy size={10} />}
                            {copyFeedback ? 'Copied' : 'Copy URL'}
                        </button>
                    </div>
                </div>
            </div>
        ) : (
            <>
                <img 
                src={video.thumbnailUrl} 
                alt={video.title} 
                className={`w-full h-full object-cover transition-transform duration-500 ${isGenerating ? 'scale-110 blur-sm' : 'group-hover/image:scale-105'}`}
                loading="lazy"
                />
                
                {!isGenerating && (
                    <>
                        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                            <a 
                            href={video.originalUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-purple-600 backdrop-blur-md p-2 rounded-lg border border-purple-400/30 text-white hover:scale-110 transition-transform shadow-xl flex items-center justify-center"
                            title="Open Direct Link"
                            onClick={(e) => e.stopPropagation()}
                            >
                            <ExternalLink size={14} />
                            </a>
                            <div className="bg-black/60 backdrop-blur-md px-2 py-1.5 rounded-lg flex flex-col items-center border border-white/10 shadow-lg">
                            <div className="flex items-center gap-1">
                                <TrendingUp size={12} className="text-green-400" />
                                <span className="text-[10px] font-black text-white">{video.viralScore}</span>
                            </div>
                            <span className="text-[7px] text-slate-400 font-black uppercase tracking-tighter">Score</span>
                            </div>
                        </div>

                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/10 shadow-lg">
                        <PlatformIcon platform={video.platform} />
                        </div>
                        
                        {/* Status Overlay */}
                        <div className="absolute bottom-3 right-3 flex flex-col items-end gap-1.5">
                            {video.generatedVideoUrl && (
                                <div className="bg-green-600/90 backdrop-blur-md px-2 py-1 rounded-lg border border-green-400/30 flex items-center gap-1 shadow-xl">
                                    <Zap size={10} className="text-white" fill="currentColor" />
                                    <span className="text-[9px] font-black text-white uppercase tracking-tighter">Replicated</span>
                                </div>
                            )}
                            <div className="bg-purple-600/90 backdrop-blur-md px-2 py-1 rounded-lg border border-purple-400/30 flex items-center gap-1 shadow-xl">
                                <Activity size={10} className="text-white animate-pulse" />
                                <span className="text-[9px] font-black text-white uppercase tracking-tighter">Viral Spike</span>
                            </div>
                        </div>
                    </>
                )}
                
                {isGenerating && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4 text-center backdrop-blur-sm">
                        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-3" />
                        <span className="text-white font-black text-sm uppercase tracking-widest mb-1">Ciné-Processing</span>
                        <span className="text-purple-300 text-[10px] font-bold animate-pulse">
                            {video.generationStep || 'Analyzing...'}
                        </span>
                    </div>
                )}

                {!isGenerating && (
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4">
                        <button 
                        onClick={handlePlay}
                        className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:scale-110 transition-transform shadow-2xl cursor-pointer"
                        >
                        <Play className="text-white fill-white w-6 h-6 ml-1" />
                        </button>
                    </div>
                )}
            </>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col bg-slate-900 overflow-hidden">
        <div className="mb-3 shrink-0">
          <h3 className="text-white font-bold text-sm line-clamp-1 leading-tight mb-1" title={video.title}>{video.title}</h3>
          <div className="flex justify-between items-center">
             <p className="text-[10px] text-slate-500 font-mono">@{video.researchInsights?.creatorHandle || 'viral_origin'}</p>
             {video.originalPostDate && (
                <div className="flex items-center gap-1 bg-slate-800/50 px-1.5 py-0.5 rounded border border-white/5">
                    <Calendar size={10} className="text-slate-400" />
                    <span className="text-[9px] font-bold text-slate-400">{video.originalPostDate}</span>
                </div>
             )}
          </div>
        </div>

        {/* Vital Signals Panel */}
        <div className="grid grid-cols-3 gap-2 mb-3 shrink-0">
            <div className="bg-slate-950 p-2 rounded-xl border border-white/5 flex flex-col items-center text-center">
                <Activity size={10} className="text-green-400 mb-1" />
                <span className="text-[8px] text-slate-500 font-black uppercase">Retention</span>
                <span className="text-[10px] font-black text-white">{video.researchInsights?.retentionRate || '70%+'}</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-white/5 flex flex-col items-center text-center">
                <Zap size={10} className="text-purple-400 mb-1" />
                <span className="text-[8px] text-slate-500 font-black uppercase">Velocity</span>
                <span className="text-[10px] font-black text-white">{video.researchInsights?.engagementVelocity || 'Rapid'}</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-white/5 flex flex-col items-center text-center">
                <Share2 size={10} className="text-cyan-400 mb-1" />
                <span className="text-[8px] text-slate-500 font-black uppercase">Share Ratio</span>
                <span className="text-[10px] font-black text-white">{video.researchInsights?.shareRatio || '1:75'}</span>
            </div>
        </div>
        
        <div className="mt-auto pt-2 space-y-2 shrink-0">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Views</span>
                <span className="text-xs font-black text-white">{video.views}</span>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Heart size={8} fill="currentColor" /> Likes
                </span>
                <span className="text-xs font-black text-purple-400">{video.researchInsights?.likeCount || 'N/A'}</span>
            </div>
          </div>
          
          <button
            onClick={() => !isGenerating && onRecreate(video)}
            disabled={isGenerating || video.status !== VideoStatus.Scanned}
            className={`w-full py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest
              ${isGenerating 
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : video.status === VideoStatus.PendingApproval 
                  ? 'bg-green-900/30 text-green-400 border border-green-800/50 cursor-default'
                  : 'bg-white hover:bg-slate-200 text-black shadow-xl active:scale-95'
              }`}
          >
             {video.status === VideoStatus.PendingApproval ? 'REPLICATION READY' : 'INITIATE REPLICATION'}
          </button>
        </div>
      </div>
    </div>
  );
};