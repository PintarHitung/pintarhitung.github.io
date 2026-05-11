import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const MobileBottomBar = ({ analytics, onAnalyze, isAnalyzing }) => {
  return (
    <div
      className="sm:hidden fixed bottom-0 left-0 w-full z-50 pb-safe"
      style={{
        background: 'rgba(8,10,15,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-subtle)',
        boxShadow: '0 -16px 48px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        {/* Grand avg */}
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#22d3ee' }}>
            Grand Average
          </p>
          <div className="flex items-end gap-1.5">
            <span className="font-display font-bold text-3xl leading-none mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {analytics.hasData ? analytics.grandAvg : '—'}
            </span>
            {analytics.hasData && analytics.trend > 0 && (
              <span className="text-xs font-semibold mb-0.5 flex items-center gap-0.5" style={{ color: '#10b981' }}>
                <TrendingUp size={12} />
                +{analytics.trend.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onAnalyze}
          disabled={!analytics.hasData || isAnalyzing}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ minWidth: '140px' }}
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.25)" strokeWidth="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Menganalisis…
            </span>
          ) : (
            'Lihat Analisis →'
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default MobileBottomBar;
