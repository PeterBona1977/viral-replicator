
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ViralCard } from './components/ViralCard';
import { ApprovalQueue } from './components/ApprovalQueue';
import { DashboardStats } from './components/DashboardStats';
import { Settings } from './components/Settings';
import { VideoModal } from './components/VideoModal';
import { AuthScreen } from './components/AuthScreen';
import { DiscoveryAuditPopup } from './components/DiscoveryAuditPopup';
import { ScannerFiltersPanel } from './components/ScannerFilters';
import { ViralVideo, VideoStatus, Platform, SocialAccount, UserProfile, ScannerFilters, TimeRange } from './types';
import { runSocialScrapers } from './services/scrapers';
import { 
    subscribeToVideos, 
    saveBatchVideosToDb, 
    logoutUser, 
    subscribeToAuth, 
    saveUserSettings, 
    subscribeToUserSettings, 
    isSupabaseInitialized, 
    subscribeToConnectionStatus
} from './services/supabaseService';
import { RefreshCw, Sparkles, XCircle, Terminal, Command, Globe, BrainCircuit, AlertCircle, FileText } from 'lucide-react';

const VIDEOS_STORAGE_KEY = 'viralrep_videos_local';
const FILTERS_STORAGE_KEY = 'viralrep_filters_local';
const ACCOUNTS_STORAGE_KEY = 'viralrep_accounts_local';

const DEFAULT_FILTERS: ScannerFilters = {
    countries: ['US'],
    platforms: [Platform.YouTube, Platform.TikTok],
    resultCount: 8,
    timeRange: TimeRange.Now,
    keywords: ''
};

