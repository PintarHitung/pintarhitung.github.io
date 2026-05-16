import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Share2, ArrowLeft,
  TrendingUp, TrendingDown, Minus,
  Trophy, Award, ShieldCheck, BarChart3, CircleAlert,
  Activity, Target, Zap, GraduationCap,
  Sparkles, CircleCheck, Info, Rocket,
} from 'lucide-react';
import { classifyPerformance, evaluateBadges, generateInsights } from '../../analytics/engine';
import SemesterTrendChart from '../../charts/SemesterTrendChart';
import SubjectRadarChart from '../../charts/SubjectRadarChart';

// Map iconId → Lucide component (size 13, consistent)
const ICON_MAP = {
  'trophy':         <Trophy        size={13} />,
  'award':          <Award         size={13} />,
  'shield-check':   <ShieldCheck   size={13} />,
  'trending-up':    <TrendingUp    size={13} />,
  'circle-alert':   <CircleAlert   size={13} />,
  'bar-chart-3':    <BarChart3     size={13} />,
  'activity':       <Activity      size={13} />,
  'target':         <Target        size={13} />,
  'zap':            <Zap           size={13} />,
  'graduation-cap': <GraduationCap size={13} />,
  'rocket':         <Rocket        size={13} />,
};

const getIcon = (iconId) => ICON_MAP[iconId] ?? null;

// Stat icon map — slightly larger for stat cards
const STAT_ICONS = {
  consistency: <Activity   size={14} style={{ opacity: 0.6 }} />,
  momentum:    <TrendingUp size={14} style={{ opacity: 0.6 }} />,
  momentumNeg: <TrendingDown size={14} style={{ opacity: 0.6 }} />,
  strongest:   <Award      size={14} style={{ opacity: 0.6 }} />,
  weakest:     <Target     size={14} style={{ opacity: 0.6 }} />,
};

// Insight type → icon
const INSIGHT_ICONS = {
  positive: <CircleCheck size={13} />,
  warning:  <CircleAlert size={13} />,
  info:     <Info        size={13} />,
};

// ─── Atoms ───────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, color = '#22d3ee', icon }) => (
  <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <div className="flex items-center justify-between mb-1">
      <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
      {icon && (
        <span style={{ color: 'var(--text-muted)' }}>
          {icon}
        </span>
      )}
    </div>
    <p className="font-display font-bold text-2xl" style={{ color }}>{value}</p>
    {sub && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
  </div>
);

const InsightCard = ({ insight }) => {
  const colors = {
    positive: { border: '#10b981', bg: 'rgba(16,185,129,0.06)', iconColor: '#10b981' },
    warning:  { border: '#f59e0b', bg: 'rgba(245,158,11,0.06)',  iconColor: '#f59e0b' },
    info:     { border: '#3b82f6', bg: 'rgba(59,130,246,0.06)',  iconColor: '#3b82f6' },
  };
  const c = colors[insight.type] || colors.info;
  return (
    <div
      className="p-4 rounded-xl"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}20`,
        borderLeftWidth: '3px',
        borderLeftColor: c.border,
        borderLeftStyle: 'solid',
      }}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <span style={{ color: c.iconColor, flexShrink: 0 }}>
          {INSIGHT_ICONS[insight.type]}
        </span>
        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          {insight.title}
        </p>
      </div>
      <p className="text-xs leading-relaxed pl-5" style={{ color: 'var(--text-secondary)' }}>
        {insight.text}
      </p>
    </div>
  );
};

const Badge = ({ badge }) => (
  <div
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
    style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.color}30` }}
  >
    <span style={{ opacity: 0.9 }}>
      {getIcon(badge.iconId)}
    </span>
    {badge.label}
  </div>
);

