
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
// Added Sparkles to the imported icons
import { Activity, Users, Film, Eye, TrendingUp, Sparkles } from 'lucide-react';
import { ViralVideo, VideoStatus } from '../types';

interface DashboardStatsProps {
    videos: ViralVideo[];
}

const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-purple-500/30 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white tracking-tighter">{value}</h3>
      </div>
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
        <Icon size={20} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
    <div className="flex items-center gap-1.5">
       <TrendingUp size={12} className="text-green-500" />
       <p className="text-slate-600 text-[10px] font-bold uppercase">{sub}</p>
    </div>
  </div>
);

export const DashboardStats: React.FC<DashboardStatsProps> = ({ videos }) => {
  const posted = videos.filter(v => v.status === VideoStatus.Posted);
  const pending = videos.filter(v => v.status === VideoStatus.PendingApproval);
  const scanned = videos.filter(v => v.status === VideoStatus.Scanned);
  
  // Parse reach from views strings (e.g. "1.5M")
  const calculateTotalReach = () => {
      let total = 0;
      posted.forEach(v => {
          const val = parseFloat(v.views.replace(/[^\d.]/g, ''));
          if (v.views.includes('M')) total += val * 1000000;
          else if (v.views.includes('K')) total += val * 1000;
          else total += val;
      });
      return total > 1000000 ? (total / 1000000).toFixed(1) + 'M' : (total / 1000).toFixed(1) + 'K';
  };

  const chartData = [
    { name: 'Scanned', count: scanned.length },
    { name: 'Pending', count: pending.length },
    { name: 'Posted', count: posted.length },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 overflow-y-auto h-full pb-24 md:pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Viral Reach" 
          value={calculateTotalReach()} 
          sub="Accumulated Audience" 
          icon={Activity} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="In Queue" 
          value={pending.length} 
          sub="Awaiting Approval" 
          icon={Film} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="Live Replications" 
          value={posted.length} 
          sub="Successfully Posted" 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Trends Scanned" 
          value={videos.length} 
          sub="Total Opportunities" 
          icon={Eye} 
          color="bg-green-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col h-[400px] shadow-2xl">
            <h3 className="text-white font-black text-sm uppercase tracking-widest mb-8 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Workspace Distribution
            </h3>
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#475569" tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#475569" tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                        cursor={{fill: '#1e293b'}}
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col h-[400px] shadow-2xl justify-center items-center text-center">
            <div className="bg-purple-600/10 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                <Sparkles size={32} className="text-purple-400" />
            </div>
            <h3 className="text-white font-black text-xl mb-2">Efficiency Engine Active</h3>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                Replicating {scanned.length} viral trends into {posted.length} active posts with a {(posted.length / (videos.length || 1) * 100).toFixed(0)}% conversion rate.
            </p>
        </div>
      </div>
    </div>
  );
};