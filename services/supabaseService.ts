
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { ViralVideo, SocialAccount } from '../types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

let supabase: SupabaseClient | null = null;
let lastNotifiedState: boolean | null = null;
const connectionListeners: Set<(connected: boolean) => void> = new Set();

const notifyConnectionChange = (force = false) => {
    const isConnected = !!supabase;
    if (!force && isConnected === lastNotifiedState) return;
    lastNotifiedState = isConnected;
    connectionListeners.forEach(listener => listener(isConnected));
};

export const subscribeToConnectionStatus = (listener: (connected: boolean) => void) => {
    connectionListeners.add(listener);
    listener(!!supabase);
    return () => connectionListeners.delete(listener);
};

const performInit = (): SupabaseClient | null => {
    let url = (SUPABASE_URL || "").trim();
    let key = (SUPABASE_ANON_KEY || "").trim();

    const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL;
    const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (envUrl) url = envUrl.trim();
    if (envKey) key = envKey.trim();

    if (typeof window !== 'undefined') {
        const localUrl = localStorage.getItem('sb_url_override');
        const localKey = localStorage.getItem('sb_key_override');
        if (localUrl && localKey) {
            url = localUrl;
            key = localKey;
        }
    }

    if (url && key && url.startsWith('http')) {
        try {
            return createClient(url, key, {
                auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
                global: { fetch: (input, init) => fetch(input, init) }
            });
        } catch (e) {
            console.error("Supabase Setup Error:", e);
            return null;
        }
    }
    return null;
};

export const updateSupabaseConfig = (url: string, key: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('sb_url_override', url.trim());
        localStorage.setItem('sb_key_override', key.trim());
    }
};

export const clearSupabaseConfig = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('sb_url_override');
        localStorage.removeItem('sb_key_override');
    }
};

export const initializeClient = (): boolean => {
    if (supabase) return true;
    supabase = performInit();
    notifyConnectionChange();
    return !!supabase;
};

export const reInitialize = () => {
    supabase = performInit();
    notifyConnectionChange(true);
    return !!supabase;
};

supabase = performInit();

export const isSupabaseInitialized = () => !!supabase;

export const checkTableHealth = async () => {
    if (!supabase) return { videos: false, profiles: false };
    try {
        const { error: vError } = await supabase.from('videos').select('id').limit(1);
        const { error: pError } = await supabase.from('profiles').select('id').limit(1);
        return { 
            videos: !vError || vError.code !== '42P01', 
            profiles: !pError || pError.code !== '42P01' 
        };
    } catch (e) {
        return { videos: false, profiles: false };
    }
};

// --- AUTHENTICATION ---
export const registerWithEmail = async (email: string, pass: string, name: string) => {
    if (!supabase && !initializeClient()) return { data: null, error: new Error("DB Offline") };
    const { data, error } = await supabase!.auth.signUp({
        email,
        password: pass,
        options: { data: { full_name: name } }
    });
    return { data, error };
};

export const loginWithEmail = async (email: string, pass: string) => {
    if (!supabase && !initializeClient()) throw new Error("DB Offline");
    const { data, error } = await supabase!.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    return data.user;
};

export const logoutUser = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
    if (!supabase && !initializeClient()) { callback(null); return () => {}; }
    supabase!.auth.getSession().then(({ data: { session } }) => callback(session?.user || null));
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => callback(session?.user || null));
    return () => subscription.unsubscribe();
};

// --- DATABASE ---
export const subscribeToVideos = (onUpdate: (videos: ViralVideo[]) => void) => {
    if (!supabase) return () => {};
    supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return;
        supabase!.from('videos').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
            .then(({ data, error }) => {
                 if (error && error.code !== '42P01' && (error as any).status !== 404) {
                     console.warn("Fetch videos warning:", error.message);
                 }
                 if (data) onUpdate(data.map(d => ({...d.data, id: d.id, status: d.status, createdAt: new Date(d.created_at).getTime()} as any)));
            }, () => {});
    });
    const channel = supabase.channel('videos_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, () => {
            supabase!.auth.getUser().then(({ data: { user } }) => {
                if(!user) return;
                supabase!.from('videos').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
                .then(({ data }) => { if (data) onUpdate(data.map(d => ({...d.data, id: d.id, status: d.status, createdAt: new Date(d.created_at).getTime()} as any))); }, () => {});
            });
        }).subscribe();
    return () => { supabase?.removeChannel(channel); };
};

export const saveVideoToDb = async (video: ViralVideo) => {
    if (!supabase) return;
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const payload = { id: video.id, user_id: user.id, title: video.title, platform: video.platform, status: video.status, created_at: new Date(video.createdAt).toISOString(), data: video };
        await supabase.from('videos').upsert(payload);
    } catch (e) {
        // Ignore table missing errors
    }
};

export const saveBatchVideosToDb = async (videos: ViralVideo[]) => {
    if (!supabase) return;
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const payload = videos.map(v => ({ id: v.id, user_id: user.id, title: v.title, platform: v.platform, status: v.status, created_at: new Date(v.createdAt).toISOString(), data: v }));
        await supabase.from('videos').upsert(payload);
    } catch (e) {
        // Ignore table missing errors
    }
};

export const saveUserSettings = async (accounts: SocialAccount[]) => {
    if (!supabase) return false;
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;
        
        const { error } = await supabase.from('profiles').upsert({ 
            id: user.id, 
            settings: { accounts }, 
            updated_at: new Date().toISOString() 
        });

        if (error) {
            if (error.code === '42P01' || (error as any).status === 404) {
                console.warn("Supabase 'profiles' table missing. Settings saved locally.");
                return false;
            }
            console.warn("Supabase Profile Sync Warning:", error.message);
            return false;
        }
        return true;
    } catch (e: any) {
        console.warn("Supabase Profile Sync Warning:", e.message || e);
        return false;
    }
};

export const subscribeToUserSettings = (onUpdate: (accounts: SocialAccount[] | null) => void) => {
    if (!supabase) return () => {};
    supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return;
        supabase!.from('profiles').select('settings').eq('id', user.id).single().then(({ data, error }) => {
            if (error && error.code !== '42P01' && (error as any).status !== 404) {
                // Table might not exist yet
            }
            if (data?.settings?.accounts) onUpdate(data.settings.accounts);
            else onUpdate(null);
        }, () => {});
    });
    const channel = supabase.channel('profiles_sync').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, payload => {
        const newRecord = payload.new as any;
        if (newRecord && newRecord.settings) onUpdate(newRecord.settings.accounts);
    }).subscribe();
    return () => { supabase?.removeChannel(channel); };
};
