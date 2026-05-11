import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, Trophy, TrendingUp } from 'lucide-react';

const Header = ({ analytics, view, onBack }) => {
  return (
    <header className="py-5 flex items-center justify-between" role="banner">
      <div className="flex items-center gap-3">
        {view === 'result' ? (
          <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="p-2 rounded-xl transition-colors"
            style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)' }}
            aria-label="Kembali ke input"
          >
            <ArrowLeft size={18} style={{ color: 'var(--text-secondary)' }} />
          </motion.button>
        ) : (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)' }}
          >
            <BarChart3 size={18} style={{ color: '#22d3ee' }} />
          </div>
        )}
        <div>
          <h1 className="font-display font-bold text-lg leading-none" style={{ color: 'var(--text-primary)' }}>
            PintarHitung
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {view === 'result' ? 'Laporan Analisis Akademik' : 'Academic Progress Analytics'}
          </p>
        </div>
      </div>

      {/* Desktop: Grand avg chip */}
      {analytics.hasData && (
        <div
          className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#22d3ee' }}>
              Grand Average
            </p>
            <p className="font-display font-bold text-2xl leading-none mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {analytics.grandAvg}
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: analytics.grandAvg >= 85
                ? 'rgba(16,185,129,0.15)'
                : analytics.grandAvg >= 75
                ? 'rgba(59,130,246,0.15)'
                : 'rgba(245,158,11,0.15)',
              color: analytics.grandAvg >= 85 ? '#10b981' : analytics.grandAvg >= 75 ? '#3b82f6' : '#f59e0b',
            }}
          >
            {analytics.grandAvg >= 85
              ? <Trophy     size={18} />
              : analytics.grandAvg >= 75
              ? <BarChart3  size={18} />
              : <TrendingUp size={18} />}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
