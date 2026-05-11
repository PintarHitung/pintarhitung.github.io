import React, { Suspense, lazy, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRapor } from './store/RaporContext';
import { useAnalytics } from './hooks/useAnalytics';
import Header from './components/layout/Header';
import MobileBottomBar from './components/layout/MobileBottomBar';
import InputSection from './features/rapor/InputSection';

const ResultDashboard = lazy(() => import('./features/rapor/ResultDashboard'));

const App = () => {
  const { semesters } = useRapor();
  const analytics = useAnalytics(semesters);
  const [view, setView] = useState('input'); // 'input' | 'result'
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!analytics.hasData) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setView('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 900);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Ambient glow */}
      <div className="ambient-glow" aria-hidden="true" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-5">
        <Header analytics={analytics} view={view} onBack={() => setView('input')} />

        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-6"
            >
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.25)' }}
                >
                  <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(34,211,238,0.25)" strokeWidth="3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="font-semibold text-white">Menganalisis data akademikmu…</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Menghitung trend, konsistensi & insight</p>
              </div>
              {/* Skeleton cards */}
              <div className="w-full space-y-3 mt-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-2xl animate-pulse"
                    style={{ background: 'rgba(255,255,255,0.04)', animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </motion.div>
          ) : view === 'input' ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <InputSection onAnalyze={handleAnalyze} analytics={analytics} />
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense
                fallback={
                  <div className="flex justify-center py-20">
                    <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                  </div>
                }
              >
                <ResultDashboard analytics={analytics} onBack={() => setView('input')} />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile sticky bar (only on input view) */}
      {view === 'input' && (
        <MobileBottomBar
          analytics={analytics}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
        />
      )}
    </div>
  );
};

export default App;
