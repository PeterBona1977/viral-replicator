import React, { useState } from 'react';
import { Play, TrendingUp, Instagram, Youtube, Video, Loader2, Facebook, ShieldCheck, ExternalLink, Heart, Calendar, Zap, Share2, Activity, X, Maximize2, Copy, MessageSquare, Flame } from 'lucide-react';
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
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 group shadow-xl flex flex-col h-full relative">
      
      {/* Top Media Header */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden shrink-0 group/image border-b border-slate-800/80">
        {isPlaying && embedUrl ? (
            <div className="absolute inset-0 bg-black z-20 group/player">
                {video.generatedVideoUrl ? (
                    <video src={embedUrl} className="w-full h-full object-contain" controls autoPlay />
                ) : (
                    <iframe 
                        src={embedUrl} 
                        className="w-full h-full border-0" 
                        allow="autoplay; encrypted-media; picture-in-picture" 
                        allowFullScreen
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    />
                )}
                
                <div className="absolute top-3 right-3 flex gap-2 z-30">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsPlaying(false); onPlay(video); }}
                        className="p-2 bg-black/70 text-white rounded-xl hover:bg-purple-600 transition-colors backdrop-blur-md border border-white/10"
                        title="Fullscreen Modal"
                    >
                        <Maximize2 size={14} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsPlaying(false); }}
                        className="p-2 bg-black/70 text-white rounded-xl hover:bg-red-600 transition-colors backdrop-blur-md border border-white/10"
                    >
                        <X size={14} />
                    </button>
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
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/50" />
                
                {/* Platform Badge (Top Left) */}
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 shadow-lg">
                  <PlatformIcon platform={video.platform} />
                  <span className="text-[10px] font-black uppercase text-white tracking-wider">{video.platform}</span>
                </div>

                {/* Score & Action Buttons (Top Right) */}
                <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                    <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-purple-500/30 flex items-center gap-1.5 shadow-lg">
                        <TrendingUp size={14} className="text-green-400" />
                        <span className="text-xs font-black text-white">{video.viralScore}</span>
                        <span className="text-[8px] text-purple-300 uppercase font-black tracking-tighter">Score</span>
                    </div>

                    <a 
                      href={video.originalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-purple-600 hover:bg-purple-500 backdrop-blur-md p-2 rounded-xl border border-purple-400/30 text-white transition-all shadow-lg flex items-center justify-center active:scale-95"
                      title="Open Original Link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={14} />
                    </a>
                </div>

                {/* Center Play Trigger Overlay */}
                {!isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                        <button 
                          onClick={handlePlay}
                          className="px-5 py-2.5 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl flex items-center gap-2 shadow-2xl hover:scale-105 transition-transform"
                        >
                          <Play size={14} className="fill-black" /> Preview Video
                        </button>
                    </div>
                )}
            </>
        )}
      </div>

      {/* Main Details Body - Expands Dynamically Without Internal Scroll */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4 bg-slate-900">
        
        {/* Creator & Timeline Row */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-black text-purple-400">
              @
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block leading-none">Creator</span>
              <span className="text-xs font-bold text-purple-300 font-mono">@{video.researchInsights?.creatorHandle || 'viral_creator'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {video.originalPostDate && (
                <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-white/5">
                    <Calendar size={12} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400">{video.originalPostDate}</span>
                </div>
            )}
            <button
                onClick={handleCopyUrl}
                className={`p-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 shadow-sm ${copyFeedback ? 'bg-green-600/20 border-green-500/30 text-green-400' : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'}`}
                title="Copy Link"
            >
                {copyFeedback ? <ShieldCheck size={12} /> : <Copy size={12} />}
            </button>
          </div>
        </div>

        {/* Title Section - Displays Full Title */}
        <div>
          <h3 className="text-white font-bold text-sm leading-snug break-words mb-2">
            {video.title}
          </h3>

          {/* Description & Hook Strategy */}
          {video.description && (
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-white/5 text-xs text-slate-300 font-medium leading-relaxed">
              <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest block mb-1 flex items-center gap-1">
                <Flame size={12} /> Hook Analysis & Description
              </span>
              <p className="break-words">{video.description}</p>
            </div>
          )}
        </div>

        {/* Complete Metrics Grid (No Scrolling, Full Info Displayed) */}
        <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="bg-slate-950 p-2.5 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider mb-0.5">Views</span>
                <span className="text-xs font-black text-white">{video.views}</span>
            </div>
            
            <div className="bg-slate-950 p-2.5 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                <span className="text-[8px] text-purple-400 font-black uppercase tracking-wider mb-0.5 flex items-center gap-0.5">
                  <Heart size={8} fill="currentColor" /> Likes
                </span>
                <span className="text-xs font-black text-purple-300">{video.researchInsights?.likeCount || 'N/A'}</span>
            </div>
            
            <div className="bg-slate-950 p-2.5 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                <span className="text-[8px] text-cyan-400 font-black uppercase tracking-wider mb-0.5 flex items-center gap-0.5">
                  <MessageSquare size={8} /> Comments
                </span>
                <span className="text-xs font-black text-cyan-300">{video.researchInsights?.commentCount || 'N/A'}</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                <span className="text-[8px] text-green-400 font-black uppercase tracking-wider mb-0.5 flex items-center gap-0.5">
                  <Share2 size={8} /> Shares
                </span>
                <span className="text-xs font-black text-green-300">{video.researchInsights?.shareCount || 'N/A'}</span>
            </div>
        </div>

        {/* Footer Action Button */}
        <div className="pt-2 border-t border-slate-800/80">
          <button
            onClick={() => !isGenerating && onRecreate(video)}
            disabled={isGenerating || video.status !== VideoStatus.Scanned}
            className={`w-full py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl
              ${isGenerating 
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : video.status === VideoStatus.PendingApproval 
                  ? 'bg-green-900/30 text-green-400 border border-green-800/50 cursor-default'
                  : 'bg-white hover:bg-slate-200 text-black active:scale-95'
              }`}
          >
             {video.status === VideoStatus.PendingApproval ? 'REPLICATION READY' : 'INITIATE REPLICATION'}
          </button>
        </div>

      </div>
    </div>
  );
};