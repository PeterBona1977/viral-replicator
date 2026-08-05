
import React from 'react';
import { LayoutDashboard, Scan, CheckSquare, Settings, Zap, LogOut, User, LogIn, CloudLightning, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';
import { isSupabaseInitialized } from '../services/supabaseService';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount: number;
  user: UserProfile | null;
  onLogout: () => void;
  onConnect?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, pendingCount, user, onLogout, onConnect }) => {
  const isCloudAvailable = isSupabaseInitialized();
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'scanner', icon: Scan, label: 'Scanner' },
    { id: 'approval', icon: CheckSquare, label: 'Approvals', badge: pendingCount },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col h-screen sticky top-0 z-40">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Zap className="text-white w-5 h-5" fill="white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ViralRep.ai
          </h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
             if (item.id === 'settings') return null; // handled separately for bottom
             return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                ) : null}
              </button>
             )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-200 ${
                  activeTab === 'settings'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
          >
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>

          {user ? (
            <div className="pt-2 mt-2 border-t border-slate-800/50">
               <div className="flex items-center gap-3 px-4 py-2 mb-2">
                  {user.photoURL ? (
                     <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-slate-600" />
                  ) : (
                     <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                        <User size={14} className="text-slate-400" />
                     </div>
                  )}
                  <div className="overflow-hidden">
                      <p className="text-xs font-bold text-white truncate">{user.displayName || 'User'}</p>
                      <p className="text-[10px] text-green-500 truncate uppercase font-black flex items-center gap-1">
                        <ShieldCheck size={10} /> Cloud Active
                      </p>
                  </div>
               </div>
               <button 
                 onClick={onLogout}
                 className="flex items-center gap-3 px-4 py-2 w-full rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-xs font-medium"
               >
                 <LogOut size={16} />
                 <span>Sign Out</span>
               </button>
            </div>
          ) : isCloudAvailable ? (
            <div className="pt-2 mt-2 border-t border-slate-800/50">
               <button 
                 onClick={onConnect}
                 className="flex items-center gap-3 px-4 py-3 w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all text-xs font-black uppercase tracking-widest border border-slate-700"
               >
                 <LogIn size={16} />
                 <span>Sign In to Sync</span>
               </button>
               <p className="text-[8px] text-center text-slate-500 mt-2 uppercase font-black tracking-widest">
                 Supabase Cloud Detected
               </p>
            </div>
          ) : (
            <div className="pt-2 mt-2 border-t border-slate-800/50 text-center">
               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Local Workspace Only</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800 z-50 px-4 py-2 safe-area-pb">
        <div className="flex justify-between items-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg relative ${
                activeTab === item.id
                  ? 'text-purple-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="relative">
                <item.icon size={24} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full border border-slate-900 px-1">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
          {!user && isCloudAvailable && (
            <button
              onClick={onConnect}
              className="flex flex-col items-center gap-1 p-2 text-slate-400"
            >
              <LogIn size={24} />
              <span className="text-[10px] font-black uppercase">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};
