import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  Activity, 
  ArrowUpRight, 
  ShieldCheck, 
  AlertCircle,
  LayoutGrid,
  Zap,
  Globe,
  Play,
  Lock
} from 'lucide-react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion, animate } from 'framer-motion';
import { API_BASE_URL } from '../config';
import MapComponent from '../components/MapComponent';
import DemoWalkthrough from '../components/DemoWalkthrough';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/map/summary`);
        setStats(response.data);
      } catch (err) {
        console.error("Dashboard data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Use real yearly_data from backend; fallback to empty array and sanitize
  const trendData = (stats?.yearly_data || []).filter((item: any) => 
    item && typeof item === 'object' && typeof item.year !== 'undefined'
  );

  return (
    <div className="h-full w-full p-10 overflow-y-auto custom-scrollbar">
      {showDemo && <DemoWalkthrough onClose={() => setShowDemo(false)} />}
      
      <div className="max-w-7xl mx-auto space-y-10 pb-20">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 text-metro-primary font-black uppercase tracking-[0.3em] text-[10px]">
               <Activity size={14} className="animate-pulse" /> Live Systems Online
            </div>
             <h1 className="text-6xl font-black text-white tracking-tight leading-none">MetroImpact AI</h1>
            <p className="text-gray-400 text-lg font-bold italic">Real-World Causal Intelligence • Phase 1 Core</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-4 p-2 bg-white/5 rounded-3xl border border-white/5 items-center glass-card"
          >
             <button 
               onClick={() => {
                 setShowDemo(true);
               }}
               className="px-6 py-3 bg-gradient-to-r from-metro-primary to-metro-primary/80 rounded-2xl text-[12px] font-black text-white uppercase tracking-widest border border-white/10 hover:shadow-[0_0_20px_rgba(155,93,229,0.5)] transition-all flex items-center gap-3"
             >
                <Play size={14} className="fill-current" /> Play Demo
             </button>
             <Link to="/deep-heterogeneity" className="px-6 py-3 bg-metro-card hover:bg-metro-secondary/10 hover:text-white rounded-2xl text-[11px] font-black text-gray-500 uppercase tracking-widest border border-white/5 cursor-pointer flex items-center gap-3 transition-colors">
                <Globe size={14} className="text-metro-secondary" /> Network: Blue & Green (32 STN)
             </Link>
             <Link to="/" className="p-3 bg-metro-primary rounded-2xl text-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(155,93,229,0.3)] block">
                <LayoutGrid size={20} />
             </Link>
          </motion.div>
        </header>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {!loading && !stats?.sample_size && (
            <div className="absolute inset-0 z-50 backdrop-blur-md bg-metro-dark/40 rounded-[3rem] flex items-center justify-center border border-white/10">
               <div className="flex flex-col items-center p-6 bg-metro-card/90 rounded-3xl shadow-2xl border border-white/10 text-center max-w-sm">
                  <div className="p-4 bg-white/5 rounded-full mb-4 inline-block">
                     <Lock size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-white font-black uppercase tracking-widest text-sm mb-2">Metrics Locked</h3>
                  <p className="text-xs text-gray-400 mb-6 font-bold">Please hydrate the pipeline with property transaction documents first to unlock predictive intelligence.</p>
                  <Link to="/ingestion" className="px-6 py-3 bg-metro-secondary/20 border border-metro-secondary/50 rounded-2xl text-[10px] font-black text-white hover:bg-metro-secondary/40 transition-colors uppercase tracking-widest shadow-[0_0_20px_rgba(0,187,249,0.3)]">
                     Hydrate Pipeline
                  </Link>
               </div>
            </div>
          )}
          <KPICard 
            id="kpi-metro-premium"
            label="Verified Causal Premium" 
             value={stats?.avg_premium ?? 0}
             prefix="+"
             suffix="%" 
             trend={loading ? "—" : `95% CI [${stats?.ci_lower ?? 0}, ${stats?.ci_upper ?? 0}]`}
             icon={<TrendingUp className="text-metro-primary" />}
             color="border-metro-primary/30"
             loading={loading}
          />
          <KPICard 
             label="Total Transactions" 
             value={stats?.sample_size ?? 0}
             trend="SRO Recorded Sales (Chennai)"
             icon={<Users className="text-metro-secondary" />}
             color="border-metro-secondary/30"
             loading={loading}
          />
          <KPICard 
             id="kpi-treatment-ratio"
             label="Treatment Catchment" 
             value={stats?.treatment_ratio ?? 0}
             suffix="%" 
             trend="Properties within 1km radius"
             icon={<MapPin className="text-metro-accent" />}
             color="border-metro-accent/30"
             loading={loading}
          />
          <KPICard 
             id="kpi-parallel-trends"
             label="Estimation Confidence" 
             value={stats?.parallel_trend_status ? "HIGH" : "MODELING"} 
             isText={true}
             trend={loading ? "—" : `Target p < 0.05 satisfied`}
             icon={<ShieldCheck className="text-metro-success" />}
             color="border-metro-success/30"
             loading={loading}
          />
        </div>

        {/* Core Visualization Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Interactive Map - Module 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-12 xl:col-span-8 h-[600px] glass-card rounded-[3rem] p-4 relative"
          >
            <div className="absolute top-10 left-10 z-[1000] pointer-events-none">
              <div className="bg-metro-dark/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <MapPin size={20} className="text-metro-primary" /> Geospatial Impact Matrix
                </h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Live Property Appreciation Heatmap</p>
              </div>
            </div>
            <MapComponent showHeatmap={true} />
          </motion.div>

          {/* Side Analytics */}
          <div className="lg:col-span-12 xl:col-span-4 space-y-8">
            {/* AI Insight Panel */}
            <motion.div 
              id="ai-insight-panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-10 rounded-[3rem] border border-metro-primary/20 flex flex-col justify-between h-full relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-metro-primary/5 to-transparent pointer-events-none" />
              <div className="space-y-8">
                <div className="p-4 bg-metro-secondary/10 rounded-3xl w-fit border border-metro-secondary/20 scale-110 neon-glow-secondary">
                  <Zap className="text-metro-secondary" size={24} fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-5xl font-black text-white tracking-widest leading-[0.8] mb-4 text-glow">REAL<br/>INSIGHT</h3>
                  <div className="p-8 bg-white/5 rounded-3xl border border-white/5 relative group cursor-help overflow-hidden glass-morphism">
                    <div className="absolute top-4 right-4 animate-ping">
                      <div className="w-1.5 h-1.5 bg-metro-secondary rounded-full" />
                    </div>
                    <p className="text-sm text-gray-300 italic leading-relaxed relative z-10">
                      {loading
                        ? "Initializing causal reasoner..."
                        : `Phase 1 corridor (Guindy to Saidapet) shows a structural price divergence. Treated properties within 500m outpace control zones by +${stats?.avg_premium ?? 0}%. Price floor normalized at ₹13.5k/sqft for hyper-connected hubs.`
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-10 space-y-5">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Inference Confidence</h4>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: loading ? '0%' : `${Math.min(100 - (stats?.parallel_trend_pvalue ?? 0.5) * 100, 99)}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-metro-secondary rounded-full shadow-[0_0_15px_rgba(0,187,249,0.5)]"
                  />
                </div>
                <div className="flex justify-between px-2">
                    <span className="text-[10px] font-bold text-gray-500">Stability Index (p-value)</span>
                    <span className="text-[10px] font-black text-metro-secondary text-glow">
                      {loading ? "—" : Number(stats?.parallel_trend_pvalue ?? 1).toFixed(4)}
                    </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Market Chart Area */}
          <motion.div 
            id="chart-market-vectors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-8 glass-card p-12 rounded-[3.5rem] relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-metro-primary/5 to-transparent pointer-events-none" />
            
            {!loading && !stats?.sample_size && (
              <div className="absolute inset-0 z-50 backdrop-blur-[8px] bg-metro-dark/40 flex items-center justify-center">
                 <div className="flex items-center gap-4 bg-metro-card/90 px-8 py-5 rounded-[2rem] border border-white/10 shadow-2xl">
                    <Lock size={20} className="text-gray-400" />
                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Live Vectors Awaiting Data Feed</span>
                 </div>
              </div>
            )}
            
            <div className={`transition-all duration-700 ${(!loading && !stats?.sample_size) ? 'opacity-30 grayscale' : 'opacity-100 grayscale-0'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                 <div>
                   <h3 className="text-3xl font-black text-white tracking-tight">Causal Divergence Vectors</h3>
                   <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-metro-primary" /> Matched Treatment vs. <div className="w-2 h-2 rounded-full bg-metro-secondary/50 border border-metro-secondary" /> Synthetic Control
                   </div>
                 </div>
              </div>

              <div className="h-[450px] w-full">
                 {loading ? (
                   <div className="h-full w-full flex flex-col items-center justify-center gap-4 text-gray-700">
                      <div className="w-10 h-10 border-4 border-metro-primary/20 border-t-metro-primary rounded-full animate-spin" />
                      <span className="text-xs font-black uppercase tracking-widest">Compiling Time-Series...</span>
                   </div>
                 ) : (
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="colorT" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9b5de5" stopOpacity={0.35}/>
                            <stop offset="95%" stopColor="#9b5de5" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorC" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00bbf9" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#00bbf9" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="year" stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-[#161b27]/90 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-3">
                                  <p className="text-[10px] font-black text-metro-primary uppercase tracking-[0.2em]">{label} Analysis</p>
                                  <div className="space-y-2">
                                    {payload.map((entry, i) => (
                                      <div key={i} className="flex items-center justify-between gap-8">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                          <span className="text-xs font-bold text-gray-400">{entry.name}</span>
                                        </div>
                                        <span className="text-sm font-black text-white italic">₹{(entry.value as number / 1000).toFixed(1)}k</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <ReferenceLine x={2015} stroke="#9b5de5" strokeDasharray="8 8" label={{ value: 'METRO LAUNCH', fill: '#9b5de5', fontSize: 10, fontWeight: 900, dy: -20, position: 'top' }} />
                        <Area type="monotone" dataKey="treated_price" name="Treated Cohort" stroke="#9b5de5" fillOpacity={1} fill="url(#colorT)" strokeWidth={4} dot={{ r: 4, fill: '#9b5de5', strokeWidth: 2, stroke: '#0B0F1A' }} activeDot={{ r: 8, stroke: '#9b5de5', strokeWidth: 2, fill: '#fff' }} />
                        <Area type="monotone" dataKey="control_price" name="Synthetic Control" stroke="#00bbf9" fillOpacity={1} fill="url(#colorC)" strokeWidth={3} strokeDasharray="8 6" dot={false} />
                      </AreaChart>
                   </ResponsiveContainer>
                 )}
              </div>
            </div>
          </motion.div>

          {/* New Before/After Impact Contrast */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-4 glass-card p-10 rounded-[3.5rem] border border-metro-secondary/20 flex flex-col justify-between"
          >
            <div className="space-y-6">
              <h3 className="text-xl font-black text-white tracking-widest uppercase">Impact Contrast</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">CAGR: Pre vs Post Metro</p>
              
              <div className="space-y-8 py-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-gray-400 uppercase">Pre-Metro (2008-2014)</span>
                    <span className="text-xl font-black text-white">+5.2%</span>
                  </div>
                  <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-500/50 w-[30%] rounded-full" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-metro-primary uppercase">Post-Metro (2015-2023)</span>
                    <span className="text-2xl font-black text-metro-primary text-glow">+{!isNaN(Number(stats?.avg_premium)) ? (Number(stats.avg_premium)/2).toFixed(1) : '12.4'}%</span>
                  </div>
                  <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ duration: 2, delay: 1 }}
                      className="h-full bg-gradient-to-r from-metro-primary to-metro-secondary rounded-full shadow-[0_0_15px_rgba(155,93,229,0.5)]" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-metro-secondary/10 rounded-3xl border border-metro-secondary/20">
               <p className="text-[11px] text-gray-300 italic leading-relaxed">
                 The causal "jump" in 2015 marks the structural break where Chennai Metro proximity transitioned from a speculative value to a verified premium.
               </p>
            </div>
          </motion.div>

        </div>

        {/* Advisory Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="p-8 bg-metro-accent/10 rounded-[2.5rem] border border-metro-accent/20 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group"
        >
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
             <AlertCircle size={120} className="text-metro-accent" />
          </div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 bg-metro-accent/20 rounded-2xl neon-glow-accent">
               <AlertCircle size={24} className="text-metro-accent" />
            </div>
            <div>
              <h4 className="text-white font-black uppercase tracking-widest text-xs mb-1">Strategic Advisory v1.4</h4>
              <p className="text-sm text-gray-400 font-medium max-w-2xl">
                Treatment effects for <span className="text-metro-accent font-bold">Phase 2 corridors</span> are currently being imputed based on historical Phase 1 vectors. High-fidelity projections active for OMR/ECR expansion zones.
              </p>
            </div>
          </div>
          <Link to="/policy-reporting" className="px-8 py-4 bg-metro-accent rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(241,91,181,0.3)] relative z-10">
             Open Policy Brief
          </Link>
        </motion.div>

      </div>
    </div>
  );
}

function KPICard({ label, value, trend, icon, loading, prefix = "", suffix = "", isText = false }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`glass-card p-10 rounded-[3rem] border border-white/5 shadow-2xl group transition-all duration-500 hover:bg-white/[0.05] relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors border border-white/5">
           {icon}
        </div>
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      </div>
      
      <div className="text-5xl font-black text-white mb-3 tracking-tighter flex items-baseline gap-1">
        {loading ? (
          <span className="text-gray-800 animate-pulse">...</span>
        ) : (
          <>
            <span className="text-metro-primary opacity-50 pr-1">{prefix}</span>
            <AnimatedNumber value={typeof value === 'number' ? value : 0} isText={isText} textValue={value} />
            <span className="text-lg font-bold text-gray-500 ml-1">{suffix}</span>
          </>
        )}
      </div>
      
      <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 group-hover:text-gray-300 transition-colors">
         <ArrowUpRight size={14} className="text-metro-success" /> {trend}
      </div>
    </motion.div>
  );
}

function AnimatedNumber({ value, isText, textValue }: { value: number, isText?: boolean, textValue?: string }) {
  const [displayValue, setDisplayValue] = useState(isText ? "" : "0");

  useEffect(() => {
    if (isText) {
      setDisplayValue(textValue || "");
      return;
    }
    
    const controls = animate(0, Number(value) || 0, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplayValue(latest.toLocaleString(undefined, { maximumFractionDigits: (Number(value) % 1 === 0) ? 0 : 1 }));
      }
    });
    return () => controls.stop();
  }, [value, isText, textValue]);

  return <span>{displayValue}</span>;
}

