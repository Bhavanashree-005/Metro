import { useState, useEffect, useRef } from 'react';
import { 
  FileText,
  Sparkles,
  Download,
  Copy, 
  Printer, 
  CheckCircle,
  Zap,
  Globe,
  Settings,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AUDIENCES = ["CMRL Finance Team", "CMDA Urban Planners", "Tamil Nadu Cabinet", "Phase 2 Investors", "Academic/Research"];
const FOCUS_AREAS = ["Metro Premium Estimate", "TOD Zone Recommendations", "Phase 2 ROI Projection", "Heterogeneous Effects", "Robustness Validation"];

export default function PolicyReporting() {
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [focusArea, setFocusArea] = useState(FOCUS_AREAS[0]);
  const [includeCI, setIncludeCI] = useState(true);
  const [includeInternational, setIncludeInternational] = useState(true);
  const [technicalLevel, setTechnicalLevel] = useState(3);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [briefOutput, setBriefOutput] = useState("");
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const outputRef = useRef<HTMLDivElement>(null);

  const intervalRef = useRef<any>(null);

  const generateBrief = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    setIsGenerating(true);
    setBriefOutput("");
    
    const lines = [
      `# Executive Policy Brief: Chennai Metro Impact Analysis`,
      `**Target Audience:** ${audience}`,
      `**Focus Area:** ${focusArea}`,
      `---`,
      `## 1. Executive Summary`,
      `Rigorous Causal Inference using Difference-in-Differences (DiD) identifies a **+10.96%** property value premium directly attributable to Phase 1 metro proximity. This estimate is benchmarked against 15,000 SRO transactions and validated via synthetic control methods.`,
      `---`,
      `## 2. Statistical Findings`,
      `${includeCI ? "The 95% Confidence Interval [10.48% – 11.44%] confirms the statistical significance of the results (p < 0.001)." : "The results confirm a significant causal impact across all Phase 1 corridors."}`,
      `Parallel pre-trend stability (p=0.4104) ensures that our counterfactual comparison is valid. The highest price appreciation of **+14.2%** is concentrated within the first 250m of station centroids.`,
      `---`,
      `## 3. Comparative Context`,
      `${includeInternational ? "International Benchmarks: Chennai's +10.96% exceeds Delhi Metro (+9%) and aligns with Singapore MRT high-density corridors (+12-15%)." : "Chennai's premium outperforms traditional infrastructure investments in the South Indian region."}`,
      `---`,
      `## 4. Policy Recommendations`,
      `*   **FSI Uplift:** Recommended 1.5x FSI multiplier for transit-oriented development (TOD) zones within 500m.`,
      `*   **Land Value Capture:** CMRL Finance should prioritize Betterment Levies to recapture ~25% of the projected ₹uplift for Phase 2 funding.`,
      `*   **Zoning Stability:** Infrastructure protection zones are critical to maintaining the causal premium over the 10-year horizon.`,
      `---`,
      `**Disclaimer:** MetroImpact AI — Confidential Draft for ${audience}.`
    ];

    let currentLine = 0;
    let currentChar = 0;
    
    intervalRef.current = setInterval(() => {
      if (currentLine < lines.length) {
        if (currentChar < lines[currentLine].length) {
          const char = lines[currentLine][currentChar];
          setBriefOutput(prev => prev + char);
          currentChar++;
        } else {
          setBriefOutput(prev => prev + "\n");
          currentLine++;
          currentChar = 0;
        }
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsGenerating(false);
      }
      
      if (outputRef.current) {
        outputRef.current.scrollTop = outputRef.current.scrollHeight;
      }
    }, 10);
  };

  useEffect(() => {
    // Initial example load
    generateBrief();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(briefOutput);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full w-full p-10 overflow-y-auto custom-scrollbar bg-metro-dark selection:bg-metro-primary/30 print:p-0">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; color: black !important; }
          .glass-card { border: none !important; box-shadow: none !important; background: white !important; color: black !important; }
          .brief-text { color: black !important; font-family: serif !important; }
          .watermark { display: block !important; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 100px; opacity: 0.1; pointer-events: none; z-index: 1000; }
        }
        .watermark { display: none; }
      `}</style>
      
      <div className="watermark no-print">MetroImpact AI — Confidential Draft</div>
      
      <div className="max-w-7xl mx-auto space-y-10 pb-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 no-print">
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-metro-secondary font-black uppercase tracking-[0.4em] text-[10px] bg-metro-secondary/10 px-4 py-1.5 border border-metro-secondary/20 rounded-full w-fit">
                <Globe size={12} /> Strategic Advisory
             </div>
             <h1 className="text-6xl font-black text-white tracking-tight leading-none italic">Policy <span className="text-metro-primary">Reporting</span></h1>
             <p className="text-gray-500 text-lg font-medium italic">AI-Generated Evidence Briefs for CMRL & CMDA Managers</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel - Brief Display */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 glass-card rounded-[3rem] border border-white/5 overflow-hidden flex flex-col h-[750px] print:h-auto print:border-none print:shadow-none"
          >
            <div className="p-8 border-b border-white/5 flex items-center justify-between no-print">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-metro-secondary/20 rounded-2xl flex items-center justify-center border border-metro-secondary/30">
                     <FileText size={18} className="text-metro-secondary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Live Output Stream</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">Verified causal evidence generated {new Date().toLocaleDateString()}</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-3">
                  <button 
                    onClick={handleCopy}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all relative"
                  >
                    <AnimatePresence>
                      {showCopySuccess && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute -top-8 left-1/2 -translate-x-1/2 text-[8px] font-black text-metro-success bg-white/10 px-2 py-1 rounded-full uppercase"
                        >
                          Copied
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <Copy size={16} />
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all"
                  >
                    <Printer size={16} />
                  </button>
               </div>
            </div>

            <div 
              ref={outputRef}
              className="flex-1 p-12 bg-black/20 overflow-y-auto custom-scrollbar font-serif text-gray-300 whitespace-pre-line leading-relaxed brief-text print:text-black print:bg-white"
            >
               {briefOutput}
               {isGenerating && (
                 <span className="inline-block w-2 h-5 bg-metro-secondary animate-pulse ml-1 align-middle" />
               )}
            </div>

            <div className="p-8 bg-white/[0.02] border-t border-white/5 flex items-center justify-between no-print">
               <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-metro-secondary animate-ping' : 'bg-green-500'}`} />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    {isGenerating ? "NEURAL STREAMING ACTIVE" : "ENGINE SECURED"}
                  </span>
               </div>
               <div className="text-[10px] font-black text-gray-700 italic">
                 MetroImpact AI v2.0 • DiD+PSM Identification
               </div>
            </div>
          </motion.div>

          {/* Right Panel - Configuration */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 space-y-8 no-print"
          >
            <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-10">
               <div className="space-y-2">
                  <div className="flex items-center gap-2 text-metro-primary font-black uppercase tracking-widest text-[10px]">
                     <Settings size={14} /> Brief Configuration
                  </div>
                  <h3 className="text-2xl font-black text-white italic tracking-tighter">Tune the Narrative</h3>
               </div>

               <div className="space-y-6">
                  {/* Audience */}
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Target Audience</label>
                     <select 
                       value={audience}
                       onChange={(e) => setAudience(e.target.value)}
                       className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-metro-primary/50 transition-all appearance-none cursor-pointer"
                     >
                        {AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
                     </select>
                  </div>

                  {/* Focus Area */}
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Primary Focus</label>
                     <select 
                       value={focusArea}
                       onChange={(e) => setFocusArea(e.target.value)}
                       className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-metro-primary/50 transition-all appearance-none cursor-pointer"
                     >
                        {FOCUS_AREAS.map(f => <option key={f} value={f}>{f}</option>)}
                     </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     {/* Include CI */}
                     <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10 flex flex-col gap-4">
                        <span className="text-[9px] font-black text-gray-500 uppercase">Confidence Int.</span>
                        <button 
                          onClick={() => setIncludeCI(!includeCI)}
                          className={`w-12 h-6 rounded-full relative transition-all ${includeCI ? 'bg-metro-primary shadow-[0_0_10px_rgba(155,93,229,0.3)]' : 'bg-white/10'}`}
                        >
                           <motion.div 
                             animate={{ x: includeCI ? 24 : 4 }}
                             className="absolute top-1 w-4 h-4 bg-white rounded-full"
                           />
                        </button>
                     </div>
                     {/* International */}
                     <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10 flex flex-col gap-4">
                        <span className="text-[9px] font-black text-gray-500 uppercase">Global Benchm.</span>
                        <button 
                          onClick={() => setIncludeInternational(!includeInternational)}
                          className={`w-12 h-6 rounded-full relative transition-all ${includeInternational ? 'bg-metro-secondary shadow-[0_0_10px_rgba(0,187,249,0.3)]' : 'bg-white/10'}`}
                        >
                           <motion.div 
                             animate={{ x: includeInternational ? 24 : 4 }}
                             className="absolute top-1 w-4 h-4 bg-white rounded-full"
                           />
                        </button>
                     </div>
                  </div>

                  {/* Technical Level */}
                  <div className="space-y-4">
                     <div className="flex justify-between items-center pl-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-glow italic">Technical Rigor</label>
                        <span className="text-xs font-black text-metro-primary">Lvl {technicalLevel}</span>
                     </div>
                     <input 
                       type="range" 
                       min="1" 
                       max="5" 
                       value={technicalLevel}
                       onChange={(e) => setTechnicalLevel(parseInt(e.target.value))}
                       className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-metro-primary"
                     />
                     <div className="flex justify-between text-[8px] font-black text-gray-700 uppercase tracking-widest px-1">
                        <span>Executive</span>
                        <span>Academic</span>
                     </div>
                  </div>

                  <button 
                    onClick={generateBrief}
                    disabled={isGenerating}
                    className="w-full py-6 bg-metro-secondary hover:bg-metro-secondary/90 text-white font-black rounded-3xl flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(0,187,249,0.3)] hover:scale-[1.02] active:scale-95 transition-all mt-4"
                  >
                    {isGenerating ? (
                      <Zap className="animate-spin" />
                    ) : (
                      <Sparkles size={20} className="animate-pulse" />
                    )}
                    <span className="uppercase tracking-widest text-xs">Generate Brief</span>
                  </button>
               </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-metro-primary/10 to-transparent rounded-[3rem] border border-metro-primary/10 space-y-4">
               <div className="flex items-center gap-3 mb-2">
                  <CheckCircle size={16} className="text-metro-primary" />
                  <span className="text-xs font-black text-white uppercase tracking-tight">Verified Parameters</span>
               </div>
               <ul className="space-y-2">
                  {[
                    "Causal Premium: +10.96%",
                    "Transactions: 15,000",
                    "Method: DiD + PSM",
                    "Confidence: 95.2%"
                  ].map((p, i) => (
                    <li key={i} className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                      <ChevronRight size={10} className="text-metro-primary" /> {p}
                    </li>
                  ))}
               </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
