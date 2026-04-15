import React, { useState, useEffect, useMemo, useContext } from 'react';
import { AppContext } from '../App';
import { 
  Zap, 
  TrendingUp, 
  MapPin, 
  Calendar, 
  ArrowUpRight, 
  Activity, 
  ChartLine,
  LayoutGrid,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CORRIDORS = [
  { id: 1, name: "Madhavaram – SIPCOT", km: 26.1, stns: 22, year: 2028, desc: "High-density IT corridor expansion" },
  { id: 2, name: "Chennai Central – Lighthouse", km: 9.05, stns: 10, year: 2026, desc: "Core heritage zone reconnection" },
  { id: 3, name: "Kellys – Poonamallee", km: 24.5, stns: 21, year: 2027, desc: "Western industrial gateway" },
  { id: 4, name: "Lighthouse – Poonamallee", km: 26.1, stns: 22, year: 2028, desc: "East-West arterial connectivity" },
  { id: 5, name: "Madhavaram – Sholinganallur", km: 47, stns: 38, year: 2029, desc: "The mega ring-road connector" },
  { id: 6, name: "Sholinganallur – SIPCOT", km: 23.5, stns: 19, year: 2028, desc: "Final IT Hub integration" },
];

export default function AIPremiumSim() {
  const { stats } = useContext(AppContext);
  const baselinePremium = stats?.avg_premium || 10.96;

  const [selectedCorridors, setSelectedCorridors] = useState<number[]>([1]);
  const [basePrice, setBasePrice] = useState(8500);
  const [distanceBand, setDistanceBand] = useState('250-500m'); 
  const [appliedPremium, setAppliedPremium] = useState(baselinePremium);
  const [annualAppreciation, setAnnualAppreciation] = useState(5.5);
  const [horizon, setHorizon] = useState(10);

  // Sync appliedPremium if stats load later
  useEffect(() => {
    if (stats?.avg_premium) {
      setAppliedPremium(stats.avg_premium);
    }
  }, [stats]);
  
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  const simulationData = useMemo(() => {
    let data = [];
    let currentMetroPrice = basePrice;
    let currentBasePrice = basePrice;
    
    // Impact starts at year 0 (opening prediction)
    for (let i = 0; i <= horizon; i++) {
       const metroValue = currentMetroPrice * (1 + appliedPremium / 100);
       data.push({
         year: 2024 + i,
         with_metro: Math.round(metroValue),
         without_metro: Math.round(currentBasePrice)
       });
       currentMetroPrice *= (1 + annualAppreciation / 100);
       currentBasePrice *= (1 + annualAppreciation / 100);
    }
    return data;
  }, [basePrice, appliedPremium, annualAppreciation, horizon]);

  const projectedUplift = simulationData[horizon].with_metro - simulationData[horizon].without_metro;
  const breakEven = Math.round(63246 / (projectedUplift * 0.01)); // Extremely simplified land value capture formula

  const toggleCorridor = (id: number) => {
    setSelectedCorridors(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const askAI = () => {
    setIsAskingAI(true);
    setAiResponse("");
    const corridorNames = CORRIDORS.filter(c => selectedCorridors.includes(c.id)).map(c => c.name).join(", ");
    
    const text = `Based on Phase 1 empirical evidence (+${baselinePremium}% premium), the ${corridorNames} corridor is projected to witness a structural value lift. \n\n**Policy Recommendations:**\n1. **Aggressive FSI:** Implementation of 4.0 FSI within 250m is justified by the ${appliedPremium}% causal premium.\n2. **Value Capture:** A 2% Betterment Levy over 15 years could recoup 40% of the Phase 2 capital cost.\n3. **Micro-Station Hubs:** Prioritize mixed-use zoning in ${distanceBand} zones to sustain the projected ₹${projectedUplift}/sqft uplift.`;
    
    let i = 0;
    const interval = setInterval(() => {
      setAiResponse(prev => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setIsAskingAI(false);
      }
    }, 10);
  };

  return (
    <div className="h-full w-full p-10 overflow-y-auto custom-scrollbar bg-metro-dark">
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        
        <header className="space-y-4">
           <div className="flex items-center gap-2 text-metro-primary font-black uppercase tracking-[0.4em] text-[10px] bg-metro-primary/10 px-4 py-1.5 border border-metro-primary/20 rounded-full w-fit">
              <Activity size={12} /> Predictive Engine v2.0
           </div>
           <h1 className="text-6xl font-black text-white tracking-tight leading-none uppercase italic underline decoration-metro-primary/30 decoration-8 underline-offset-[16px]">Phase 2 <span className="text-metro-primary">Premium Sim</span></h1>
           <p className="text-gray-500 text-lg font-medium italic pt-2">Project causal property value uplift for planned Phase 2 corridors using Phase 1 empirical vectors</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* Corridor Selector */}
           <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {CORRIDORS.map(corridor => (
                   <motion.div 
                     key={corridor.id}
                     whileHover={{ y: -5 }}
                     whileTap={{ scale: 0.98 }}
                     onClick={() => toggleCorridor(corridor.id)}
                     className={`p-6 rounded-[2rem] border cursor-pointer transition-all duration-300 relative overflow-hidden group ${selectedCorridors.includes(corridor.id) ? 'bg-metro-primary/10 border-metro-primary shadow-[0_0_30px_rgba(155,93,229,0.2)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                   >
                      <div className="relative z-10 space-y-4">
                        <div className="flex justify-between items-start">
                           <div className={`p-3 rounded-xl ${selectedCorridors.includes(corridor.id) ? 'bg-metro-primary text-white' : 'bg-white/5 text-gray-500'}`}>
                              <MapPin size={18} />
                           </div>
                           <span className="text-[10px] font-black text-gray-700">{corridor.year}</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white uppercase tracking-tight leading-none mb-2">{corridor.name}</h3>
                          <p className="text-[10px] text-gray-500 font-bold uppercase">{corridor.km} KM • {corridor.stns} STN</p>
                        </div>
                      </div>
                      {selectedCorridors.includes(corridor.id) && (
                        <motion.div layoutId="active-check" className="absolute top-4 right-4 text-metro-primary">
                          <ShieldCheck size={16} />
                        </motion.div>
                      )}
                   </motion.div>
                 ))}
              </div>

              {/* Simulation Output Chart */}
              <div className="glass-card p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden h-[500px]">
                 <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-widest uppercase italic">ROI Trajectory</h3>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Property Value Comparison (Metro vs Baseline)</p>
                    </div>
                    <div className="flex gap-4">
                       <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-metro-primary" />
                          <span className="text-[10px] font-bold text-gray-400">WITH METRO</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-white/10 border border-white/20" />
                          <span className="text-[10px] font-bold text-gray-400">BASELINE</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={simulationData}>
                          <defs>
                             <linearGradient id="colorWith" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#9b5de5" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#9b5de5" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis dataKey="year" stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${(val/1000).toFixed(1)}k`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111622', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px' }}
                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                          />
                          <Area type="monotone" dataKey="with_metro" stroke="#9b5de5" strokeWidth={4} fillOpacity={1} fill="url(#colorWith)" dot={false} />
                          <Area type="monotone" dataKey="without_metro" stroke="#ffffff33" strokeWidth={2} strokeDasharray="10 5" fill="transparent" dot={false} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>

           {/* Parameters Panel */}
           <div className="lg:col-span-4 space-y-8">
              <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-10">
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 text-metro-primary font-black uppercase tracking-widest text-[10px]">
                       <ControlSettings size={14} /> Control Panel
                    </div>
                    <h3 className="text-2xl font-black text-white italic tracking-tighter">Model Inputs</h3>
                 </div>

                 <div className="space-y-8">
                    {/* Base Price */}
                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          <span>Baseline Price (₹/sqft)</span>
                          <span className="text-white">₹{basePrice.toLocaleString()}</span>
                       </div>
                       <input type="range" min="4000" max="18000" step="500" value={basePrice} onChange={(e) => setBasePrice(parseInt(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-metro-primary cursor-pointer" />
                    </div>

                    {/* Premium Applied */}
                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          <span>Metro Premium Applied</span>
                          <span className="text-metro-primary">{appliedPremium}%</span>
                       </div>
                       <input type="range" min="6" max="15" step="0.1" value={appliedPremium} onChange={(e) => setAppliedPremium(parseFloat(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-metro-primary cursor-pointer" />
                    </div>

                    {/* Annual Appreciation */}
                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          <span>Annual Growth (Baseline)</span>
                          <span className="text-white">{annualAppreciation}%</span>
                       </div>
                       <input type="range" min="3" max="9" step="0.5" value={annualAppreciation} onChange={(e) => setAnnualAppreciation(parseFloat(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-metro-primary cursor-pointer" />
                    </div>

                    {/* Distance Band Toggle */}
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Distance Catchment</label>
                       <div className="grid grid-cols-3 gap-2">
                          {['0-250m', '250-500m', '500m-1k'].map(band => (
                            <button 
                              key={band} 
                              onClick={() => setDistanceBand(band)}
                              className={`py-2 text-[8px] font-black uppercase rounded-lg border transition-all ${distanceBand === band ? 'bg-metro-primary border-metro-primary text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}
                            >
                              {band}
                            </button>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Simulator KPIs */}
              <div className="grid grid-cols-1 gap-6">
                 <div className="glass-card p-8 rounded-[2.5rem] border border-metro-primary/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 bg-metro-primary/5 blur-[50px] -mr-12 -mt-12 group-hover:bg-metro-primary/10 transition-all" />
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Projected 10-Year Uplift</p>
                    <h4 className="text-3xl font-black text-white tracking-tighter italic">₹{projectedUplift.toLocaleString()}<span className="text-sm font-bold text-gray-500 ml-2 italic">/sqft</span></h4>
                 </div>
                 <div className="glass-card p-8 rounded-[2.5rem] border border-metro-secondary/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 bg-metro-secondary/5 blur-[50px] -mr-12 -mt-12 group-hover:bg-metro-secondary/10 transition-all" />
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Break-even Horizon</p>
                    <h4 className="text-3xl font-black text-white tracking-tighter italic">~{breakEven} <span className="text-sm font-bold text-gray-500 ml-1 italic">Years</span></h4>
                    <p className="text-[8px] text-gray-500 font-bold uppercase mt-2">Recovery of Phase 2 capital cost</p>
                 </div>
              </div>
           </div>
        </div>

        {/* AI Insight Section */}
        <div className="pt-10">
           <div className="glass-card p-12 rounded-[4rem] border border-white/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-metro-primary/5 to-transparent pointer-events-none" />
              <div className="flex flex-col md:flex-row items-start gap-12">
                 <div className="space-y-6 flex-shrink-0">
                    <div className="w-20 h-20 bg-metro-primary rounded-[2rem] flex items-center justify-center shadow-[0_0_30px_rgba(155,93,229,0.3)] neon-glow-primary">
                       <Sparkles size={32} className="text-white animate-pulse" />
                    </div>
                    <button 
                      onClick={askAI}
                      disabled={isAskingAI}
                      className="px-10 py-5 bg-white text-metro-dark font-black rounded-3xl uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                       {isAskingAI ? "Analyzing..." : "Ask AI Advice"}
                    </button>
                 </div>
                 
                 <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="h-0.5 w-10 bg-metro-primary" />
                       <h3 className="text-xs font-black text-metro-primary uppercase tracking-[0.3em]">AI Strategic Recommendation</h3>
                    </div>
                    <div className="text-gray-300 italic text-lg leading-relaxed whitespace-pre-line min-h-[150px]">
                       {aiResponse || "Select corridors and configure the model to generate transit-oriented development (TOD) recommendations inspired by Phase 1 empirical evidence."}
                       {isAskingAI && <span className="inline-block w-2 h-5 bg-metro-primary animate-pulse ml-1" />}
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}

function ControlSettings({ size, className }: any) {
  return (
    <div className={className}>
      <LayoutGrid size={size} />
    </div>
  );
}
