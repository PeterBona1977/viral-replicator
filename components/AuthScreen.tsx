
import React, { useState, useEffect } from 'react';
import { Zap, Mail, Lock, User, LogIn, UserPlus, RefreshCw, AlertTriangle, ChevronLeft, ShieldCheck, Database, ServerCrash } from 'lucide-react';
import { loginWithEmail, registerWithEmail, reInitialize } from '../services/supabaseService';

interface AuthScreenProps {
  onUseLocal: () => void;
  isConfigured: boolean;
  error?: string | null;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onUseLocal, isConfigured, error }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleRetryConfig = () => {
    setIsRetrying(true);
    const success = reInitialize();
    setTimeout(() => {
        setIsRetrying(false);
        if (success) {
            setAuthError(null);
        }
    }, 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (!isLoginMode && !name) return;

    setIsLoading(true);
    setAuthError(null);

    try {
        if (isLoginMode) {
            await loginWithEmail(email, password);
        } else {
            const { data, error } = await registerWithEmail(email, password, name);
            if (error) throw error;
            
            if (data?.user && !data?.session) {
                setVerificationSent(true);
                setIsLoading(false);
                return;
            }
        }
    } catch (err: any) {
        setAuthError(err.message || "Authentication failed");
        setIsLoading(false);
    }
  };

  if (verificationSent) {
      return (
        <div className="h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
             <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
             <div className="max-w-md w-full bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 shadow-2xl relative z-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20 shadow-xl shadow-green-900/20">
                    <Mail size={32} className="text-green-400" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Verification Sent</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">
                    We've sent a confirmation link to <span className="text-white">{email}</span>. <br/>
                    Please check your inbox to activate your ViralReplicator ID.
                </p>
                <button 
                    onClick={() => { setVerificationSent(false); setIsLoginMode(true); }}
                    className="w-full py-4 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                    <ChevronLeft size={16} /> Return to Login
                </button>
             </div>
        </div>
      );
  }

  return (
    <div className="h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px]" />

      <div className="max-w-md w-full bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 md:p-10 shadow-2xl relative z-10 flex flex-col">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
            <Zap className="text-white w-8 h-8" fill="white" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">ViralReplicator Studio</h1>
          <div className="flex items-center justify-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isConfigured ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
              {isConfigured ? (
                <>
                  <ShieldCheck size={10} className="text-green-400" />
                  Supabase Cloud Connected
                </>
              ) : "Database Connection Required"}
            </p>
          </div>
        </div>

        {(error || authError) && (
            <div className="mb-6 bg-red-950/40 border border-red-500/30 rounded-2xl p-4 flex gap-3 text-left animate-in fade-in slide-in-from-top-2 shadow-lg">
                <AlertTriangle className="text-red-400 w-5 h-5 shrink-0 mt-0.5" />
                <div className="min-w-0">
                    <p className="text-[10px] text-red-300 font-black uppercase tracking-widest mb-1">Access Denied</p>
                    <p className="text-[11px] text-red-200 font-medium leading-relaxed break-words">{authError || error}</p>
                </div>
            </div>
        )}

        {isConfigured ? (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 animate-in fade-in duration-500">
                {!isLoginMode && (
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Display Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white text-xs font-bold focus:outline-none focus:border-purple-500 transition-all placeholder:text-slate-600"
                            required={!isLoginMode}
                        />
                    </div>
                )}
                
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={16} />
                    <input 
                        type="email" 
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white text-xs font-bold focus:outline-none focus:border-purple-500 transition-all placeholder:text-slate-600"
                        required
                    />
                </div>

                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={16} />
                    <input 
                        type="password" 
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white text-xs font-bold focus:outline-none focus:border-purple-500 transition-all placeholder:text-slate-600"
                        required
                    />
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 rounded-2xl bg-white text-slate-950 hover:bg-slate-200 font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? <RefreshCw className="animate-spin" size={18} /> : (isLoginMode ? <LogIn size={18} /> : <UserPlus size={18} />)}
                    {isLoading ? 'Authenticating...' : (isLoginMode ? 'Sign In' : 'Create Account')}
                </button>
                
                <div className="pt-4 flex flex-col items-center gap-3">
                    <button 
                        type="button"
                        onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(null); }}
                        className="text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                    >
                        {isLoginMode ? "Need an account? Sign Up" : "Have an account? Login"}
                    </button>
                    
                    <div className="w-full border-t border-white/5 my-1" />

                    <button
                        type="button"
                        onClick={onUseLocal}
                        className="w-full py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-purple-300 border border-purple-500/20 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Zap size={14} className="text-purple-400" fill="currentColor" />
                        Continue in Offline / Local Mode
                    </button>
                </div>
            </form>
        ) : (
            <div className="space-y-6 py-6 animate-in zoom-in-95 duration-500">
                <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 text-center space-y-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <ServerCrash className="text-red-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-white font-black text-xs uppercase tracking-widest mb-1">Configuration Locked</h3>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            Database keys in <code className="text-red-300 font-mono">constants.ts</code> appear to be missing or invalid.
                        </p>
                    </div>
                    
                    <button 
                        onClick={handleRetryConfig}
                        disabled={isRetrying}
                        className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3"
                    >
                        {isRetrying ? <RefreshCw className="animate-spin" size={14} /> : <Database size={14} />}
                        {isRetrying ? 'Re-checking...' : 'Verify constants.ts'}
                    </button>
                </div>

                <button
                    type="button"
                    onClick={onUseLocal}
                    className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-[11px] uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 shadow-xl shadow-purple-900/30"
                >
                    <Zap size={16} fill="white" />
                    Bypass & Use Local Mode
                </button>

                <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 space-y-3">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Setup Instructions</p>
                    <ol className="text-[10px] text-slate-500 space-y-2 list-decimal list-inside font-medium leading-relaxed">
                        <li>Open <code className="text-slate-300">constants.ts</code> in your editor.</li>
                        <li>Paste your Supabase URL and Anon Key.</li>
                        <li>Save the file and click "Verify" above.</li>
                    </ol>
                </div>
            </div>
        )}

        {isConfigured && (
          <div className="text-center pt-4 opacity-40">
            <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em]">
              Cloud-Native Environment Active
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