const DEFAULT_ACCOUNTS: SocialAccount[] = [
    { platform: Platform.TikTok, username: '', connected: false },
    { platform: Platform.Instagram, username: '', connected: false },
    { platform: Platform.YouTube, username: '', connected: false },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('scanner');
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [dbConnected, setDbConnected] = useState(isSupabaseInitialized());
  
  const [videos, setVideos] = useState<ViralVideo[]>(() => {
    const saved = localStorage.getItem(VIDEOS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [scanFilters, setScanFilters] = useState<ScannerFilters>(() => {
    const saved = localStorage.getItem(FILTERS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_FILTERS;
  });

  const [accounts, setAccounts] = useState<SocialAccount[]>(() => {
    const saved = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
  });

  const [isScanning, setIsScanning] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [playingVideo, setPlayingVideo] = useState<ViralVideo | null>(null);
  const [currentAudit, setCurrentAudit] = useState<any | null>(null);
  const [savedAudit, setSavedAudit] = useState<any | null>(() => {
    const saved = localStorage.getItem('viralrep_last_audit');
    return saved ? JSON.parse(saved) : null;
  });
  const [scanLogs, setScanLogs] = useState<string[]>([]);

  const scanIdRef = useRef<number | null>(null);

  useEffect(() => { localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(videos)); }, [videos]);
  useEffect(() => { localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(scanFilters)); }, [scanFilters]);
  useEffect(() => { localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts)); }, [accounts]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const unsubConn = subscribeToConnectionStatus((connected) => { setDbConnected(connected); });
    const unsubAuth = subscribeToAuth((sbUser) => {
      if (sbUser) {
        setUser({ uid: sbUser.id, displayName: sbUser.user_metadata.full_name || sbUser.email, email: sbUser.email || null, photoURL: null });
        setShowAuth(false);
      } else { setUser(null); }
      setAuthInitialized(true);
    });
    return () => { unsubConn(); unsubAuth(); };
  }, []);

  useEffect(() => {
    if (dbConnected && user) {
        const unsubVideos = subscribeToVideos((cloudVideos) => { 
            if (cloudVideos && cloudVideos.length > 0) setVideos(cloudVideos); 
        });
        const unsubSettings = subscribeToUserSettings((cloudAccounts) => { 
            if (cloudAccounts && cloudAccounts.length > 0) {
                setAccounts(cloudAccounts);
            } else {
                // If cloud is empty but local has data, push local to cloud
                const localHasData = accounts.some(a => a.connected);
                if (localHasData) {
                    saveUserSettings(accounts).catch(console.error);
                }
            }
        });
        return () => { unsubVideos(); unsubSettings(); };
    }
  }, [dbConnected, user]);

  const scanForViral = async () => {
    const currentScanId = Date.now();
    scanIdRef.current = currentScanId;
    setIsScanning(true);
    setScanLogs(["Activating Social Scraper Engine...", "Grounding in live platform data...", "Extracting velocity data..."]);
    
    try {
        const result = await runSocialScrapers(scanFilters);
        if (scanIdRef.current !== currentScanId) return;

        setScanLogs(prev => [...prev, `Found ${result.videos.length} verified trends.`, "Synthesizing research audit..."]);
        
        if (result.videos.length > 0) {
            const newVideos = [...result.videos, ...videos].slice(0, 50);
            setVideos(newVideos);
            if (dbConnected && user) await saveBatchVideosToDb(result.videos);
            setCurrentAudit(result.audit);
            setSavedAudit(result.audit);
            localStorage.setItem('viralrep_last_audit', JSON.stringify(result.audit));
            showNotification(`${result.videos.length} Trends Discovered.`, 'success');
        } else {
            showNotification("No trends found with current filters.", 'info');
        }
    } catch (error: any) {
        showNotification(error.message || "Discovery Failed", 'error');
        setScanLogs(prev => [...prev, `CRITICAL: ${error.message}`]);
    } finally {
        setIsScanning(false);
    }
  };

  const handleAccountAction = async (p: Platform, u: string | null) => {
    // 1. Update local state immediately
    const updatedAccounts = accounts.map(a => a.platform === p ? { ...a, username: u || '', connected: !!u } : a);
    setAccounts(updatedAccounts);
    
    // 2. Persist to storage
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updatedAccounts));

    // 3. Push to cloud if available
    if (user && dbConnected) {
        try {
            await saveUserSettings(updatedAccounts);
            showNotification(`Updated ${p} Identity.`, 'success');
        } catch (e: any) {
            showNotification(`Sync Failed: ${e.message}`, 'error');
        }
    }
  };

  const [isLocalGuest, setIsLocalGuest] = useState<boolean>(() => {
    return localStorage.getItem('viralrep_local_mode') === 'true';
  });

  const handleUseLocal = () => {
    localStorage.setItem('viralrep_local_mode', 'true');
    setIsLocalGuest(true);
    setShowAuth(false);
    if (!user) {
      setUser({ uid: 'local_guest', displayName: 'Local Guest', email: null, photoURL: null });
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('viralrep_local_mode');
    setIsLocalGuest(false);
    await logoutUser();
    setUser(null);
    setShowAuth(true);
  };

  if (!authInitialized) return <div className="h-screen w-full bg-slate-950 flex items-center justify-center"><Sparkles className="animate-spin text-purple-500" /></div>;
  if (showAuth || (!user && !isLocalGuest)) return <AuthScreen onUseLocal={handleUseLocal} isConfigured={dbConnected} />;

  const pendingVideos = videos.filter(v => v.status === VideoStatus.PendingApproval);
  const scannedVideos = videos.filter(v => v.status === VideoStatus.Scanned);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-950 text-white font-sans overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} pendingCount={pendingVideos.length} user={user} onLogout={handleLogout} onConnect={() => setShowAuth(true)} />
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        <header className="h-16 flex-none border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50 backdrop-blur z-30">
           <div className="flex items-center gap-3">
              <Command size={16} className="text-purple-500" />
              <span className="uppercase text-[10px] font-black tracking-widest text-slate-400">System / {activeTab}</span>
           </div>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${dbConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{dbConnected ? 'Sync Active' : 'Offline Mode'}</span>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
            {activeTab === 'dashboard' && <DashboardStats videos={videos} />}
            {activeTab === 'settings' && <Settings accounts={accounts} onAccountAction={handleAccountAction} apiKeyVerified={true} onConnectApiKey={() => {}} onLogout={handleLogout} user={user} />}
            {activeTab === 'scanner' && (
                <div className="p-6 h-full overflow-y-auto pb-24 no-scrollbar">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Viral Discovery</h2>
                                <div className="bg-cyan-600/20 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/30 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <BrainCircuit size={12} /> Apify Extraction Engine
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-1">Grounded in live social graph data via Apify Actor. Identifies high-velocity replication patterns.</p>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {savedAudit && (
                                <button 
                                  onClick={() => setCurrentAudit(savedAudit)} 
                                  className="px-6 py-4 rounded-2xl bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-900/60 transition-all font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg"
                                >
                                    <FileText size={16} /> Ver Relatório da Pesquisa
                                </button>
                            )}
                            {!isScanning ? (
                                <button onClick={scanForViral} className="px-8 py-4 rounded-2xl bg-white text-black flex items-center justify-center gap-3 font-black shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest">
                                    <RefreshCw size={18} /> Initiate Search
                                </button>
                            ) : (
                                <button onClick={() => setIsScanning(false)} className="px-8 py-4 rounded-2xl bg-red-600/10 text-red-400 border border-red-500/30 font-black text-xs uppercase tracking-widest flex items-center gap-3">
                                    <XCircle size={18} /> Abort Scan
                                </button>
                            )}
                        </div>
                    </div>

                    <ScannerFiltersPanel filters={scanFilters} onChange={setScanFilters} disabled={isScanning} />
                    
                    {isScanning && (
                        <div className="bg-black/60 border border-slate-800 rounded-3xl p-6 mb-8 font-mono text-[10px] text-purple-400 shadow-inner">
                           <div className="flex items-center gap-2 mb-3"><Terminal size={14} className="animate-pulse" /> Neural Core Analysis...</div>
                           {scanLogs.map((log, i) => <div key={i} className="opacity-70 mt-1">{`> ${log}`}</div>)}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {scannedVideos.map(video => (
                            <ViralCard key={video.id} video={video} onRecreate={() => {}} onPlay={setPlayingVideo} />
                        ))}
                        {scannedVideos.length === 0 && !isScanning && (
                            <div className="col-span-full py-20 flex flex-col items-center text-center">
                                <AlertCircle size={48} className="text-slate-800 mb-4" />
                                <h3 className="text-slate-500 font-black uppercase tracking-widest">No Active Scans</h3>
                                <p className="text-slate-600 text-xs mt-2">Use the "Initiate Search" button above to find real-time trends.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {activeTab === 'approval' && <ApprovalQueue videos={pendingVideos} connectedAccounts={accounts} onApprove={(id, meta) => {}} onReject={(id) => {}} />}
        </div>
        
        <VideoModal video={playingVideo} onClose={() => setPlayingVideo(null)} />
        <DiscoveryAuditPopup audit={currentAudit} onClose={() => setCurrentAudit(null)} />
        
        {notification && (
            <div className="fixed bottom-10 right-10 bg-slate-900 border border-purple-500/50 text-white px-8 py-5 rounded-2xl shadow-2xl z-[100] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 animate-in slide-in-from-bottom-5">
                <div className={`w-2 h-2 rounded-full ${notification.type === 'error' ? 'bg-red-500' : 'bg-purple-500'} animate-pulse`} />
                {notification.message}
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
