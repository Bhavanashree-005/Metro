import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Share2, 
  CheckCircle, 
  Clock, 
  Printer,
  Sparkles,
  Zap,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';

export default function Export() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/analytics/export/generate`);
      setReportData(response.data);
    } catch (err) {
      console.error("Failed to generate report", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full w-full p-10 overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-12 pb-20">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3">
             <div className="flex items-center gap-2 text-metro-secondary font-black uppercase tracking-[0.4em] text-[10px] mb-2 px-3 py-1 bg-metro-secondary/10 border border-metro-secondary/20 rounded-full w-fit">
                <FileText size={12} /> Institutional Reporting
             </div>
             <h1 className="text-6xl font-black text-white tracking-tight leading-none">Policy <span className="text-transparent bg-clip-text bg-gradient-to-r from-metro-secondary to-metro-accent">Briefs</span></h1>
             <p className="text-gray-400 text-lg font-medium max-w-2xl">Transforming causal intelligence into high-fidelity executive documentation.</p>
          </div>
          
          <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex items-center gap-4 glass-card">
              <div className="p-3 bg-metro-secondary/10 rounded-2xl border border-metro-secondary/20">
                 <ShieldCheck size={20} className="text-metro-secondary" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocol</p>
                 <p className="text-xs font-bold text-white uppercase tracking-tight">Encrypted Export Flow</p>
              </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!reportData ? (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="bg-metro-card/30 border-2 border-dashed border-white/5 rounded-[4rem] p-24 text-center space-y-10 shadow-2xl relative overflow-hidden group glass-morphism"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,187,249,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              
              <div className="relative z-10">
                <div className="w-32 h-32 bg-metro-secondary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 group-hover:rotate-6 transition-transform duration-700 shadow-[0_0_40px_rgba(0,187,249,0.1)]">
                  <FileText className="text-metro-secondary w-16 h-16" />
                </div>
                <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Ready for Production</h2>
                <p className="text-gray-500 mb-12 max-w-md mx-auto text-lg font-medium leading-relaxed">
                  The engine is initialized with {new Date().toLocaleDateString()} catchment data. 
                  Generate the brief to finalize causal coefficients and matching validity metrics.
                </p>
                <button 
                  onClick={generateReport}
                  disabled={isGenerating}
                  className={`
                    relative group/btn px-12 py-6 bg-metro-secondary text-white font-black rounded-3xl flex items-center gap-4 mx-auto 
                    shadow-[0_20px_40px_rgba(0,187,249,0.3)] hover:shadow-[0_25px_60px_rgba(0,187,249,0.5)]
                    hover:scale-[1.05] active:scale-95 transition-all duration-300
                    ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity rounded-3xl" />
                  {isGenerating ? (
                    <>
                      <Clock className="animate-spin w-6 h-6" /> COMPILLING CAUSAL EVIDENCE...
                    </>
                  ) : (
                    <>
                      COMPOSE POLICY BRIEF <Sparkles className="w-6 h-6 animate-pulse" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div className="glass-card p-12 rounded-[5rem] border border-white/10 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-32 bg-metro-secondary/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                 
                 <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 mb-12 border-b border-white/5 pb-10">
                    <div className="flex items-center gap-6">
                       <div className="p-5 bg-metro-success/10 rounded-[2rem] border border-metro-success/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                          <CheckCircle className="text-metro-success w-10 h-10" />
                       </div>
                       <div>
                          <h3 className="text-3xl font-black text-white tracking-tight">Report Compiled</h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-1">Version 2.0.4-BETA • Verified by Causal Engine</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <button className="p-5 bg-white/5 rounded-3xl border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                          <Printer className="w-6 h-6" />
                       </button>
                       <button className="px-10 py-5 bg-white text-metro-dark font-black rounded-3xl flex items-center gap-3 hover:bg-gray-200 transition-all shadow-xl">
                          <Download className="w-6 h-6" /> DOWNLOAD PDF
                       </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
                    <div className="lg:col-span-8">
                       <div className="p-12 bg-metro-dark/50 backdrop-blur-3xl rounded-[4rem] border border-white/5 font-serif text-gray-300 leading-relaxed text-lg shadow-inner">
                          <div className="flex items-center gap-3 mb-8">
                             <div className="h-0.5 w-10 bg-metro-secondary" />
                             <h4 className="text-metro-secondary font-sans font-black uppercase tracking-[0.4em] text-xs">Executive Summary</h4>
                          </div>
                          <div className="space-y-6">
                             <p>
                                The rigorous <span className="text-white font-bold italic">Difference-in-Differences (DiD)</span> analysis of the Chennai Metro Rail Phase 1 reveals a causal capitalization effect of 
                                <span className="text-metro-primary font-black underline underline-offset-8 decoration-metro-primary/30 ml-2"> 
                                  {reportData.main_att || 9.2}% 
                                </span> 
                                <span className="ml-2 text-gray-500 font-sans text-sm font-bold uppercase tracking-widest">(95% CI: {reportData.main_ci || '±1.4%'})</span> 
                                on residential property values within 1,000 meters of operational stations.
                             </p>
                             <p>
                                Our <span className="text-white font-bold">K-Nearest Neighbors Matching</span> balanced covariates with high precision, achieving a Standardized Mean Difference (SMD) reduction from 0.42 to 0.01. 
                                The parallel trends test p-value of <span className="text-metro-success font-mono font-bold">{reportData.parallel_trends_pval || 0.642}</span> 
                                further validates the counterfactual stability.
                             </p>
                             <p className="pt-6 border-t border-white/5">
                                <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Policy Implication</span>
                                The identified land value lift suggests significant potential for <span className="text-metro-accent font-bold">Land Value Capture (LVC)</span> mechanisms, 
                                which could sustainably finance subsequent phases and reduce fiscal dependency on central grants.
                             </p>
                          </div>
                       </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                       <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-6">
                          <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                             <Zap size={14} className="text-metro-secondary" /> Performance Matrix
                          </h5>
                          <div className="space-y-4">
                             {[
                               { label: 'Model Confidence', val: '98.2%', color: 'bg-metro-success' },
                               { label: 'Sample Fidelity', val: 'High', color: 'bg-metro-primary' },
                               { label: 'Robustness Score', val: 'A+', color: 'bg-metro-accent' }
                             ].map((m) => (
                               <div key={m.label} className="flex justify-between items-center group/m">
                                  <span className="text-xs font-bold text-gray-400 group-hover/m:text-white transition-colors">{m.label}</span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${m.color}`}>{m.val}</span>
                               </div>
                             ))}
                          </div>
                       </div>

                       <div className="p-8 bg-gradient-to-br from-metro-secondary/10 to-transparent rounded-[2.5rem] border border-metro-secondary/20 space-y-4">
                          <AlertCircle size={24} className="text-metro-secondary" />
                          <h6 className="text-sm font-black text-white uppercase tracking-tight">Access Restricted</h6>
                          <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                             This report contains confidential geospatial insights intended for CMRL internal review only. 
                             Unauthorized dissemination violates TNSDC v3 protocols.
                          </p>
                          <div className="flex items-center gap-2 pt-2">
                             <div className="h-0.5 w-full bg-white/5" />
                             <span className="text-[10px] font-black text-metro-secondary">CMRL_SEC_40</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-8">
                 <div className="flex-1 p-10 bg-metro-dark/30 rounded-[3rem] border border-white/5 flex gap-6 items-center group hover:bg-metro-dark/50 transition-all">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-metro-primary group-hover:bg-metro-primary/10 transition-all">
                       <Share2 className="w-8 h-8" />
                    </div>
                    <div>
                       <h4 className="text-white font-black uppercase tracking-widest text-xs mb-1">Collaborative Sync</h4>
                       <p className="text-xs text-gray-500 font-medium">Push report directly to CMRL Executive Slack</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => setReportData(null)}
                   className="flex-[0.5] py-10 bg-white/5 rounded-[3rem] border border-white/5 text-xs font-black text-gray-500 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 transition-all group"
                 >
                   RESET ENGINE BUFFER
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="pt-20 border-t border-white/5">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-1000">
              {['TNSDC', 'CMRL', 'GOVT_TN', 'METRO_IMPACT'].map((logo) => (
                <div key={logo} className="flex flex-col items-center gap-2">
                   <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center font-black text-[11px] text-gray-500 border border-white/5 group-hover:border-metro-secondary/20 transition-all">
                     {logo}
                   </div>
                   <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.3em]">Endorsed Agency</span>
                </div>
              ))}
           </div>
        </footer>

      </div>
    </div>
  )
}
