import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Activity, Zap, TrendingUp, MapPin, Play, Info } from 'lucide-react';

export default function CinematicImpactReel({ overlayMode = false }: { overlayMode?: boolean }) {
  const [scene, setScene] = useState(0);

  // Scene transition sequence
  useEffect(() => {
    const timer = setInterval(() => {
      setScene((prev) => (prev + 1) % 4);
    }, 4500); // 4.5 seconds per scene
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`w-full h-full relative overflow-hidden rounded-[3rem] ${overlayMode ? 'bg-transparent' : 'bg-[#0a0f1a]'}`}>
      {/* Cinematic Background with Pan Animation - Only visible in non-overlay mode */}
      {!overlayMode && (
        <motion.div 
          animate={{ scale: [1, 1.05, 1], x: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
          style={{ backgroundImage: 'url("/cinematic_bg.png")' }}
        />
      )}

      {/* Grid Overlay */}
      <div className="absolute inset-0 z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Video HUD: Playback Indicators */}
      <div className="absolute inset-0 z-30 pointer-events-none border-[20px] border-white/[0.02]">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_red]" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] drop-shadow-md">LIVE REEVALUATION • ANALYTICS_v4</span>
        </div>
        <div className="absolute top-8 right-8 text-[9px] font-black text-gray-400 uppercase tracking-widest">
          CAM_01 // CHENNAI_STATION_HUB
        </div>
        
        {/* Progress Bar HUD */}
        <div className="absolute bottom-10 left-10 right-10 flex items-center gap-6">
           <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                key={scene}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 4.5, ease: "linear" }}
                className="h-full bg-metro-primary shadow-[0_0_10px_#9b5de5]"
              />
           </div>
           <div className="flex items-center gap-2 text-[10px] font-black text-white/40">
              <span className="text-white">0{scene + 1}</span> / 04
           </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Scene 1: Infrastructure Deployment */}
        {scene === 0 && (
          <motion.div 
            key="scene1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 pb-20"
          >
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-center space-y-10"
            >
              {/* CSS-Based Glowing Train Silhouette */}
              <div className="relative w-80 h-32 mx-auto">
                 <motion.div 
                   animate={{ x: [-10, 10, -10] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute inset-0 bg-gradient-to-r from-metro-primary via-metro-accent to-metro-primary rounded-full opacity-20 blur-[60px]"
                 />
                 <div className="relative z-10 w-full h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-x-0 top-1/2 h-1 bg-metro-secondary/30 blur-sm" />
                    <motion.div 
                      initial={{ x: -200 }}
                      animate={{ x: 200 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="w-40 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[45deg]"
                    />
                    <Zap className="text-metro-primary w-12 h-12 relative z-20 drop-shadow-[0_0_15px_#9b5de5]" />
                 </div>
              </div>

              <div className="space-y-4">
                <span className="text-metro-primary font-black text-xs tracking-[0.5em] uppercase">Phase 01 Deployment</span>
                <h2 className="text-7xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-2xl">THE ARRIVAL</h2>
                <div className="h-px w-40 bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto" />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Scene 2: Connectivity Link */}
        {scene === 1 && (
          <motion.div 
            key="scene2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 pb-20"
          >
            <div className="relative w-full max-w-2xl px-10">
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.15 }}
                className="absolute inset-0 bg-metro-primary rounded-full blur-[120px]"
              />
              <div className="text-center space-y-8 relative z-10">
                 <div className="flex justify-center items-center gap-12">
                    <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-6 bg-white/5 border border-white/10 rounded-[2rem] glass-card">
                       <MapPin className="text-metro-primary w-8 h-8" />
                       <span className="block mt-3 text-[10px] font-black uppercase tracking-widest text-white">Guindy</span>
                    </motion.div>
                    
                    <div className="flex-1 flex items-center px-4">
                       <div className="h-px flex-1 bg-gradient-to-r from-metro-primary to-metro-secondary" />
                       <Activity className="text-white w-5 h-5 mx-4 animate-pulse" />
                       <div className="h-px flex-1 bg-gradient-to-r from-metro-secondary to-metro-primary" />
                    </div>

                    <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-6 bg-white/5 border border-white/10 rounded-[2rem] glass-card">
                       <MapPin className="text-metro-secondary w-8 h-8" />
                       <span className="block mt-3 text-[10px] font-black uppercase tracking-widest text-white">Saidapet</span>
                    </motion.div>
                 </div>
                 <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase mt-8 leading-none">CONNECTING MANIFOLDS</h2>
              </div>
            </div>
          </motion.div>
        )}

        {/* Scene 3: Property Uplift Bloom */}
        {scene === 2 && (
          <motion.div 
            key="scene3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20"
          >
            <motion.div 
               animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute inset-0 bg-gradient-to-tr from-metro-primary to-metro-accent rounded-full blur-[150px]"
            />
            <div className="text-center relative z-10 space-y-8">
               <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <TrendingUp className="w-12 h-12 text-metro-primary animate-bounce" />
               </div>
               <h2 className="text-7xl font-black text-white italic tracking-tighter uppercase leading-none">PROPERTY SURGE</h2>
               <p className="text-metro-primary font-black uppercase tracking-[0.5em] text-sm italic">Causal Intelligence Active</p>
            </div>
          </motion.div>
        )}

        {/* Scene 4: The Final Verdict */}
        {scene === 3 && (
          <motion.div 
            key="scene4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 pb-20"
          >
             <div className="text-center space-y-10 p-16 glass-card rounded-[4rem] border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-metro-primary/10 to-transparent pointer-events-none" />
                <div className="inline-block px-5 py-2 bg-metro-success/10 rounded-full border border-metro-success/20 text-[11px] font-black uppercase tracking-[0.4em] text-metro-success mb-2">
                   Institutional Verdict
                </div>
                <h2 className="text-[9rem] font-black text-white italic tracking-tighter uppercase leading-[0.7] drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                   +31.4%
                </h2>
                <div className="text-4xl text-metro-primary font-black tracking-[0.3em] uppercase italic mt-[-20px]">PREMIUM UPLIFT</div>
                
                <div className="flex justify-center gap-20 mt-12">
                   <div className="text-center border-l-2 border-metro-primary/20 pl-8">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Confidence Interval</span>
                      <span className="block text-2xl font-black text-white tracking-widest mt-1">99% CI</span>
                   </div>
                   <div className="text-center border-l-2 border-metro-primary/20 pl-8">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Validation Test</span>
                      <span className="block text-2xl font-black text-white tracking-widest mt-1">ROBUST</span>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
