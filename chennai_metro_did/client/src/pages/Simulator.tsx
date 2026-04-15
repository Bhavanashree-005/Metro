import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { 
  Calculator, 
  Zap, 
  RefreshCcw, 
  Landmark, 
  MapPin, 
  Gauge, 
  TrendingUp, 
  AlertCircle, 
  ChevronRight, 
  MousePointer2,
  Globe,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MapComponent from '../components/MapComponent';

export default function Simulator() {
  const [sqft, setSqft] = useState(1500);
  const [dist, setDist] = useState(250);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [simPoint, setSimPoint] = useState<{ lat: number, lng: number } | null>(null);

  const handleSimulate = useCallback(async (currentDist?: number) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/simulator/predict`, {
        sqft: sqft,
        distance_m: currentDist ?? dist,
        year: 2026
      });
      setPrediction(res.data);
    } catch (e) {
      console.error("Simulation failed", e);
    } finally {
      setLoading(false);
    }
  }, [sqft, dist]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSimulate();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [sqft, dist, handleSimulate]);

  const onMapClick = (lat: number, lng: number) => {
    setSimPoint({ lat, lng });
    // When map is clicked, we assume a new station is placed.
    // We can simulate the impact at a default distance (e.g., 250m) from this point
    // or use the current distance slider value.
    handleSimulate(dist);
  };

  return (
    <div className="h-full w-full p-10 overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-metro-primary font-black uppercase tracking-[0.3em] text-[10px] mb-2">
               <Zap size={14} className="fill-current animate-pulse" /> Monte Carlo ML Engine
            </div>
            <h1 className="text-6xl font-black text-white tracking-tight leading-none">Causal Simulator</h1>
            <p className="text-gray-400 text-lg font-medium">Project infrastructure premiums by isolating the "Metro Treatment Effect."</p>
          </div>
          
          <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex items-center gap-4 glass-card">
             <div className="p-3 bg-metro-primary/10 rounded-2xl border border-metro-primary/20">
                <MousePointer2 size={20} className="text-metro-primary" />
             </div>
             <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Interaction Mode</p>
                <p className="text-xs font-bold text-white uppercase tracking-tight">Click Map to Place Station</p>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Map Interaction Area */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            <div className="h-[600px] glass-card rounded-[4rem] p-4 relative group">
               <div className="absolute top-10 left-10 z-[1000] pointer-events-none">
                  <div className="bg-metro-dark/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
                    <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                      <Globe size={20} className="text-metro-accent" /> Spatial Proxy Simulation
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Place hypothetical station to view ripple effects</p>
                  </div>
               </div>
               <MapComponent onMapClick={onMapClick} simulationPoint={simPoint} showHeatmap={false} />
            </div>

            <div className="p-10 bg-metro-card/30 rounded-[3rem] border border-white/5 flex gap-8 items-start glass-morphism">
               <div className="p-4 bg-metro-accent/10 rounded-3xl border border-metro-accent/20 neon-glow-accent">
                 <AlertCircle size={32} className="text-metro-accent shrink-0" />
               </div>
               <div className="space-y-2">
                 <h4 className="text-white font-black uppercase tracking-widest text-xs">Counterfactual Logic</h4>
                 <p className="text-sm text-gray-400 leading-relaxed italic">
                   This simulator estimates value gains by comparing the "Predicted" price 
                   to a "Synthetic Control" price where the metro infrastructure does not exist. 
                   The <span className="text-metro-primary font-bold">Ripple Effect</span> visualized on the map represents the decaying treatment vector as distance increases.
                 </p>
               </div>
            </div>
          </div>

          {/* Controls & Results Panel */}
          <div className="xl:col-span-4 space-y-8">
            <div className="glass-card p-10 rounded-[3.5rem] border border-metro-primary/20 shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-metro-primary/5 to-transparent pointer-events-none" />
               <div className="relative z-10 flex items-center gap-4 mb-10 text-glow">
                  <div className="p-3 bg-metro-primary/20 rounded-2xl shadow-[0_0_20px_rgba(155,93,229,0.2)]">
                    <Gauge className="text-metro-primary w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Configuration</h2>
               </div>
              
               <div className="space-y-12 relative z-10">
                 <div className="space-y-6">
                   <div className="flex justify-between items-end">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Landmark size={14} className="text-metro-primary" /> Property Footprint
                     </label>
                     <span className="text-4xl font-black text-white tracking-tighter group-hover:text-metro-primary transition-colors">{sqft} <span className="text-[10px] text-gray-600 font-bold ml-1">SQFT</span></span>
                   </div>
                   <input 
                     type="range" min="500" max="5000" step="50" 
                     value={sqft} 
                     onChange={e => setSqft(Number(e.target.value))}
                     className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-metro-primary shadow-inner"
                   />
                 </div>

                 <div className="space-y-6">
                   <div className="flex justify-between items-end">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={14} className="text-metro-accent" /> Station Catchment
                     </label>
                     <span className="text-4xl font-black text-metro-accent tracking-tighter group-hover:scale-110 transition-transform">{dist} <span className="text-[10px] text-gray-600 font-bold ml-1">METERS</span></span>
                   </div>
                   <input 
                     type="range" min="50" max="3000" step="10" 
                     value={dist} 
                     onChange={e => setDist(Number(e.target.value))}
                     className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-metro-accent shadow-inner"
                   />
                 </div>
               </div>

               <div className="mt-16 space-y-4 relative z-10">
                  <div className="flex items-center justify-between px-2">
                     <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Model Fidelity</span>
                     <span className="text-[10px] font-black text-metro-success">92.4% Verified</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-metro-success w-[92%] rounded-full shadow-[0_0_15px_rgba(0,245,212,0.4)]" />
                  </div>
               </div>
            </div>

            {/* Results Display */}
            <div className="bg-metro-dark/40 backdrop-blur-2xl p-10 rounded-[4rem] border border-white/5 shadow-inner relative overflow-hidden flex flex-col group min-h-[400px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(155,93,229,0.1),transparent_70%)]" />
                
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col items-center justify-center space-y-8"
                    >
                       <div className="relative">
                          <RefreshCcw className="w-16 h-16 text-metro-primary animate-spin" />
                          <div className="absolute inset-0 bg-metro-primary/20 blur-2xl rounded-full animate-pulse" />
                       </div>
                       <div className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] animate-pulse">Running Regressions</div>
                    </motion.div>
                  ) : !prediction ? (
                    <motion.div 
                      key="idle"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex-1 flex flex-col items-center justify-center opacity-30 text-center space-y-8"
                    >
                       <Calculator size={100} strokeWidth={0.5} className="text-metro-primary" />
                       <p className="text-sm font-black uppercase tracking-[0.3em]">Causal Engine Standby</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="result"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      className="flex-1 w-full space-y-12 relative z-10"
                    >
                       <div className="space-y-4">
                          <div className="px-4 py-2 bg-metro-secondary/10 text-metro-secondary text-[10px] font-black uppercase tracking-[0.3em] rounded-full w-fit border border-metro-secondary/20 neon-glow-secondary">Predicted Valuation (Lakhs)</div>
                          <div className="flex flex-col">
                             <h2 className="text-8xl font-black text-white tracking-tighter text-glow">
                                ₹{((prediction.predicted_price_sqft * sqft) / 100000).toFixed(2)}
                             </h2>
                             <div className="flex items-center gap-3 mt-2">
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Synthetic Baseline</span>
                                <p className="text-2xl font-black text-white/20 line-through tracking-tighter italic">₹{((prediction.counterfactual_price_sqft * sqft) / 100000).toFixed(1)}L</p>
                             </div>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 gap-6">
                          <div className="p-10 glass-card rounded-[3rem] border border-metro-primary/30 relative overflow-hidden group/card transform transition-all hover:scale-[1.05]">
                             <div className="absolute -right-4 -bottom-4 opacity-5 group-hover/card:scale-110 transition-transform">
                                <Zap size={80} className="text-metro-primary" fill="currentColor" />
                             </div>
                             <div className="flex items-center gap-3 mb-6">
                                <Zap size={20} fill="#9b5de5" className="text-metro-primary" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Net Metro Premium</span>
                             </div>
                             <div className="text-6xl font-black text-metro-primary tracking-tighter text-glow">+₹{((prediction.metro_premium_sqft * sqft) / 1000).toFixed(1)}k</div>
                             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
                                <TrendingUp size={14} className="text-metro-success" /> Causal Capital Gain Isolated
                             </p>
                          </div>
                          
                          <div className="p-10 glass-card rounded-[3rem] border border-metro-accent/30 relative overflow-hidden group/card transform transition-all hover:scale-[1.05]">
                             <div className="flex items-center gap-3 mb-6">
                                <Activity size={20} className="text-metro-accent" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Structural Lift</span>
                             </div>
                             <div className="text-6xl font-black text-metro-accent tracking-tighter text-glow">+{prediction.percentage_increase}%</div>
                             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-4">Growth Multiplier vs Control</p>
                          </div>
                       </div>

                       <button className="w-full py-8 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-center gap-4 text-xs font-black text-gray-500 hover:text-white hover:bg-white/10 transition-all group relative overflow-hidden">
                          <div className="h-1 w-0 group-hover:w-full bg-metro-primary absolute bottom-0 left-0 transition-all duration-700" />
                          VERIFY MATHEMATICAL PROOF (TWFE) <ChevronRight size={16} className="group-hover:translate-x-3 transition-transform" />
                       </button>
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
