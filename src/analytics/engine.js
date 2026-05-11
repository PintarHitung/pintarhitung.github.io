// Performance classifier
// icon: string key consumed by ResultDashboard to render Lucide icon
export const classifyPerformance = (grandAvg, trend, consistency) => {
  if (grandAvg >= 90 && consistency >= 80) {
    return { label: 'Academic Excellence', color: 'emerald', bg: 'rgba(16,185,129,0.12)', text: '#10b981', iconId: 'trophy' };
  }
  if (grandAvg >= 85 && trend >= 0) {
    return { label: 'High Achiever', color: 'cyan', bg: 'rgba(34,211,238,0.12)', text: '#22d3ee', iconId: 'award' };
  }
  if (grandAvg >= 78 && consistency >= 70) {
    return { label: 'Stable Performer', color: 'blue', bg: 'rgba(59,130,246,0.12)', text: '#3b82f6', iconId: 'shield-check' };
  }
  if (trend > 0.5) {
    return { label: 'Rising Star', color: 'violet', bg: 'rgba(139,92,246,0.12)', text: '#8b5cf6', iconId: 'trending-up' };
  }
  if (trend < -0.5) {
    return { label: 'Perlu Evaluasi', color: 'amber', bg: 'rgba(245,158,11,0.12)', text: '#f59e0b', iconId: 'circle-alert' };
  }
  return { label: 'Berkembang', color: 'slate', bg: 'rgba(255,255,255,0.06)', text: '#94a3b8', iconId: 'bar-chart-3' };
};

// Badge evaluator
// iconId: string key consumed by Badge atom to render Lucide icon
export const evaluateBadges = ({ trend, consistency, grandAvg, validSems, bestDelta }) => {
  const badges = [];

  if (trend > 1.0)
    badges.push({ id: 'rising', label: 'Trend Positif', iconId: 'trending-up', color: '#10b981', bg: 'rgba(16,185,129,0.12)' });
  if (consistency >= 90)
    badges.push({ id: 'consistent', label: 'Super Konsisten', iconId: 'activity', color: '#22d3ee', bg: 'rgba(34,211,238,0.12)' });
  if (grandAvg >= 90)
    badges.push({ id: 'excellence', label: 'Academic Excellence', iconId: 'trophy', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' });
  if (validSems >= 6)
    badges.push({ id: 'journey', label: 'Veteran 6 Semester', iconId: 'target', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' });
  if (bestDelta >= 5)
    badges.push({ id: 'leap', label: 'Lompatan Besar', iconId: 'zap', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' });
  if (grandAvg >= 85 && trend >= 0 && consistency >= 75)
    badges.push({ id: 'snbp', label: 'Siap SNBP', iconId: 'graduation-cap', color: '#f43f5e', bg: 'rgba(244,63,94,0.12)' });

  return badges;
};

// Smart insight generator
export const generateInsights = ({
  grandAvg,
  trend,
  consistency,
  momentum,
  strongest,
  weakest,
  validSems,
}) => {
  const insights = [];

  // Trend-based
  if (trend > 1.5) {
    insights.push({
      type: 'positive',
      title: 'Momentum Luar Biasa',
      text: `Nilai kamu naik rata-rata ${trend.toFixed(1)} poin setiap semester. Pertahankan ritme ini menuju SNBP!`,
    });
  } else if (trend > 0.3) {
    insights.push({
      type: 'positive',
      title: 'Tren Positif',
      text: `Ada peningkatan konsisten sebesar +${trend.toFixed(1)} per semester. Kamu sedang menuju jalur yang benar.`,
    });
  } else if (trend < -1) {
    insights.push({
      type: 'warning',
      title: 'Perlu Perhatian',
      text: `Nilai cenderung menurun ${Math.abs(trend).toFixed(1)} poin per semester. Identifikasi hambatan belajarmu sekarang.`,
    });
  } else if (trend < 0) {
    insights.push({
      type: 'warning',
      title: 'Waspadai Penurunan',
      text: `Ada sedikit penurunan di semester-semester terakhir. Evaluasi strategi belajar segera.`,
    });
  }

  // Consistency
  if (consistency >= 88) {
    insights.push({
      type: 'positive',
      title: 'Konsistensi Tinggi',
      text: `Skor konsistensimu ${consistency}%. Nilai yang stabil adalah nilai jual utama untuk SNBP.`,
    });
  } else if (consistency < 60 && validSems >= 3) {
    insights.push({
      type: 'warning',
      title: 'Fluktuasi Nilai',
      text: `Nilai kamu cukup berfluktuasi (konsistensi ${consistency}%). SNBP menyukai nilai yang stabil dan meningkat.`,
    });
  }

  // Momentum (recent vs early)
  if (momentum > 2) {
    insights.push({
      type: 'positive',
      title: 'Semester Terbaru Terbaik',
      text: `Performa semester terakhir jauh lebih baik (+${momentum} dari semester awal). Momentum sempurna!`,
    });
  }

  // Subject insights
  if (strongest && weakest && strongest.name !== weakest.name) {
    insights.push({
      type: 'info',
      title: `Mapel Unggulan: ${strongest.name}`,
      text: `Rata-rata ${strongest.avg} — ini kekuatan terbesar kamu. Manfaatkan untuk jurusan yang relevan.`,
    });
    if (weakest.avg < grandAvg - 6) {
      insights.push({
        type: 'warning',
        title: `Perlu Fokus: ${weakest.name}`,
        text: `Nilai ${weakest.avg} (${(grandAvg - weakest.avg).toFixed(1)} di bawah rata-rata). Prioritaskan mapel ini.`,
      });
    }
  }

  // SNBP readiness
  if (grandAvg >= 85 && trend >= 0) {
    insights.push({
      type: 'positive',
      title: 'Peluang SNBP Terbuka',
      text: `Grand average ${grandAvg} dengan tren positif — posisi kamu kompetitif untuk SNBP tahun ini.`,
    });
  }

  return insights.slice(0, 5); // Max 5 insights
};