const DevSection = () => (
  <div
    className="rounded-2xl p-5 mt-2"
    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
  >
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <p
          className="text-[10px] font-semibold uppercase tracking-widest mb-1.5"
          style={{ color: 'var(--text-muted)' }}
        >
          Crafted by
        </p>
        <p className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
          @fawwazdzaky
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          PintarHitung v3.0 · Build in public · 2026
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Feature requests & changelog via Instagram
        </p>
      </div>
      <a
        href="https://www.instagram.com/fawwazdzaaky/"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-ghost text-sm"
        style={{ flexShrink: 0 }}
      >
        <svg
          width="14" height="14"
          viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
        Development Updates
      </a>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const ResultDashboard = ({ analytics, onBack }) => {
  const shareRef = useRef(null);

  const classification = classifyPerformance(
    analytics.grandAvg,
    analytics.trend,
    analytics.consistency
  );

  const badges = evaluateBadges({
    trend:       analytics.trend,
    consistency: analytics.consistency,
    grandAvg:    analytics.grandAvg,
    validSems:   analytics.validSems,
    bestDelta:   analytics.bestDelta,
  });

  const insights = generateInsights({
    grandAvg:   analytics.grandAvg,
    trend:      analytics.trend,
    consistency: analytics.consistency,
    momentum:   analytics.momentum,
    strongest:  analytics.strongest,
    weakest:    analytics.weakest,
    validSems:  analytics.validSems,
  });

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: 'PintarHitung — Analisis Raportku',
        text: `Grand Average raportku: ${analytics.grandAvg} (${classification.label}). Analisis lengkap di PintarHitung!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(
        `Grand Average raportku: ${analytics.grandAvg} — PintarHitung\n${window.location.href}`
      );
    }
  }, [analytics.grandAvg, classification.label]);

  const trendIcon =
    analytics.trend > 0.2
      ? <TrendingUp   size={14} style={{ color: '#10b981' }} />
      : analytics.trend < -0.2
      ? <TrendingDown size={14} style={{ color: '#f43f5e' }} />
      : <Minus        size={14} style={{ color: '#94a3b8' }} />;

  const trendColor =
    analytics.trend > 0.2 ? '#10b981' : analytics.trend < -0.2 ? '#f43f5e' : '#94a3b8';

  return (
    <section className="pb-10 space-y-5" aria-label="Dashboard Analisis Akademik">

      {/* Hero score card */}
      <div
        ref={shareRef}
        className="share-card w-full"
        style={{ borderRadius: 'var(--radius-xl)' }}
      >
        {/* Classification badge */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: classification.bg,
              color: classification.text,
              border: `1px solid ${classification.text}30`,
            }}
          >
            {getIcon(classification.iconId)}
            {classification.label}
          </div>
          <button onClick={handleShare} className="btn-ghost text-xs py-1.5 px-3">
            <Share2 size={13} /> Bagikan
          </button>
        </div>

        {/* Grand score */}
        <div className="mb-4">
          <p
            className="text-[10px] uppercase tracking-widest font-semibold mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Grand Average Raport
          </p>
          <div className="flex items-end gap-3">
            <p
              className="font-display font-bold leading-none"
              style={{ fontSize: 'clamp(3rem,12vw,5rem)', color: 'var(--text-primary)' }}
            >
              {analytics.grandAvg}
            </p>
            <div
              className="mb-2 flex items-center gap-1 text-sm font-semibold"
              style={{ color: trendColor }}
            >
              {trendIcon}
              {analytics.trend > 0.05
                ? `+${analytics.trend.toFixed(2)}/sem`
                : analytics.trend < -0.05
                ? `${analytics.trend.toFixed(2)}/sem`
                : 'Stabil'}
            </div>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {analytics.validSems} semester · Konsistensi {analytics.consistency}%
          </p>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => <Badge key={b.id} badge={b} />)}
          </div>
        )}
      </div>

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Konsistensi"
          value={`${analytics.consistency}%`}
          sub="Stabilitas nilai"
          color="#22d3ee"
          icon={STAT_ICONS.consistency}
        />
        <StatCard
          label="Momentum"
          value={analytics.momentum > 0 ? `+${analytics.momentum}` : `${analytics.momentum}`}
          sub="Akhir vs Awal"
          color={analytics.momentum > 0 ? '#10b981' : '#f59e0b'}
          icon={analytics.momentum > 0 ? STAT_ICONS.momentum : STAT_ICONS.momentumNeg}
        />
        {analytics.strongest && (
          <StatCard
            label="Mapel Terkuat"
            value={analytics.strongest.avg}
            sub={analytics.strongest.name}
            color="#8b5cf6"
            icon={STAT_ICONS.strongest}
          />
        )}
        {analytics.weakest && analytics.weakest.name !== analytics.strongest?.name && (
          <StatCard
            label="Perlu Fokus"
            value={analytics.weakest.avg}
            sub={analytics.weakest.name}
            color="#f59e0b"
            icon={STAT_ICONS.weakest}
          />
        )}
      </div>

      {/* Trend chart */}
      {analytics.trendData.length >= 2 && (
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(34,211,238,0.12)' }}
            >
              <TrendingUp size={14} style={{ color: '#22d3ee' }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Tren Nilai Semester
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Progres akademik per semester
              </p>
            </div>
          </div>
          <SemesterTrendChart trendData={analytics.trendData} grandAvg={analytics.grandAvg} />
        </div>
      )}

      {/* Radar chart */}
      {analytics.radarData.length >= 3 && (
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(139,92,246,0.12)' }}
            >
              <Activity size={14} style={{ color: '#8b5cf6' }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Profil Kekuatan Mapel
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Top {analytics.radarData.length} mata pelajaran
              </p>
            </div>
          </div>
          <SubjectRadarChart radarData={analytics.radarData} />
        </div>
      )}

      {/* Smart Insights */}
      {insights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <Sparkles size={14} style={{ color: '#22d3ee', opacity: 0.8 }} />
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              Smart Insight
            </p>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee' }}
            >
              {insights.length} analisis
            </span>
          </div>
          <div className="space-y-2.5">
            {insights.map((ins, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <InsightCard insight={ins} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Developer section */}
      <DevSection />

      {/* Back button */}
      <button onClick={onBack} className="btn-ghost w-full py-3.5">
        <ArrowLeft size={16} /> Edit Data Nilai
      </button>
    </section>
  );
};

export default ResultDashboard;
