
import { Video, Instagram, Youtube, Database, Target, ShieldCheck, LogOut, RotateCcw, AlertCircle, Link, X, CheckCircle2, Key, Cpu, Zap, Activity } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Platform, SocialAccount, UserProfile } from '../types';
import { isSupabaseInitialized, subscribeToConnectionStatus, updateSupabaseConfig, clearSupabaseConfig, checkTableHealth } from '../services/supabaseService';
import { 
  getApifyToken, 
  setApifyToken, 
  getApifyActorId, 
  setApifyActorId, 
  getApifyYouTubeActorId, 
  setApifyYouTubeActorId,
  getApifyInstagramActorId,
  setApifyInstagramActorId,
  testApifyTokenConnection,
  APIFY_ACTOR_PRESETS,
  ApifyTokenTestResult
} from '../services/apifyService';

interface SettingsProps {
  accounts: SocialAccount[];
  onAccountAction: (platform: Platform, username: string | null) => void;
  apiKeyVerified: boolean;
  onConnectApiKey: () => void;
  onLogout: () => void;
  user: UserProfile | null;
}

export const Settings: React.FC<SettingsProps> = ({ accounts, onAccountAction, onLogout, user }) => {
  const [connectingPlatform, setConnectingPlatform] = useState<Platform | null>(null);
  const [handleInput, setHandleInput] = useState('');
  const [supabaseConnected, setSupabaseConnected] = useState(isSupabaseInitialized());
  const [dbHealth, setDbHealth] = useState({ videos: true, profiles: true });
  const [sbUrl, setSbUrl] = useState('');
  const [sbKey, setSbKey] = useState('');
  const [apifyTokenInput, setApifyTokenInput] = useState(getApifyToken());
  const [apifyActorInput, setApifyActorInput] = useState(getApifyActorId());
  const [apifyYtActorInput, setApifyYtActorInput] = useState(getApifyYouTubeActorId());
  const [apifyIgActorInput, setApifyIgActorInput] = useState(getApifyInstagramActorId());
  const [showDbConfig, setShowDbConfig] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [apifySavedNotice, setApifySavedNotice] = useState(false);
  const [isTestingToken, setIsTestingToken] = useState(false);
  const [testResult, setTestResult] = useState<ApifyTokenTestResult | null>(null);


  useEffect(() => {
      const unsub = subscribeToConnectionStatus((connected) => {
          setSupabaseConnected(connected);
          if (connected) checkTableHealth().then(setDbHealth);
      });
      const storedUrl = localStorage.getItem('sb_url_override');
      const storedKey = localStorage.getItem('sb_key_override');
      if (storedUrl) setSbUrl(storedUrl);
      if (storedKey) setSbKey(storedKey);
      return unsub;
  }, []);

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (connectingPlatform && handleInput.trim()) {
        setIsUpdating(true);
        const username = handleInput.trim().replace(/^@/, '');
        
        // Let App.tsx handle the update and sync
        await onAccountAction(connectingPlatform, username);
        
        setIsUpdating(false);
        setConnectingPlatform(null);
        setHandleInput('');
    }
  };

  const handleDisconnect = async (platform: Platform) => {
      setIsUpdating(true);
      await onAccountAction(platform, null);
      setIsUpdating(false);
  };

  const getPlatformBase = (p: Platform) => {
      switch(p) {
          case Platform.TikTok: return "tiktok.com/@";
          case Platform.Instagram: return "instagram.com/";
          case Platform.YouTube: return "youtube.com/@";
          default: return "@";
      }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto h-full overflow-y-auto pb-24 md:pb-8">
        <div className="flex justify-between items-end mb-8">
            <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Studio Config</h2>
                <p className="text-sm text-slate-500 font-medium italic">Manage workspace connections and cloud sync status.</p>
            </div>
            {isUpdating && (
                <div className="flex items-center gap-2 text-[10px] font-black text-purple-400 uppercase tracking-widest animate-pulse">
                    <RotateCcw size={12} className="animate-spin"/> Saving Identity...
                </div>
            )}
        </div>

        <div className="grid gap-6">
            {/* Database Health Warning */}
            {supabaseConnected && (!dbHealth.profiles) && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-6 flex gap-4 items-start">
                    <AlertCircle className="text-red-500 shrink-0" size={24} />
                    <div>
                        <h4 className="text-white font-black text-xs uppercase tracking-widest mb-1">Profiles Table Not Detected</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                            Settings will not persist to the cloud because the <code className="text-red-400">profiles</code> table is missing from your Supabase project. Check the SQL schema.
                        </p>
                    </div>
                </div>
            )}

            {/* Social Accounts Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20"><Target className="text-purple-400" size={24} /></div>
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-wider">Social Identities</h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Target destinations for viral replications</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {accounts.map(acc => (
                        <div key={acc.platform} className="flex items-center justify-between p-5 bg-slate-950/50 rounded-2xl border border-white/5 group hover:border-purple-500/20 transition-all">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-slate-900 rounded-xl border border-white/5 flex items-center justify-center">
                                    {acc.platform === Platform.Instagram && <Instagram size={20} className="text-pink-500" />}
                                    {acc.platform === Platform.YouTube && <Youtube size={20} className="text-red-500" />}
                                    {acc.platform === Platform.TikTok && <Video size={20} className="text-cyan-400" />}
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-white">{acc.platform}</h4>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Link size={10} className="text-slate-700" />
                                        <p className={`text-[10px] font-mono ${acc.connected ? 'text-purple-400' : 'text-slate-600'}`}>
                                            {acc.connected ? `${getPlatformBase(acc.platform)}${acc.username}` : 'Unlinked'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button 
                                disabled={isUpdating}
                                onClick={() => acc.connected ? handleDisconnect(acc.platform) : setConnectingPlatform(acc.platform)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    acc.connected 
                                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' 
                                    : 'bg-white text-black hover:bg-slate-200 shadow-lg'
                                }`}
                            >
                                {acc.connected ? 'Unlink' : 'Link Account'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Apify Scraper Engine */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                            <Cpu className="text-cyan-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-wider">Apify Scraper Engine</h3>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                {apifyTokenInput ? "Apify Configured - Live Social Media Scraping Ready" : "Optional - Set Token to Enable Direct Social Media Extraction"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-5 bg-slate-950 p-6 rounded-2xl border border-white/5">
                    {/* Token row + Connection Test */}
                    <div className="flex flex-col md:flex-row gap-3 items-end">
                        <div className="flex-1 w-full">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                <Key size={10} className="text-cyan-400" /> Apify API Token (console.apify.com)
                            </label>
                            <input 
                                type="password"
                                value={apifyTokenInput} 
                                onChange={(e) => {
                                    setApifyTokenInput(e.target.value);
                                    setTestResult(null);
                                }} 
                                placeholder="apify_api_..."
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:border-cyan-500 outline-none" 
                            />
                        </div>
                        <button
                            disabled={isTestingToken || !apifyTokenInput.trim()}
                            onClick={async () => {
                                setIsTestingToken(true);
                                const res = await testApifyTokenConnection(apifyTokenInput);
                                setTestResult(res);
                                setIsTestingToken(false);
                            }}
                            className="w-full md:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl font-black text-[10px] uppercase tracking-widest border border-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isTestingToken ? <RotateCcw size={12} className="animate-spin" /> : <Activity size={12} />}
                            {isTestingToken ? 'Testing...' : 'Test Token'}
                        </button>
                    </div>

                    {/* Test result status banner */}
                    {testResult && (
                        <div className={`p-4 rounded-xl border text-xs font-mono flex items-start gap-3 ${
                            testResult.success 
                            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}>
                            {testResult.success ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
                            <div>
                                <p className="font-bold">{testResult.message}</p>
                                {testResult.success && testResult.plan && (
                                    <p className="text-[10px] text-green-300/80 mt-1">Plan: {testResult.plan} | Verified user status OK</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Actor Inputs Grid */}
                    <div className="grid gap-4 md:grid-cols-3 pt-2">
                        {/* TikTok Actor */}
                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                                <span className="flex items-center gap-1"><Cpu size={10} className="text-cyan-400" /> TikTok Actor ID</span>
                            </label>
                            <input 
                                value={apifyActorInput} 
                                onChange={(e) => setApifyActorInput(e.target.value)} 
                                placeholder="coregent/tiktok-viral-video-finder"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:border-cyan-500 outline-none mb-1.5" 
                            />
                            <select
                                onChange={(e) => e.target.value && setApifyActorInput(e.target.value)}
                                className="w-full bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 rounded-lg p-1.5 outline-none font-mono"
                                defaultValue=""
                            >
                                <option value="" disabled>Presets...</option>
                                {APIFY_ACTOR_PRESETS.TikTok.map(p => (
                                    <option key={p.id} value={p.id}>{p.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* YouTube Actor */}
                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                                <span className="flex items-center gap-1"><Cpu size={10} className="text-red-400" /> YouTube Actor ID</span>
                            </label>
                            <input 
                                value={apifyYtActorInput} 
                                onChange={(e) => setApifyYtActorInput(e.target.value)} 
                                placeholder="8frL5jLRMkNtPuwIo"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:border-red-500 outline-none mb-1.5" 
                            />
                            <select
                                onChange={(e) => e.target.value && setApifyYtActorInput(e.target.value)}
                                className="w-full bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 rounded-lg p-1.5 outline-none font-mono"
                                defaultValue=""
                            >
                                <option value="" disabled>Presets...</option>
                                {APIFY_ACTOR_PRESETS.YouTube.map(p => (
                                    <option key={p.id} value={p.id}>{p.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Instagram Actor */}
                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                                <span className="flex items-center gap-1"><Cpu size={10} className="text-pink-400" /> Instagram Actor ID</span>
                            </label>
                            <input 
                                value={apifyIgActorInput} 
                                onChange={(e) => setApifyIgActorInput(e.target.value)} 
                                placeholder="apify/instagram-reel-scraper"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:border-pink-500 outline-none mb-1.5" 
                            />
                            <select
                                onChange={(e) => e.target.value && setApifyIgActorInput(e.target.value)}
                                className="w-full bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 rounded-lg p-1.5 outline-none font-mono"
                                defaultValue=""
                            >
                                <option value="" disabled>Presets...</option>
                                {APIFY_ACTOR_PRESETS.Instagram.map(p => (
                                    <option key={p.id} value={p.id}>{p.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <p className="text-[9px] text-slate-500 font-medium">
                            Apify Console: <a href="https://console.apify.com/actors" target="_blank" rel="noreferrer" className="text-cyan-400 underline hover:text-cyan-300 font-mono">console.apify.com/actors</a>
                        </p>
                        <button 
                            onClick={() => {
                                setApifyToken(apifyTokenInput);
                                setApifyActorId(apifyActorInput);
                                setApifyYouTubeActorId(apifyYtActorInput);
                                setApifyInstagramActorId(apifyIgActorInput);
                                setApifySavedNotice(true);
                                setTimeout(() => setApifySavedNotice(false), 3000);
                            }} 
                            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
                        >
                            {apifySavedNotice ? <CheckCircle2 size={14} /> : null}
                            {apifySavedNotice ? 'Saved!' : 'Save Apify Config'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Storage Engine Status */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl border ${supabaseConnected ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                            <Database className={supabaseConnected ? "text-green-400" : "text-red-500"} size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-wider">Storage Engine</h3>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                {supabaseConnected ? "PostgreSQL Cluster Ready" : "Local Database Mode"}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setShowDbConfig(!showDbConfig)} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white underline">Override Config</button>
                </div>

                {showDbConfig && (
                    <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 space-y-4 animate-in slide-in-from-top-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 block">Project URL</label>
                                <input value={sbUrl} onChange={(e) => setSbUrl(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono" />
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 block">Anon Key</label>
                                <input value={sbKey} onChange={(e) => setSbKey(e.target.value)} type="password" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { updateSupabaseConfig(sbUrl, sbKey); window.location.reload(); }} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">Apply & Reboot</button>
                            <button onClick={() => { clearSupabaseConfig(); window.location.reload(); }} className="px-5 bg-red-600/10 text-red-500 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-500/20">Clear</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Active Session Info */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center">
                        <ShieldCheck className={user ? "text-green-400" : "text-slate-600"} size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Status</p>
                        <p className="text-white font-bold text-sm">{user ? user.displayName || user.email : 'Local Guest'}</p>
                    </div>
                 </div>
                 <button onClick={onLogout} className="flex items-center gap-2 px-6 py-3 bg-red-600/10 text-red-400 rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-500/10 hover:bg-red-600/20 transition-all">
                    <LogOut size={14} /> Close Session
                 </button>
            </div>
        </div>

        {/* Modal for Linking Handles */}
        {connectingPlatform && (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4" onClick={() => setConnectingPlatform(null)}>
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Link {connectingPlatform}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Platform Integration</p>
                        </div>
                        <button onClick={() => setConnectingPlatform(null)} className="text-slate-500 hover:text-white p-2"><X size={24}/></button>
                    </div>
                    <form onSubmit={handleConnectSubmit} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Handle</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-purple-500 font-black text-xl">@</span>
                                <input 
                                    autoFocus
                                    value={handleInput}
                                    onChange={(e) => setHandleInput(e.target.value)}
                                    className="w-full bg-black border border-slate-800 rounded-2xl py-6 pl-14 pr-6 text-white font-black text-sm focus:border-purple-500 outline-none shadow-inner"
                                    placeholder="username"
                                />
                            </div>
                            <p className="text-[9px] text-slate-600 italic px-2">Preview: {getPlatformBase(connectingPlatform)}{handleInput || '...'}</p>
                        </div>
                        <button type="submit" disabled={!handleInput || isUpdating} className="w-full bg-white text-black py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-slate-200 transition-all disabled:opacity-50">
                            {isUpdating ? <RotateCcw size={16} className="animate-spin mx-auto"/> : 'Authorize Identity'}
                        </button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};
