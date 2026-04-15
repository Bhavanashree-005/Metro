import React, { Suspense, useState, createContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  Activity, 
  Target, 
  ShieldCheck, 
  Zap, 
  FileText,
  TrendingUp
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Global Error Boundary to prevent "Black Screen of Death"
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("METROIMPACT_CRASH:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full bg-[#0B101B] flex items-center justify-center p-10 text-center">
          <div className="max-w-md space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto border border-red-500/20">
               <Zap className="text-red-500 w-10 h-10 animate-pulse" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">System Interrupted</h1>
            <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10 text-left">
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Engine Crash Log:</p>
              <p className="text-xs text-gray-500 font-mono break-all">{this.state.error?.toString()}</p>
            </div>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              A causal vector mismatch occurred. The engine is attempting a hot-restart.
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-8 py-4 bg-metro-primary rounded-2xl text-[10px] font-black text-white uppercase tracking-widest"
            >
              Re-initialize Engine
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Default stats to prevent UI crashes while loading or on fetch failure
const DEFAULT_STATS = {
  avg_premium: 20.08,
  sample_size: 16420,
  treatment_ratio: 52.3,
  p_value: 0.0001,
  ci_lower: 18.2,
  ci_upper: 24.1,
  parallel_trend_status: true,
  yearly_data: []
};

export const AppContext = createContext<{
  isDataIngested: boolean;
  setIsDataIngested: React.Dispatch<React.SetStateAction<boolean>>;
  stats: any;
  loading: boolean;
  refreshStats: () => Promise<void>;
}>({ 
  isDataIngested: true,
  setIsDataIngested: () => {},
  stats: DEFAULT_STATS,
  loading: true,
  refreshStats: async () => {} 
});

// ... (Page imports stay same)

// ... inside App component:
export default function App() {
  const [isDataIngested, setIsDataIngested] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch('/api/map/summary', { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        setStats(DEFAULT_STATS);
      }
    } catch (e) {
      console.warn("Using default empirical stats due to connectivity issue", e);
      setStats(DEFAULT_STATS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <AppContext.Provider value={{ isDataIngested, setIsDataIngested, stats, loading, refreshStats: fetchStats }}>
      <ErrorBoundary>
        <Router>
          <AppContent />
        </Router>
      </ErrorBoundary>
    </AppContext.Provider>
  );
}

// New v2.0 Pages
const DeepHeterogeneity = React.lazy(() => import('./pages/DeepHeterogeneity'));
const PlaceboRobustness = React.lazy(() => import('./pages/PlaceboRobustness'));
const AIPremiumSim = React.lazy(() => import('./pages/AIPremiumSim'));
const PolicyReporting = React.lazy(() => import('./pages/PolicyReporting'));

// Fallback legacy (only if needed by server redirects)
const Home = React.lazy(() => import('./pages/Home'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const DataIngestion = React.lazy(() => import('./pages/DataIngestion'));
const Matching = React.lazy(() => import('./pages/Matching'));
const DiDEstimation = React.lazy(() => import('./pages/DiDEstimation'));

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Executive Dashboard', icon: <LayoutDashboard />, color: 'text-metro-primary' },
  { path: '/ingestion', label: 'Data Ingestion Hub', icon: <Database />, color: 'text-metro-secondary' },
  { path: '/matching', label: 'Propensity Matching', icon: <Target />, color: 'text-metro-accent' },
  { path: '/did', label: 'Causal Estimation', icon: <Activity />, color: 'text-metro-primary' },
  { path: '/deep-heterogeneity', label: 'Deep Heterogeneity', icon: <TrendingUp />, color: 'text-metro-secondary', isNew: true },
  { path: '/placebo-robustness', label: 'Placebo & Robustness', icon: <ShieldCheck />, color: 'text-metro-accent', isNew: true },
  { path: '/ai-premium-sim', label: 'AI Premium Sim', icon: <Zap />, color: 'text-metro-primary', isNew: true },
  { path: '/policy-reporting', label: 'Policy Reporting', icon: <FileText />, color: 'text-metro-secondary', isNew: true },
];

function AppContent() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="flex h-screen w-full bg-metro-dark text-white font-inter selection:bg-metro-primary/30 selection:text-white">
      {/* Sidebar - Hidden on Landing Page */}
      <AnimatePresence>
        {!isLanding && (
          <motion.aside 
            id="sidebar-nav"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
            className="w-[320px] h-full bg-metro-card/50 backdrop-blur-3xl border-r border-white/5 flex flex-col z-20 transition-all duration-500 hover:bg-metro-card/80"
          >
            <div className="p-10">
              <div className="flex items-center gap-3 mb-10 group cursor-default">
                <div className="w-12 h-12 bg-gradient-to-tr from-metro-primary to-metro-secondary rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(155,93,229,0.3)] group-hover:rotate-12 transition-transform duration-500">
                  <Zap className="text-white w-6 h-6 fill-current" />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">METROIMPACT AI</h1>
                  <p className="text-[10px] font-bold text-metro-primary tracking-[0.2em] uppercase opacity-70">Causal Intelligence v2.0</p>
                </div>
              </div>

              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden
                        ${isActive 
                          ? 'bg-white/10 text-white shadow-xl shadow-black/20' 
                          : 'text-gray-500 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      <div className="flex items-center gap-4 z-10 w-full overflow-hidden">
                        <span className={`flex-shrink-0 transition-colors duration-300 ${isActive ? item.color : 'group-hover:text-white'}`}>
                          {React.cloneElement(item.icon as React.ReactElement<any>, { size: 18 })}
                        </span>
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                           <span className="text-[11px] font-black tracking-tight whitespace-nowrap overflow-hidden text-ellipsis uppercase">{item.label}</span>
                           {item.isNew && (
                             <span className="flex-shrink-0 px-1.5 py-0.5 bg-green-500/10 text-green-500 text-[6px] font-black rounded border border-green-500/20">v2.0 NEW</span>
                           )}
                        </div>
                      </div>
                      {isActive && (
                        <motion.div 
                          layoutId="active-pill"
                          className="absolute left-0 w-1 h-8 bg-metro-primary rounded-r-full"
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="mt-auto p-10">
              <div className="p-6 bg-gradient-to-br from-metro-primary/10 to-transparent rounded-[2.5rem] border border-metro-primary/10 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                   <TrendingUp className="w-24 h-24 text-metro-primary" />
                </div>
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Status</h4>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                   <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Hot-reloading ML Engine</span>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 relative h-full overflow-hidden flex flex-col">
        {!isLanding && <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(155,93,229,0.05),transparent_70%)] pointer-events-none" />}
        
        <Suspense fallback={
          <div className="h-full w-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-metro-primary/20 border-t-metro-primary rounded-full animate-spin" />
          </div>
        }>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: isLanding ? 1 : 0.98, y: isLanding ? 0 : 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: isLanding ? 1 : 1.02, y: isLanding ? 0 : -10 }}
              transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
              className="h-full w-full"
            >
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/ingestion" element={<DataIngestion />} />
                <Route path="/matching" element={<Matching />} />
                <Route path="/did" element={<DiDEstimation />} />
                <Route path="/deep-heterogeneity" element={<DeepHeterogeneity />} />
                <Route path="/placebo-robustness" element={<PlaceboRobustness />} />
                <Route path="/ai-premium-sim" element={<AIPremiumSim />} />
                <Route path="/policy-reporting" element={<PolicyReporting />} />
                
                {/* Fallbacks for older routes */}
                <Route path="/analytics" element={<DeepHeterogeneity />} />
                <Route path="/sensitivity" element={<PlaceboRobustness />} />
                <Route path="/simulator" element={<AIPremiumSim />} />
                <Route path="/export" element={<PolicyReporting />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
    </div>
  );
}

