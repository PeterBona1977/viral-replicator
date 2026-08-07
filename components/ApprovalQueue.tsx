
import React, { useState, useEffect } from 'react';
import { Check, X, Share2, AlertTriangle, Eye, Play, Loader2, CheckCircle2, Sparkles, Hash, MessageSquare, ArrowRight } from 'lucide-react';
import { VideoStatus, ViralVideo, SocialAccount, Platform, PublishingMetadata } from '../types';
import { generateSocialMetadata } from '../services/metadataService';

interface ApprovalQueueProps {
  videos: ViralVideo[];
  connectedAccounts: SocialAccount[];
  onApprove: (id: string, metadata: PublishingMetadata) => void;
  onReject: (id: string) => void;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({ videos, connectedAccounts, onApprove, onReject }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Record<string, boolean>>({});
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [previewMetadata, setPreviewMetadata] = useState<PublishingMetadata | null>(null);

  const selectedVideo = videos.find(v => v.id === selectedId) || videos[0];

  useEffect(() => {
    if (videos.length > 0 && !selectedId) {
      setSelectedId(videos[0].id);
    }
    const initialPlatforms: Record<string, boolean> = {};
    connectedAccounts.forEach(acc => {
      if (acc.connected) initialPlatforms[acc.platform] = true;
    });
    setSelectedPlatforms(initialPlatforms);
    setPreviewMetadata(null);
  }, [videos, connectedAccounts, selectedId]);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => ({ ...prev, [platform]: !prev[platform] }));
    setPreviewMetadata(null);
  };

  const handleSynthesize = async () => {
    const platforms = Object.entries(selectedPlatforms)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name as Platform);

    if (platforms.length === 0) return;

    setIsSynthesizing(true);
    try {
      const meta = await generateSocialMetadata(selectedVideo, platforms);
      setPreviewMetadata(meta);
    } catch (e) {
      console.error("Synthesis failed", e);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleFinalPublish = () => {
    if (previewMetadata) {
      onApprove(selectedVideo.id, previewMetadata);
    }
  };

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-6 text-center pb-24">
        <CheckCircle2 className="w-16 h-16 mb-4 text-purple-500/20" />
        <p className="text-lg font-bold text-white">Queue Cleared</p>
        <p className="text-sm opacity-60">Everything is published or discarded.</p>
      </div>
    );
  }

  const activePlatformCount = Object.values(selectedPlatforms).filter(Boolean).length;

  return (
    <div className="flex flex-col lg:flex-row h-full md:gap-6 md:p-6 bg-slate-950">
      
      {/* List Strip */}
      <div className="flex-none w-full lg:w-80 flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto p-4 lg:p-0 border-b lg:border-b-0 lg:border-r border-slate-800 shrink-0">
        <h2 className="hidden lg:block text-xl font-bold text-white mb-4">Pending Review ({videos.length})</h2>
        {videos.map(video => (
          <div
            key={video.id}
            onClick={() => setSelectedId(video.id)}
            className={`flex-shrink-0 w-64 lg:w-auto p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
              selectedVideo?.id === video.id ? 'bg-purple-600/10 border-purple-500' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <img src={video.thumbnailUrl} alt="" className="w-10 h-14 object-cover rounded-lg bg-slate-800" />
            <div className="min-w-0">
              <h4 className="text-white font-medium text-xs line-clamp-1">{video.title}</h4>
              <p className="text-slate-500 text-[10px] mt-1 uppercase font-bold">{video.platform}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Workspace */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-900 lg:rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h3 className="text-white font-black text-xl md:text-2xl mb-2 line-clamp-1">{selectedVideo.title}</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Targets:</span>
              <div className="flex gap-1.5">
                {connectedAccounts.map(acc => (
                  <button
                    key={acc.platform}
                    onClick={() => acc.connected && togglePlatform(acc.platform)}
                    className={`px-2 py-1 rounded-md text-[9px] font-black uppercase transition-all ${
                      !acc.connected ? 'hidden' : selectedPlatforms[acc.platform] ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {acc.platform}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={() => onReject(selectedVideo.id)} className="flex-1 md:flex-none px-4 py-2 bg-slate-800 text-slate-400 rounded-xl font-black text-[10px] uppercase border border-slate-700">Discard</button>
            {!previewMetadata ? (
                <button 
                  onClick={handleSynthesize} 
                  disabled={activePlatformCount === 0 || isSynthesizing}
                  className="flex-1 md:flex-none px-6 py-2 bg-white text-black rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2"
                >
                  {isSynthesizing ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                  {isSynthesizing ? 'Synthesizing...' : 'Review Post Copy'}
                </button>
            ) : (
                <button 
                  onClick={handleFinalPublish} 
                  className="flex-1 md:flex-none px-8 py-2 bg-purple-600 text-white rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40"
                >
                  <Share2 size={14} /> Commit & Post Live
                </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
           {previewMetadata ? (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto space-y-6">
                <div className="bg-black/40 border border-purple-500/20 rounded-3xl p-8 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                      <MessageSquare size={120} />
                   </div>
                   <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-4">Generated Social Caption</h4>
                   <p className="text-lg md:text-xl text-white font-medium leading-relaxed italic">"{previewMetadata.caption}"</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                         <Hash size={14} className="text-cyan-400" /> Viral Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {previewMetadata.hashtags.map((tag, i) => (
                          <span key={i} className="px-3 py-1 bg-slate-900 rounded-lg text-xs text-cyan-400 font-mono border border-cyan-500/10">#{tag}</span>
                        ))}
                      </div>
                   </div>
                   <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                         <ArrowRight size={14} className="text-green-400" /> Destination Feeds
                      </h4>
                      <div className="space-y-2">
                        {previewMetadata.platforms.map(p => (
                          <div key={p} className="flex items-center gap-2 text-white font-black text-[10px] uppercase">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> {p} Workspace Sync
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
                
                <div className="text-center py-4">
                   <button onClick={() => setPreviewMetadata(null)} className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors">Edit Platforms & Regenerate</button>
                </div>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center opacity-40">
                <img src={selectedVideo.thumbnailUrl} className="w-48 h-72 object-cover rounded-2xl grayscale mb-6" alt="" />
                <p className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">Select platforms to generate publishing kit</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
