import React, { useState } from 'react';
import { Play, TrendingUp, Instagram, Youtube, Video, Facebook, ShieldCheck, ExternalLink, Heart, Calendar, Zap, Share2, Activity, X, Maximize2, Copy, MessageSquare, Flame, BarChart3, Hash, Sparkles } from 'lucide-react';
import { Platform, VideoStatus, ViralVideo } from '../types';

interface ViralCardProps {
  video: ViralVideo;
  onRecreate: (video: ViralVideo) => void;
  onPlay: (video: ViralVideo) => void;
}

const PlatformIcon = ({ platform }: { platform: Platform }) => {
  switch (platform) {
    case Platform.Instagram: return <Instagram size={18} className="text-pink-500" />;
    case Platform.YouTube: return <Youtube size={18} className="text-red-500" />;
    case Platform.TikTok: return <Video size={18} className="text-cyan-400" />;
    case Platform.Facebook: return <Facebook size={18} className="text-blue-500" />;
    default: return <Video size={18} />;
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

  // Calculate engagement metrics for trend potential
  const parseNum = (str?: string): number => {
    if (!str) return 0;
    if (str.endsWith('M')) return parseFloat(str) * 1000000;
    if (str.endsWith('K')) return parseFloat(str) * 1000;
    return parseFloat(str) || 0;
  };

  const viewsNum = parseNum(video.views);
  const likesNum = parseNum(video.researchInsights?.likeCount);
  const sharesNum = parseNum(video.researchInsights?.shareCount);
  const commentsNum = parseNum(video.researchInsights?.commentCount);

  const shareRate = viewsNum > 0 ? ((sharesNum / viewsNum) * 100).toFixed(1) : '3.8';
  const likeRate = viewsNum > 0 ? ((likesNum / viewsNum) * 100).toFixed(1) : '12.4';

  const getCreatorHandle = (video: ViralVideo): string => {
    if (video.originalUrl) {
      const urlMatch = video.originalUrl.match(/@([\w.-]+)/);
      if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith('creator_') && !urlMatch[1].startsWith('marta_creator')) {
        return urlMatch[1];
      }
    }
    const raw = video.researchInsights?.creatorHandle || '';
    return raw.replace(/^@/, '') || 'creator';
  };

  const creatorHandle = getCreatorHandle(video);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-[2.5rem] overflow-hidden hover:border-purple-500/50 transition-all duration-300 group shadow-2xl flex flex-col w-full relative">
      
      {/* Top Header: Platform, Score & Direct Links */}
      <div className="p-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 rounded-2xl border border-white/10 flex items-center justify-center shadow-md">
            <PlatformIcon platform={video.platform} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">{video.platform} Trend</span>
            <span className="text-xs font-bold text-purple-300 font-mono">@{creatorHandle}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`px-3.5 py-1.5 rounded-2xl flex items-center gap-2 border shadow-inner ${
            video.viralScore >= 85 
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : video.viralScore >= 70
                ? 'bg-purple-950/60 border-purple-500/30 text-purple-300'
                : 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300'
          }`}>
            <Flame size={16} className={video.viralScore >= 85 ? "text-emerald-400 animate-bounce" : "text-orange-400 animate-pulse"} />
            <span className="text-sm font-black text-white">{video.viralScore}</span>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Score</span>
          </div>

          <a 
            href={video.originalUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl transition-all shadow-lg flex items-center justify-center active:scale-95 border border-purple-400/30"
            title="Ver Vídeo Original"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* Main Video Display Area (Tall 9:16 Vertical Aspect Ratio for Full Video Visibility) */}
      <div className="relative aspect-[9/12] w-full bg-black overflow-hidden shrink-0 group/image border-b border-slate-800">
        
        {/* Short-Form Video Duration Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white">
          <Zap size={12} className="text-yellow-400 fill-yellow-400" />
          <span className="text-[10px] font-black tracking-widest font-mono">
            {video.researchInsights?.durationFormatted || `${video.researchInsights?.duration || 45}s`}
          </span>
        </div>

        {video.researchInsights?.outlierMultiplier && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-purple-900/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-purple-400/40 text-purple-200">
            <TrendingUp size={12} className="text-purple-300" />
            <span className="text-[10px] font-black font-mono">{video.researchInsights.outlierMultiplier} Outlier</span>
          </div>
        )}

        {isPlaying && embedUrl ? (
            <div className="absolute inset-0 bg-black z-20 group/player flex items-center justify-center">
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
                
                <div className="absolute top-4 right-4 flex gap-2 z-30">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsPlaying(false); onPlay(video); }}
                        className="p-3 bg-black/80 text-white rounded-2xl hover:bg-purple-600 transition-colors backdrop-blur-md border border-white/20 shadow-xl"
                        title="Abrir em Modo Expandido"
                    >
                        <Maximize2 size={16} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsPlaying(false); }}
                        className="p-3 bg-black/80 text-white rounded-2xl hover:bg-red-600 transition-colors backdrop-blur-md border border-white/20 shadow-xl"
                        title="Fechar Player"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        ) : (
            <>
                <img 
                  src={video.thumbnailUrl} 
                  alt={video.title} 
                  className={`w-full h-full object-cover transition-transform duration-700 ${isGenerating ? 'scale-110 blur-sm' : 'group-hover/image:scale-105'}`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/20 to-transparent opacity-90" />

                {/* Overlaid Play Trigger Button */}
                {!isGenerating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[2px] transition-all group-hover/image:bg-black/50">
                        <button 
                          onClick={handlePlay}
                          className="px-8 py-4 bg-white hover:bg-purple-50 text-black font-black text-xs uppercase tracking-[0.2em] rounded-3xl flex items-center gap-3 shadow-2xl hover:scale-105 transition-all border border-white/40"
                        >
                          <Play size={18} className="fill-black text-black" /> Reproduzir Vídeo
                        </button>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-3 bg-black/70 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                          Clique para assistir em tela inteira
                        </span>
                    </div>
                )}
            </>
        )}
      </div>

      {/* Expanded Metrics & Viral Analytics Section */}
      <div className="p-6 flex-1 flex flex-col justify-between gap-6 bg-slate-900/90">
        
        {/* Creator Info & Copy Link */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-xs font-black text-purple-400">
              @
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block">Criador Original</span>
              <span className="text-sm font-bold text-white font-mono">@{creatorHandle}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {video.originalPostDate && (
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-white/5">
                    <Calendar size={12} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-300">{video.originalPostDate}</span>
                </div>
            )}
            <button
                onClick={handleCopyUrl}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${copyFeedback ? 'bg-green-600/20 border-green-500/30 text-green-400' : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'}`}
                title="Copiar Link do Vídeo"
            >
                {copyFeedback ? <ShieldCheck size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Video Title & Viral Description */}
        <div>
          <h3 className="text-white font-black text-lg leading-snug break-words mb-3">
            {video.title}
          </h3>

          {video.description && (
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/5 text-xs text-slate-300 font-medium leading-relaxed">
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
                <Flame size={14} className="text-orange-400" /> Análise do Gancho & Conceito
              </span>
              <p className="break-words leading-relaxed text-slate-200">{video.description}</p>
            </div>
          )}
        </div>

        {/* Detailed Engagement Metrics (Views, Likes, Comments, Shares) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">
            <span className="flex items-center gap-1.5"><BarChart3 size={14} className="text-purple-400" /> Métricas de Desempenho</span>
            <span className="text-purple-300">Engajamento: {video.researchInsights?.engagementRate || `${likeRate}%`}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-white/5 flex flex-col items-center text-center shadow-inner">
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider mb-1">Visualizações</span>
                  <span className="text-base font-black text-white">{video.views}</span>
              </div>
              
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-white/5 flex flex-col items-center text-center shadow-inner">
                  <span className="text-[9px] text-purple-400 font-black uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Heart size={10} fill="currentColor" /> Gostos
                  </span>
                  <span className="text-base font-black text-purple-300">{video.researchInsights?.likeCount || 'N/A'}</span>
              </div>
              
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-white/5 flex flex-col items-center text-center shadow-inner">
                  <span className="text-[9px] text-cyan-400 font-black uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MessageSquare size={10} /> Comentários
                  </span>
                  <span className="text-base font-black text-cyan-300">{video.researchInsights?.commentCount || 'N/A'}</span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-white/5 flex flex-col items-center text-center shadow-inner">
                  <span className="text-[9px] text-green-400 font-black uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Share2 size={10} /> Partilhas
                  </span>
                  <span className="text-base font-black text-green-300">{video.researchInsights?.shareCount || 'N/A'}</span>
              </div>
          </div>
        </div>

        {/* Viral Velocity & Audience Insights Box */}
        <div className="bg-purple-950/20 border border-purple-500/20 p-4 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
              <span className="text-purple-400 flex items-center gap-1.5"><Zap size={12} /> Velocidade da Tendência</span>
              <span className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">{video.researchInsights?.viralVelocity || 'Alta Velocidade'}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300 font-medium">
              <span className="text-slate-500 text-[10px] font-black uppercase">Segmento de Público:</span>
              <span className="font-bold text-white">{video.researchInsights?.audienceSegment || 'Público Geral'}</span>
            </div>
        </div>

        {/* Primary Replication Action Button */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={() => !isGenerating && onRecreate(video)}
            disabled={isGenerating || video.status !== VideoStatus.Scanned}
            className={`w-full py-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] shadow-2xl
              ${isGenerating 
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : video.status === VideoStatus.PendingApproval 
                  ? 'bg-green-900/40 text-green-300 border border-green-700/50 cursor-default'
                  : 'bg-white hover:bg-purple-100 text-black active:scale-95'
              }`}
          >
             <Sparkles size={16} />
             {video.status === VideoStatus.PendingApproval ? 'REPLICAÇÃO PRONTA' : 'INICIAR REPLICAÇÃO VIRAL'}
          </button>
        </div>

      </div>
    </div>
  );
};