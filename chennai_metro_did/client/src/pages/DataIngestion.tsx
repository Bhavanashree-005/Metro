import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../App';
import { 
  UploadCloud, 
  CheckCircle, 
  Database, 
  AlertCircle, 
  RefreshCcw, 
  Table as TableIcon,
  Activity,
  Zap,
  ShieldCheck,
  FileCode,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import MapComponent from '../components/MapComponent';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DataIngestion() {
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [isVisionSource, setIsVisionSource] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const { stats, loading, setIsDataIngested, refreshStats } = useContext(AppContext);

  // If we have stats from the global context, we consider the trial data synced
  const currentCount = stats?.sample_size || 0;
  const currentFile = currentCount > 0 ? "chennai_property_trials.csv" : "";

  const handleFileUpload = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    const isImage = file.type.startsWith('image/');
    setIsVisionSource(isImage);
    
    if (isImage) {
      setStatus("scanning");
      // Cinematic Vision-AI simulation
      setTimeout(async () => {
        setStatus("uploading");
        await processUpload(file);
      }, 3000);
    } else {
      setStatus("uploading");
      await processUpload(file);
    }
  };

  const processUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/ingest/upload`, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setProgress(percentCompleted);
        }
      });

      if (response.data.status === "Success") {
        setUploadResult(response.data);
        setTimeout(async () => {
          setStatus("success");
          setIsDataIngested(true);
          // Gently refresh global metrics without wiping the UI state
          await refreshStats();
        }, 1000);
      } else {
        setError(response.data.message || "Upload failed");
        setStatus("error");
      }
    } catch (err) {
      setError("Server connection failed. Ensure backend is running.");
      setStatus("error");
    }
  };

  const sampleData = [
    { sro: 'Mylapore', area: 1200, price: 8500, dist: 350, year: 2022 },
    { sro: 'T. Nagar', area: 1560, price: 12400, dist: 120, year: 2023 },
    { sro: 'Saidapet', area: 980, price: 7200, dist: 890, year: 2021 },
    { sro: 'Guindy', area: 1850, price: 10500, dist: 450, year: 2023 }
  ];

  return (
    <div className="h-full w-full p-10 overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-16 pb-20">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3">
             <div className="flex items-center gap-2 text-metro-secondary font-black uppercase tracking-[0.4em] text-[10px] mb-2 px-3 py-1 bg-metro-secondary/10 border border-metro-secondary/20 rounded-full w-fit">
                <Database size={12} /> Live Data Ingestion
             </div>
             <h1 className="text-6xl font-black text-white tracking-tight leading-none">Ingestion <span className="text-transparent bg-clip-text bg-gradient-to-r from-metro-secondary to-metro-accent">Hub</span></h1>
             <p className="text-gray-400 text-lg font-medium max-w-2xl">Override synthetic baselines by syncing institutional property transaction manifolds.</p>
          </div>
          
          <div className="flex gap-4">
             <div className="bg-white/5 px-6 py-4 rounded-3xl border border-white/5 flex items-center gap-4 glass-card">
                 <Activity size={16} className="text-metro-success animate-pulse" />
                 <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">Pipeline: Operational</span>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          <div className="xl:col-span-8 space-y-10">
            {/* Upload Zone */}
            <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*,.csv"
                  onChange={handleFileUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30" 
                  disabled={status === 'uploading' || status === 'scanning'}
                />
               
               <AnimatePresence mode="wait">
                 {(status === 'idle' || status === 'error') ? (
                   <motion.div 
                     key="idle"
                     initial={{ opacity: 0, scale: 0.98 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 1.02 }}
                     className={`
                       relative z-20 overflow-hidden rounded-[4rem] border-2 border-dashed p-24 text-center glass-morphism transition-all duration-700
                       ${status === 'error' ? 'border-red-500/30 bg-red-500/5' : 'border-metro-secondary/30 bg-metro-secondary/5 hover:border-metro-secondary/50'}
                     `}
                   >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,187,249,0.1),transparent_70%)] pointer-events-none" />
                      
                      <div className="space-y-8">
                         <div className={`p-8 w-fit mx-auto rounded-[2.5rem] shadow-2xl transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3 ${status === 'error' ? 'bg-red-500/10' : 'bg-metro-secondary/10'}`}>
                           <UploadCloud className={`w-20 h-20 ${status === 'error' ? 'text-red-500' : 'text-metro-secondary'}`} />
                         </div>
                         <div className="space-y-4">
                           <h2 className="text-4xl font-black text-white tracking-tight">{status === 'error' ? 'System Rejection' : 'Drop Manifest Here'}</h2>
                           <p className="text-gray-500 max-w-sm mx-auto text-lg leading-relaxed font-medium">
                             {status === 'error' ? error : <>Stream institutional property records directly into the <span className="text-metro-secondary">Causal Engine</span>.</>}
                           </p>
                         </div>
                          <div className="flex items-center justify-center gap-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                             <span className="px-3 py-1 bg-white/5 rounded-md border border-white/5">CSV / PNG / JPG</span>
                             <span className="px-3 py-1 bg-white/5 rounded-md border border-white/5">Vision-AI Extraction</span>
                             <span className="px-3 py-1 bg-white/5 rounded-md border border-white/5">Max 100MB</span>
                          </div>
                      </div>
                   </motion.div>
                 ) : status === 'scanning' ? (
                    <motion.div 
                      key="scanning"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-metro-primary/5 backdrop-blur-3xl border border-metro-primary/20 rounded-[4rem] p-24 flex flex-col items-center justify-center text-center space-y-10 relative overflow-hidden"
                    >
                       <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-metro-primary to-transparent animate-scan"></div>
                       <motion.div 
                         initial={{ y: -100 }}
                         animate={{ y: 500 }}
                         transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                         className="absolute inset-x-0 h-[2px] bg-metro-primary shadow-[0_0_15px_#9b5de5] z-0 opacity-50"
                       />

                       <div className="relative z-10 text-center">
                          <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 mb-6 mx-auto">
                             <Activity className="w-12 h-12 text-metro-primary animate-pulse" />
                          </div>
                          <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Vision Manifold Extraction</h3>
                          <p className="text-gray-500 font-bold text-xs mt-2 tracking-[0.4em] uppercase">Scanning geospatial property markers...</p>
                       </div>
                    </motion.div>
                  ) : status === 'uploading' ? (
                   <motion.div 
                     key="uploading"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="bg-metro-card/50 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-24 flex flex-col items-center justify-center text-center space-y-10"
                   >
                      <div className="relative">
                         <RefreshCcw className="w-24 h-24 text-metro-secondary animate-spin opacity-20" />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <Zap className="w-10 h-10 text-metro-secondary animate-pulse" />
                         </div>
                      </div>
                      
                      <div className="w-full max-w-md space-y-6">
                         <div className="flex justify-between items-end">
                            <h3 className="text-2xl font-black text-white tracking-tight">Syncing Vectors...</h3>
                            <span className="text-metro-secondary font-black text-4xl leading-none">{progress}%</span>
                         </div>
                         <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-metro-secondary to-metro-accent rounded-full shadow-[0_0_20px_rgba(0,187,249,0.5)]"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                         </div>
                         <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] animate-pulse">Running Spatiotemporal KNN Imputation</p>
                      </div>
                   </motion.div>
                 ) : (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-12"
                    >
                       <div className="bg-metro-success/5 border border-metro-success/20 rounded-[4rem] p-12 text-center space-y-6 glass-morphism relative overflow-hidden group">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.1),transparent_70%)] pointer-events-none" />
                          <div className="flex items-center justify-center gap-6">
                            <div className="p-4 rounded-2xl bg-metro-success/10 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                               <CheckCircle className="w-8 h-8 text-metro-success" />
                            </div>
                            <div className="text-left">
                               <h2 className="text-3xl font-black text-white tracking-tight italic uppercase leading-none">
                                  {isVisionSource ? 'Vision Results Locked' : 'Sync Established'}
                               </h2>
                               <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-2">
                                  {isVisionSource ? 'Institutional Manifold Extracted' : `${currentFile} • ${currentCount.toLocaleString()} Records Synced`}
                               </p>
                            </div>
                          </div>
                       </div>

                       {/* Instant Product Results Layout */}
                       <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                          {/* Live Mapping Area */}
                          <div className="lg:col-span-12 xl:col-span-7 h-[500px] flex flex-col gap-4">
                             <div className="flex items-center justify-between px-4">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Geospatial Impact Mapping</h3>
                                <div className="flex items-center gap-2">
                                   <div className="w-2 h-2 rounded-full bg-metro-primary animate-pulse" />
                                   <span className="text-[9px] font-black text-white tracking-widest uppercase">Live Focus: Guindy Hub</span>
                                </div>
                             </div>
                             <div className="flex-1 rounded-[3.5rem] overflow-hidden border border-white/10 shadow-3xl">
                                <MapComponent 
                                   showHeatmap={true} 
                                   focusPoint={uploadResult ? [13.0092, 80.2131] : null} 
                                />
                             </div>
                          </div>

                          {/* Data Balance Monitor (Unique to Ingestion Hub) */}
                          <div className="lg:col-span-12 xl:col-span-5 h-[500px] flex flex-col gap-4">
                             <div className="flex items-center justify-between px-4">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Manifest Balance</h3>
                                <span className="text-[9px] font-black text-metro-secondary tracking-widest uppercase italic">Sample Integrity Sync</span>
                             </div>
                             <div className="flex-1 glass-card p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden flex flex-col justify-between">
                                <div className="absolute inset-0 bg-gradient-to-tr from-metro-secondary/5 to-transparent pointer-events-none" />
                                
                                <div className="h-[280px] w-full">
                                   <ResponsiveContainer width="100%" height="100%">
                                      <BarChart 
                                         data={[
                                            { name: 'Treated', count: uploadResult?.treated_count || 450, fill: '#9b5de5' },
                                            { name: 'Control', count: uploadResult?.control_count || 1200, fill: 'rgba(155,93,229,0.1)' }
                                         ]}
                                         margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                                      >
                                         <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                         <XAxis dataKey="name" stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                                         <YAxis stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                                         <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#111622', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }} />
                                         <Bar dataKey="count" radius={[12, 12, 0, 0]} barSize={50} />
                                      </BarChart>
                                   </ResponsiveContainer>
                                </div>

                                <div className="space-y-4 pt-6 mt-6 border-t border-white/5">
                                   <div className="flex justify-between items-baseline">
                                      <span className="text-[10px] font-black text-gray-500 uppercase italic">Control Basin Size</span>
                                      <span className="text-3xl font-black text-white">{uploadResult?.control_count?.toLocaleString() || "1,200"} Properties</span>
                                   </div>
                                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        className="h-full bg-metro-secondary shadow-[0_0_15px_#00bbf9]"
                                      />
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Action Footer */}
                       <div className="flex flex-col md:flex-row gap-6">
                          <Link 
                            to="/dashboard"
                            className="flex-1 px-10 py-7 bg-metro-primary rounded-[2.5rem] text-[11px] font-black text-white hover:scale-[1.03] active:scale-95 transition-all text-center uppercase tracking-[0.3em] shadow-[0_25px_50px_rgba(155,93,229,0.3)] flex items-center justify-center gap-4 group"
                          >
                             Explore Full Intelligence Suite <Zap size={14} className="group-hover:animate-bounce" />
                          </Link>
                          <button 
                             onClick={() => setStatus('idle')}
                             className="flex-1 px-10 py-7 bg-white/5 border border-white/5 rounded-[2.5rem] text-[11px] font-black text-gray-400 hover:text-white hover:bg-white/10 transition-all text-center uppercase tracking-[0.3em]"
                           >
                              {isVisionSource ? 'New Vision Extraction' : 'Sync New Manifest'}
                           </button>
                       </div>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>

            {/* Table Preview */}
            <div className="glass-card p-12 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden group">
               <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-white/5 rounded-2xl">
                        <TableIcon className="text-metro-secondary w-6 h-6" />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-white tracking-tight">Stream Preview</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 italic">Normalized transactional snapshots</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <div className="w-2 h-2 rounded-full bg-metro-secondary animate-ping" />
                     <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Active Sink</span>
                  </div>
               </div>
               
               <div className="overflow-hidden rounded-[2.5rem] border border-white/5 shadow-inner bg-black/20">
                 <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-white/[0.02] text-gray-500 font-black uppercase text-[10px] tracking-[0.2em] border-b border-white/5">
                       <tr>
                         <th className="p-6">SRO Sector</th>
                         <th className="p-6">Area (Sq.Ft)</th>
                         <th className="p-6">Price Point</th>
                         <th className="p-6">Metro Prox.</th>
                         <th className="p-6">Sync Year</th>
                       </tr>
                    </thead>
                    <tbody className="text-gray-400 divide-y divide-white/[0.02]">
                       {sampleData.map((row, i) => (
                         <tr key={i} className="hover:bg-white/[0.03] transition-colors group/row">
                            <td className="p-6">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-metro-secondary/10 flex items-center justify-center text-[10px] font-bold text-metro-secondary">{row.sro[0]}</div>
                                  <span className="text-white font-black tracking-tight">{row.sro}</span>
                               </div>
                            </td>
                            <td className="p-6 font-mono font-bold text-gray-500 group-hover/row:text-gray-300 transition-colors">{row.area.toLocaleString()}</td>
                            <td className="p-6">
                               <span className="px-3 py-1 bg-metro-primary/10 text-metro-primary rounded-full text-[10px] font-black tracking-widest border border-metro-primary/20">₹{row.price.toLocaleString()} / SQFT</span>
                            </td>
                            <td className="p-6">
                               <div className="flex items-center gap-2">
                                  <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden max-w-[60px]">
                                     <div className="h-full bg-metro-accent" style={{ width: `${Math.max(20, 100 - row.dist/10)}%` }} />
                                  </div>
                                  <span className="font-mono text-gray-300 font-bold">{row.dist}m</span>
                               </div>
                            </td>
                            <td className="p-6 font-mono font-bold text-gray-500">{row.year}</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
            </div>
          </div>

          {/* Sidebar Panels */}
          <div className="xl:col-span-4 space-y-10">
             <div className="glass-card p-10 rounded-[3.5rem] border border-metro-secondary/20 shadow-2xl relative overflow-hidden group h-fit">
                <div className="absolute inset-0 bg-gradient-to-br from-metro-secondary/5 to-transparent pointer-events-none" />
                <div className="relative z-10 flex items-center gap-4 mb-10 text-glow">
                   <div className="p-3 bg-metro-secondary/10 rounded-2xl border border-metro-secondary/20">
                     <ShieldCheck className="text-metro-secondary w-6 h-6" />
                   </div>
                   <h2 className="text-2xl font-black text-white tracking-tight">Security Engine</h2>
                </div>

                <div className="space-y-6 relative z-10">
                   {[
                     { label: "Spatiotemporal Scrubbing", status: "VERIFIED", icon: <Activity size={14} /> },
                     { label: "Price Inflation Deflator", status: "APPLIED", icon: <Zap size={14} /> },
                     { label: "Institutional Schema v4", status: "DETACHED", icon: <FileCode size={14} /> }
                   ].map((item, i) => (
                     <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex items-center justify-between group/card">
                        <div className="flex items-center gap-3">
                           <div className="text-gray-500">{item.icon}</div>
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</span>
                        </div>
                        <span className="text-[9px] font-black text-metro-secondary bg-metro-secondary/10 px-2 py-0.5 rounded border border-metro-secondary/20 tracking-tighter">{item.status}</span>
                     </div>
                   ))}
                </div>

                <div className="mt-12 p-8 bg-metro-accent/5 rounded-[2.5rem] border border-metro-accent/20 space-y-4 relative z-10">
                   <AlertCircle className="w-8 h-8 text-metro-accent mb-2" />
                   <h4 className="text-sm font-black text-white uppercase tracking-tight">Schema Enforcement</h4>
                   <p className="text-[11px] text-gray-500 leading-relaxed font-bold italic">
                      Manifest must contain <span className="text-white">year</span>, <span className="text-white">area_sqft</span>, and <span className="text-white">declared_value</span>. 
                      Heterogeneity catchments are derived dynamically on sync.
                   </p>
                </div>
             </div>

             <div className="p-10 bg-gradient-to-br from-metro-dark to-metro-card rounded-[3.5rem] border border-white/5 relative overflow-hidden group">
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                 <div className="relative z-10 space-y-4">
                    <h4 className="text-xl font-black text-white tracking-tight">Pipeline Status</h4>
                    <div className="flex flex-col gap-3">
                       <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-metro-success shadow-[0_0_10px_#00f5d4] animate-pulse" />
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ingestion Node 01: Active</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-metro-secondary shadow-[0_0_10px_#00bbf9]" />
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cache Persistence: Sync</span>
                       </div>
                    </div>
                 </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}
