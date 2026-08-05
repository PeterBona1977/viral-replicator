import React from 'react';
import { Zap, LayoutDashboard, ChevronRight, Sparkles, Database } from 'lucide-react';

interface SetupGuideProps {
  onConnectApiKey: () => void;
  apiKeyVerified: boolean;
  onNavigate: (tab: string) => void;
}

export const SetupGuide: React.FC<SetupGuideProps> = ({ onNavigate }) => {
  
  const steps = [
    {
      id: 1,
      title: "AI Engine Ready",
      description: "The app uses Pollinations AI (Free). No API keys or billing accounts are required.",
      icon: Zap,
      action: (
        <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg mt-2">
             <p className="text-xs text-green-300 font-medium flex items-center gap-2">
                <Sparkles size={14} /> System is pre-configured and ready.
             </p>
        </div>
      )
    },
    {
      id: 2,
      title: "Cloud Sync (Optional)",
      description: "Connect Firebase if you want to save your data across sessions.",
      icon: Database,
      action: (
        <button 
          onClick={() => onNavigate('settings')}
          className="mt-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-slate-700"
        >
          Configure Database <ChevronRight size={14} />
        </button>
      )
    },
    {
      id: 3,
      title: "Start Scanning",
      description: "Generate viral video concepts using the AI Trend Scanner.",
      icon: LayoutDashboard,
      action: null
    }
  ];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto h-full overflow-y-auto pb-24 md:pb-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome to ViralReplicator</h2>
        <p className="text-slate-400">Your autonomous AI video studio is ready to go.</p>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-4 bottom-0 w-0.5 bg-slate-800 md:left-8"></div>
        <div className="space-y-8 md:space-y-12">
          {steps.map((step, index) => (
            <div key={step.id} className="relative flex gap-4 md:gap-6">
              <div className={`relative z-10 w-12 h-12 md:w-16 md:h-16 rounded-2xl border-4 border-slate-950 flex items-center justify-center flex-shrink-0 shadow-xl transition-colors duration-500 bg-slate-800 text-purple-400`}>
                <step.icon size={24} className="md:w-8 md:h-8" />
              </div>
              <div className="flex-1 pt-1 md:pt-2">
                <h3 className="text-lg md:text-xl font-bold mb-2 text-white">
                  Step {step.id}: {step.title}
                </h3>
                <p className="text-slate-400 text-sm md:text-base mb-3 leading-relaxed">
                  {step.description}
                </p>
                {step.action && (
                  <div className="mt-2">
                    {step.action}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
        <h3 className="text-white font-bold mb-2">Ready to create?</h3>
        <p className="text-slate-400 text-sm mb-4">
          Head to the Scanner to find your next viral hit.
        </p>
        <button
          onClick={() => onNavigate('scanner')}
          className="bg-white text-slate-900 hover:bg-slate-200 px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
        >
          Launch Scanner <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
