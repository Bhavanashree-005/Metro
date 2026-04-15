import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ChevronRight, Database, Target, Activity, Zap, TrendingUp, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import CinematicImpactReel from '../components/CinematicImpactReel';

export default function Home() {
  const [activeMarker, setActiveMarker] = useState(0);

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden relative bg-[#0B101B] selection:bg-metro-primary/30 custom-scrollbar">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-10 relative z-10 pb-32">
        {/* Navigation / Header */}
        <header className="py-12 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
             <div className="w-10 h-10 bg-gradient-to-tr from-metro-primary to-metro-secondary rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="text-white w-5 h-5 fill-current" />
             </div>
             <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">MetroImpact AI</h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link to="/dashboard" className="px-8 py-3 bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl text-[11px] font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest flex items-center gap-2 group">
              Enter Platform <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </header>

        {/* Hero Section */}
        <section className="pt-20 pb-40 text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-metro-primary/20 bg-metro-primary/5 rounded-full text-metro-primary text-[10px] font-black uppercase tracking-[0.3em] mb-4 shadow-[0_0_20px_rgba(155,93,229,0.1)]">
              <Activity size={12} className="animate-pulse" /> Next-Generation Causal Intelligence
            </div>
            <h1 className="text-8xl md:text-[7rem] font-black tracking-tighter leading-[0.8] text-white">
              WHERE INFRASTRUCTURE <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-metro-primary via-metro-secondary to-metro-accent drop-shadow-sm">MEETS INTELLIGENCE</span>
            </h1>
            
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex items-center justify-center gap-4 py-4 px-8 bg-metro-primary/10 border border-metro-primary/20 rounded-full w-fit mx-auto shadow-[0_0_30px_rgba(155,93,229,0.1)] mb-8"
            >
               <div className="w-2.5 h-2.5 bg-metro-success rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
               <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Institutional Grade Deployment Active</span>
            </motion.div>
            <p className="text-gray-400 text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
              Quantify the invisible. Visualize the causal relationship between mass transit infrastructure and real estate value growth across Chennai.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6"
          >
            <Link to="/dashboard" className="w-full md:w-auto px-12 py-6 bg-metro-primary rounded-[2rem] text-[13px] font-black text-white uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(155,93,229,0.3)]">
              Explore Live Dashboard
            </Link>
            <button 
              className="w-full md:w-auto px-12 py-6 bg-white/5 border border-white/10 rounded-[2rem] text-[13px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3 glass-card"
              onClick={() => document.getElementById('video-demo')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Play size={18} className="fill-current" /> Watch Demo
            </button>
          </motion.div>
        </section>

        {/* Cinematic Impact Reel Section */}
        <section className="pb-40" id="video-demo">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-center mb-16 space-y-4"
           >
              <h2 className="text-4xl font-black text-white italic tracking-tight uppercase">Cinematic Intelligence</h2>
              <p className="text-gray-500 font-medium italic">A bespoke visualization of Chennai's metro-driven property transformation</p>
           </motion.div>
           
           <div className="max-w-5xl mx-auto aspect-video rounded-[4rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(155,93,229,0.2)] relative bg-[#0a0f1a] group">
              {/* High-Fidelity Backdrop with Deep Fade */}
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center scale-105 group-hover:scale-110 transition-transform duration-1000 opacity-30" 
                style={{ backgroundImage: 'url("/project_demo.webp")' }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B101B] via-transparent to-[#0B101B] opacity-90 z-5"></div>
              
              {/* The Cinematic Reel Component */}
              <div className="absolute inset-0 z-20">
                 <CinematicImpactReel overlayMode={true} />
              </div>
           </div>
        </section>

        {/* How It Works - Step Flow */}
        <section className="pb-40">
           <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {[
                { title: "Real Data Hub", desc: "Live SRO manifests for Guindy & Saidapet", icon: <Database /> },
                { title: "Vector Cleaning", desc: "Removing outliers from 15k+ records", icon: <TrendingUp /> },
                { title: "Smart Matching", desc: "Synthetic control group synchronization", icon: <Target /> },
                { title: "Causal Engine", desc: "Determining 25-35% capital uplift", icon: <Activity /> },
                { title: "Policy Export", desc: "Institutional reports for city planners", icon: <Zap /> }
              ].map((step, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`space-y-6 relative group cursor-pointer p-6 rounded-[2rem] transition-all duration-500 ${activeMarker === i ? 'bg-white/5 border border-white/10' : 'hover:bg-white/[0.02]'}`}
                  onClick={() => setActiveMarker(i)}
                >
                   <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border transition-all duration-500 shadow-xl ${activeMarker === i ? 'bg-metro-primary/20 border-metro-primary/50 shadow-[0_0_30px_rgba(155,93,229,0.3)] scale-110' : 'bg-white/5 border-white/5 group-hover:scale-105'}`}>
                      <span className={`${activeMarker === i ? 'text-white' : 'text-metro-primary'} transition-colors`}>{step.icon}</span>
                   </div>
                   <div className="space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-metro-primary font-black text-xs tracking-tight">PHASE 0{i+1}</span>
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{step.title}</h3>
                      </div>
                      <p className="text-gray-500 text-sm font-medium leading-relaxed group-hover:text-gray-400 transition-colors">{step.desc}</p>
                   </div>
                   {i < 4 && (
                      <div className="hidden md:block absolute top-16 left-28 w-full h-[1px] bg-gradient-to-r from-metro-primary/20 to-transparent pointer-events-none" />
                   )}
                   {activeMarker === i && (
                      <motion.div 
                        layoutId="step-glow"
                        className="absolute inset-0 bg-metro-primary/5 rounded-[2rem] -z-10 blur-xl"
                      />
                   )}
                </motion.div>
              ))}
           </div>
        </section>

        {/* Feature Teasers */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
           <FeatureCard 
             title="Interactive Map" 
             desc="Explore treated zones and control catchments across the Chennai corridor." 
             icon={<Target />} 
             path="/dashboard"
           />
           <FeatureCard 
             title="Causal Projections" 
             desc="Leverage DiD matrices to simulate future infrastructure ROI." 
             icon={<Activity />} 
             path="/simulator"
           />
           <FeatureCard 
             title="Policy Briefs" 
             desc="Export institutional-grade reports for urban planning stakeholders." 
             icon={<ShieldCheck />} 
             path="/export"
           />
        </section>

      </div>
      
      {/* Footer */}
      <footer className="py-20 border-t border-white/5 text-center">
         <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em]">MetroImpact AI © 2026 • Causal Intelligence Engine</p>
      </footer>
    </div>
  );
}

function FeatureCard({ title, desc, icon, path }: any) {
  return (
    <Link to={path} className="p-10 glass-card rounded-[3rem] border border-white/5 space-y-8 hover:bg-white/[0.08] transition-all duration-500 group relative overflow-hidden">
       <div className="absolute inset-0 bg-gradient-to-tr from-metro-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
       <div className="p-4 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-500">
          <span className="text-metro-primary">{icon}</span>
       </div>
       <div className="space-y-4 relative z-10">
          <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{title}</h3>
          <p className="text-gray-400 text-sm font-medium leading-relaxed">{desc}</p>
       </div>
    </Link>
  );
}
