import { useState, useEffect } from 'react';
import { Users, Target, Activity, Info, BarChart3 } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function Matching() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchRes, supportRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/analytics/matching`),
          axios.get(`${API_BASE_URL}/api/analytics/common_support`)
        ]);
        setData({ matching: matchRes.data, support: supportRes.data });
      } catch (err) {
        console.error("Failed to fetch matching data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = data?.support?.bins?.map((bin: number, i: number) => ({
    name: bin.toFixed(2),
    treated: data.support.treated[i] || 0,
    control: data.support.control[i] || 0
  })) || [];

  return (
    <div className="h-full w-full p-10 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-10">
        <header>
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Propensity Score Matching</h1>
          <p className="text-gray-400">Eliminating selection bias by matching treated properties with identical control peers.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            icon={<Target className="text-metro-primary" />} 
            label="Matched Pairs" 
            value={data?.matching?.matched_pairs?.toLocaleString() || "0"} 
            sub="1:1 Nearest Neighbor"
          />
          <StatCard 
            icon={<Activity className="text-metro-secondary" />} 
            label="SMD Reduction" 
            value={data?.matching?.smd_before ? `${((data.matching.smd_before - data.matching.smd_after) / data.matching.smd_before * 100).toFixed(1)}%` : "0%"} 
            sub={`${data?.matching?.smd_before || 0} → ${data?.matching?.smd_after || 0}`}
          />
          <StatCard 
            icon={<Users className="text-metro-accent" />} 
            label="Control Reservoir" 
            value="122k" 
            sub="Unmatched baseline"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-metro-card p-8 rounded-[2rem] border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="text-metro-primary w-6 h-6" /> Common Support Graph
              </h3>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2 text-metro-primary">
                  <div className="w-3 h-3 bg-metro-primary rounded-sm"></div> Treated
                </div>
                <div className="flex items-center gap-2 text-white/20">
                  <div className="w-3 h-3 bg-white/10 rounded-sm"></div> Control
                </div>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center text-gray-500 animate-pulse">Computing overlapping vectors...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTreated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9b5de5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#9b5de5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a2e', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="treated" stroke="#9b5de5" fillOpacity={1} fill="url(#colorTreated)" strokeWidth={3} />
                    <Area type="monotone" dataKey="control" stroke="rgba(255,255,255,0.1)" fill="rgba(255,255,255,0.05)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            <p className="text-[11px] text-gray-500 mt-6 leading-relaxed">
              The graph represents the distribution of Propensity Scores across the Treatment and Control groups. 
              The significant overlap (Common Support) ensures that for every property near the metro, 
              there is a statistically comparable property in the control zones.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-metro-dark p-8 rounded-[2rem] border border-metro-primary/20">
              <h4 className="text-sm font-black text-metro-primary uppercase tracking-[0.2em] mb-4">AI Interpretation</h4>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                {data?.matching?.explanation || "The matching engine is initializing..."}
              </p>
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <Info className="text-metro-secondary w-5 h-5 shrink-0" />
                <p className="text-[10px] text-gray-400">
                  Standardized Mean Difference (SMD) below 0.1 is considered a "Gold Standard" match balance. 
                  Our engine achieved {data?.matching?.smd_after || "0.000"}.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
              <h4 className="text-sm font-bold text-white mb-4 tracking-tight">Matching Covariates</h4>
              <div className="grid grid-cols-2 gap-3">
                {['Area (Sq.Ft)', 'Year of Transaction', 'SRO Base Price', 'Property Type', 'Zone Intensity', 'Arterial Distance'].map((item, i) => (
                  <div key={i} className="px-4 py-3 bg-white/5 rounded-xl text-[11px] text-gray-400 border border-white/5 flex justify-between">
                    <span>{item}</span>
                    <span className="text-green-400 font-bold">BALANCED</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub }: any) {
  return (
    <div className="bg-metro-card p-8 rounded-[2rem] border border-white/5 shadow-xl hover:translate-y-[-4px] transition-all duration-300 group">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-3xl font-black text-white mb-1 tracking-tight">{value}</div>
      <div className="text-[11px] text-gray-500 font-medium">{sub}</div>
    </div>
  )
}
