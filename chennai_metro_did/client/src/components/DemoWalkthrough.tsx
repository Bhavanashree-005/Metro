import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';

interface Step {
  targetId: string;
  caption: string;
}

const steps: Step[] = [
  {
    targetId: 'kpi-metro-premium',
    caption: "Chennai Metro Phase 1 caused a 10.96% causal price uplift — not correlation, but isolated causal effect using Difference-in-Differences."
  },
  {
    targetId: 'kpi-treatment-ratio',
    caption: "75.2% of transactions fall within the 1km metro catchment — our treatment group for the DiD natural experiment."
  },
  {
    targetId: 'kpi-parallel-trends',
    caption: "p = 0.4104 confirms parallel pre-trends assumption holds. Our causal identification strategy is statistically valid."
  },
  {
    targetId: 'chart-market-vectors',
    caption: "Post-2015 divergence between treated (purple) and synthetic control (teal) isolates the pure Metro effect from pre-existing price appreciation."
  },
  {
    targetId: 'sidebar-nav',
    caption: "Seven analytical modules from propensity matching to heterogeneous treatment effects — a full causal inference pipeline."
  },
  {
    targetId: 'ai-insight-panel',
    caption: "Live AI-generated policy insight powered by Claude — translates statistical output into actionable planning recommendations."
  },
  {
    targetId: '', // Full reveal
    caption: "MetroImpact AI — The first rigorous causal evidence platform for Chennai Metro. Ready for CMRL Phase 2 financing decisions."
  }
];

export default function DemoWalkthrough({ onClose }: { onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateSpotlight = () => {
      const step = steps[currentStep];
      if (step.targetId) {
        const element = document.getElementById(step.targetId);
        if (element) {
          setSpotlightRect(element.getBoundingClientRect());
        }
      } else {
        setSpotlightRect(null);
      }
    };

    updateSpotlight();
    window.addEventListener('resize', updateSpotlight);

    // Auto-advance
    timerRef.current = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(s => s + 1);
      }
    }, 4000);

    return () => {
      window.removeEventListener('resize', updateSpotlight);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      onClose();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
    >
      {/* Dimmed Background with Spotlight */}
      <div 
        className="absolute inset-0 bg-black/60 transition-all duration-700 pointer-events-auto"
        style={{
          maskImage: spotlightRect ? `radial-gradient(circle at ${spotlightRect.left + spotlightRect.width / 2}px ${spotlightRect.top + spotlightRect.height / 2}px, transparent ${Math.max(spotlightRect.width, spotlightRect.height) / 1.5}px, black ${Math.max(spotlightRect.width, spotlightRect.height) / 1.5 + 20}px)` : 'none',
          WebkitMaskImage: spotlightRect ? `radial-gradient(circle at ${spotlightRect.left + spotlightRect.width / 2}px ${spotlightRect.top + spotlightRect.height / 2}px, transparent ${Math.max(spotlightRect.width, spotlightRect.height) / 1.5}px, black ${Math.max(spotlightRect.width, spotlightRect.height) / 1.5 + 20}px)` : 'none',
        }}
      />

      {/* Pulsing Spotlight Ring */}
      <AnimatePresence>
        {spotlightRect && (
          <motion.div
            key={`pulse-${currentStep}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute rounded-full border-2 border-metro-primary shadow-[0_0_50px_rgba(155,93,229,0.8)] pointer-events-none"
            style={{
              left: spotlightRect.left - 10,
              top: spotlightRect.top - 10,
              width: spotlightRect.width + 20,
              height: spotlightRect.height + 20,
            }}
          >
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-x-[-20px] inset-y-[-20px] rounded-full border-2 border-metro-primary/30"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Caption Card */}
      <div className="relative z-10 w-full max-w-lg pointer-events-auto">
        <motion.div
          key={`caption-${currentStep}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-10 border-l-4 border-l-metro-primary rounded-3xl backdrop-blur-3xl shadow-2xl space-y-6"
        >
          <p className="text-xl font-bold leading-relaxed text-white">
            {steps[currentStep].caption}
          </p>
          
          <div className="flex items-center justify-between pt-4">
             <div className="flex gap-1">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-metro-primary' : i < currentStep ? 'w-2 bg-metro-primary/50' : 'w-2 bg-white/10'}`} 
                  />
                ))}
             </div>
             <button 
               onClick={handleNext}
               className="flex items-center gap-2 group px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
             >
                <span className="text-xs font-black uppercase tracking-widest text-white">
                  {currentStep === steps.length - 1 ? "Finish" : "Next →"}
                </span>
             </button>
          </div>
        </motion.div>
      </div>

      {/* Exit Button */}
      <button 
        onClick={onClose}
        className="absolute top-10 right-10 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white pointer-events-auto transition-all"
      >
        <X size={24} />
      </button>

      {/* Global Progress Bar at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/5 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          className="h-full bg-metro-primary"
        />
      </div>
    </motion.div>
  );
}
